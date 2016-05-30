using FWMobile.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure
{
    public interface IUserManager
    {
        Task<User> GetUser();

        Task<User> LoginUser(string email, string password);

        Task<bool> LogoutUser();

        bool IsAnonymous(User user);
    }
}
