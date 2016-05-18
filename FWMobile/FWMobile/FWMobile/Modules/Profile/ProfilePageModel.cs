using Acr.UserDialogs;
using FWMobile.Infrastructure;
using FWMobile.Infrastructure.Models;
using PropertyChanged;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;

namespace FWMobile.Modules.Profile
{
    [ImplementPropertyChanged]
    public class ProfilePageModel : FreshMvvm.FreshBasePageModel
    {
        private IUserManager _userManager { get; set; }
        private IUserDialogs _userDialogs { get; set; }
        public bool LoggedIn { get; set; } = false;
        public User User { get; set; }

        public Command LoginCommand { get; set; }
        public Command LogoutCommand { get; set; }

        public ProfilePageModel(IUserManager userManager, IUserDialogs userDialogs)
        {
            _userManager = userManager;
            _userDialogs = userDialogs;
        }

        public override void Init(object initData)
        {
            base.Init(initData);
            LoginCommand = new Command(LoginUser);
            LogoutCommand = new Command(Logout);
        }

        private async void LoginUser()
        {
            LoginConfig lc = new LoginConfig()
            {
                LoginPlaceholder = "email",
                Title = "Formula Wednesday",
                PasswordPlaceholder = "password"
            };
            var r = await _userDialogs.LoginAsync(lc);
            if (r.Ok)
            {
                _userDialogs.ShowLoading("Logging In");
                try
                {
                    var user = await _userManager.LoginUser(r.LoginText, r.Password);
                    if (!_userManager.IsAnonymous(user))
                    {
                        LoggedIn = true;
                    }
                }
                catch (Exception ex)
                {
                    System.Diagnostics.Debug.WriteLine(ex.Message);
                }
                finally
                {
                    _userDialogs.HideLoading();
                }
                if (!LoggedIn)
                {
                    _userDialogs.ShowError("Invalid email or password.");
                }
            }
        }

        protected async override void ViewIsAppearing(object sender, EventArgs e)
        {
            base.ViewIsAppearing(sender, e);

            if (User == null)
            {
                _userDialogs.ShowLoading("Loading user info", MaskType.Gradient);
                var user = await _userManager.GetUser();
                _userDialogs.HideLoading();
                User = user;
                // We don't have a saved user, so we'll need to show the login form.
                if (_userManager.IsAnonymous(user))
                {
                    LoggedIn = false;
                }
                else
                {
                    LoggedIn = true;
                }
            }
        }

        public async void Logout()
        {
            LoggedIn = false;
            var complete = await _userManager.LogoutUser();
        }
    }
}
