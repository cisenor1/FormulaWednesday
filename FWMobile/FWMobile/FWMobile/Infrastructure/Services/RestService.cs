using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FWMobile.Infrastructure.Models;

namespace FWMobile.Infrastructure.Services
{
    public class RestService : IRestService
    {
        public Task<IList<BlogPost>> GetBlogPosts()
        {
            throw new NotImplementedException();
        }

        public Task<IList<Challenge>> GetChallenges(string token)
        {
            throw new NotImplementedException();
        }

        public Task<IList<Driver>> GetDrivers(string token)
        {
            throw new NotImplementedException();
        }

        public Task<IList<Race>> GetRaces(string token, int year)
        {
            throw new NotImplementedException();
        }

        public Task<IDictionary<string, string>> GetUserChoices(string token, string userKey, string raceKey, int year)
        {
            throw new NotImplementedException();
        }

        public Task<User> GetUserInfo(string email, string password)
        {
            throw new NotImplementedException();
        }

        public Task<bool> SaveUserChoices(string token, string userKey, string raceKey, int year, IDictionary<string, string> picks)
        {
            throw new NotImplementedException();
        }
    }
}
