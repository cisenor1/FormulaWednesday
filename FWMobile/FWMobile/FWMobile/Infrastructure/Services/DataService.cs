using FWMobile.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure.Services
{
    public class DataService : IDataService
    {
        private IRestService _restService;

        private IList<Challenge> _challenges { get; set; }
        private IList<Race> _races { get; set; }
        private IList<Driver> _drivers { get; set; }

        public async Task<IList<Challenge>> GetGenericChallenges(User user)
        {
            if (_challenges == null)
            {
                if (!string.IsNullOrWhiteSpace(user.Token))
                {
                    _challenges = await _restService.GetChallenges(user.Token, null);
                }
            }

            return _challenges;
        }

        public async Task<IList<Race>> GetRaces(User user)
        {
            if (_races == null)
            {
                if (!string.IsNullOrWhiteSpace(user.Token))
                {
                    _races = await _restService.GetRaces(user.Token, DateTime.Now.Year);
                }
            }

            return _races;
        }

        public async Task<IDictionary<Challenge, Driver>> GetRaceChoices(User user, Race race)
        {
            Dictionary<Challenge, Driver> choices = new Dictionary<Challenge, Driver>();
            
            if (!string.IsNullOrWhiteSpace(user.Token))
            {
                var challenges = await _restService.GetChallenges(user.Token, race.Key);
                var userChoices = await _restService.GetUserChoices(user.Token, user.Key, race.Key, DateTime.Now.Year);
                foreach (var challenge in challenges)
                {
                    if (userChoices.ContainsKey(challenge.Key))
                    {
                        var driverKey = userChoices[challenge.Key];
                        var userPick = challenge.DriverChoices.FirstOrDefault(x => x.Key == driverKey);
                        choices.Add(challenge, userPick);
                    }
                    else
                    {
                        choices.Add(challenge, null);
                    }
                }
            }

            return choices;
        }

        public async Task<IList<Driver>> GetDrivers(User user)
        {
            if (_drivers == null)
            {
                _drivers = await _restService.GetDrivers(user.Token);
            }
            return _drivers;
        }

        public async Task<bool> SaveUserChoices(User user, Race race, IDictionary<Challenge, Driver> picks)
        {
            IDictionary<string, string> challengeDriverPicks = new Dictionary<string, string>();
            foreach (var pick in picks)
            {
                var challenge = pick.Key;
                var driver = pick.Value;
                
                if (driver != null)
                {
                    challengeDriverPicks.Add(challenge.Key, driver.Key);
                }
                else
                {
                    challengeDriverPicks.Add(challenge.Key, string.Empty);
                }
            }

            bool success = await _restService.SaveUserChoices(user.Token, user.Key, race.Key, DateTime.Now.Year, challengeDriverPicks);

            return true;
        }

        public async Task<IList<BlogPost>> GetBlogPosts()
        {
            List<BlogPost> blogs = (await _restService.GetBlogPosts()).ToList();
            blogs.Sort(delegate (BlogPost x, BlogPost y)
            {
                return x.PostDate.CompareTo(y.PostDate);
            });
            return blogs;
        }

        public DataService(IRestService restService)
        {
            _restService = restService;
        }
    }
}
