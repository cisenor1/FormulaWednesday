using FWMobile.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure
{
    public interface IDataService
    {
        Task<IList<Challenge>> GetGenericChallenges(User user);

        Task<IList<Race>> GetRaces(User user);

        Task<IList<Driver>> GetDrivers(User user);

        Task<IDictionary<Challenge, Driver>> GetRaceChoices(User user, Race race);
    }
}
