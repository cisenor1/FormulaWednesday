using FWMobile.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure
{
    public interface IRestService
    {
        Task<User> GetUserInfo(string email, string password);

        Task<IList<Challenge>> GetChallenges(string token, string raceKey);

        Task<IList<Race>> GetRaces(string token, int year);

        Task<IList<Driver>> GetDrivers(string token);

        Task<IDictionary<string, string>> GetUserChoices(string token, string userKey, string raceKey, int year);

        Task<bool> SaveUserChoices(string token, string userKey, string raceKey, int year, IDictionary<string, string> picks);

        Task<IList<BlogPost>> GetBlogPosts();
    }
}
