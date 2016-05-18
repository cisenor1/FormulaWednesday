using FWMobile.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure
{
    public interface IFirebaseService
    {
        Task<User> GetUserInfo(string email, string password);

        Task<IList<Challenge>> GetChallenges(string token);

        Task<IList<Race>> GetRaces(string token, int year);

        Task<IList<Driver>> GetDrivers(string token);

        Task<IDictionary<string, string>> GetUserChoices(string token, string userKey, string raceKey, int year);
    }
}
