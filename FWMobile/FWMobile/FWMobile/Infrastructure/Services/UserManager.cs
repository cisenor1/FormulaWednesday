using System;
using System.Collections.Generic;
using System.Text;
using FWMobile.Infrastructure.Models;
using System.Threading.Tasks;
using Xamarin.Auth;
using Xamarin.Forms;
using System.Linq;
using System.Threading;

namespace FWMobile.Infrastructure.Services
{
    public class UserManager : IUserManager
    {
        private IRestService _service;
        private User _user;

        private Semaphore _retrievingUserSemaphore = new Semaphore(1, 1);

        public async Task<User> GetUser()
        {
            _retrievingUserSemaphore.WaitOne();
            try
            {
                if (IsAnonymous(_user))
                {
                    var credentials = GetSavedCredential();

                    if (credentials != null)
                    {
                        var user = await _service.GetUserInfo(credentials.UserName, credentials.Password);
                        if (!IsAnonymous(user))
                        {
                            FillCachedUser(user);
                        }
                    }
                }
                return _user;
            }
            finally
            {
                _retrievingUserSemaphore.Release();
            }
        }

        public async Task<User> LoginUser(string email, string password)
        {
            var md5Password = EasyEncryption.MD5.ComputeMD5Hash(password);
            var user = await _service.GetUserInfo(email, md5Password);
            if (user != null)
            {
                FillCachedUser(user);
                SaveCredentials(user, md5Password);
            }
            else
            {
                MakeCachedUserAnon();
            }
            return _user;
        }

        public async Task<bool> LogoutUser()
        {
            await DeleteCredentials();
            MakeCachedUserAnon();
            return true;
        }

        public bool IsAnonymous(User user)
        {
            if (string.IsNullOrWhiteSpace(user.Token))
            {
                return true;
            }
            return false;
        }

        public UserManager(IRestService service)
        {
            _service = service;
            _user = new User()
            {
                DisplayName = "anonymous",
                Email = "example@example.com"
            };

            Task.Run(() =>
            {
                GetUser();
            });
        }

        private void SaveCredentials(User user, string password)
        {
            if (user != null)
            {
                Account account = new Account
                {
                    Username = user.Email
                };

                account.Properties.Add("password", password);
                AccountStore.Create().Save(account, "FWMobile");
            }
        }

        private async Task DeleteCredentials()
        {
            var accountsList = await AccountStore.Create().FindAccountsForServiceAsync("FWMobile");
            if (accountsList == null)
            {
                return;
            }
            foreach (var account in accountsList)
            {
                AccountStore.Create().Delete(account, "FWMobile");
            }
        }

        private void FillCachedUser(User user)
        {
            _user.Token = user.Token;
            _user.Points = user.Points;
            _user.FirstName = user.FirstName;
            _user.ProfileImageURL = user.ProfileImageURL;
            _user.DisplayName = user.DisplayName;
            _user.Email = user.Email;
            _user.Key = user.Key;
        }

        private void MakeCachedUserAnon()
        {
            _user.Key = "";
            _user.FirstName = "Anonymous User";
            _user.Role = "";
            _user.Points = -1;
            _user.ProfileImageURL = "";
            _user.Token = "";
            _user.Email = "example@example.com";
            _user.DisplayName = "anonymous";
        }

        private Credential GetSavedCredential()
        {
            Credential cred = null;

            var account = AccountStore.Create().FindAccountsForService("FWMobile").FirstOrDefault();

            if (account != null)
            {
                cred = new Credential();
                cred.UserName = account.Username;
                cred.Password = account.Properties["password"];
            }

            return cred;
        }
    }

    public class Credential
    {
        public string UserName { get; set; }
        public string Password { get; set; }
    }
}
