﻿using FWMobile.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure.Services
{
    public class DataService : IDataService
    {
        private IFirebaseService _firebaseService;

        private IList<Challenge> _challenges { get; set; }
        private IList<Race> _races { get; set; }
        private IList<Driver> _drivers { get; set; }

        public async Task<IList<Challenge>> GetGenericChallenges(User user)
        {
            if (_challenges == null)
            {
                if (!string.IsNullOrWhiteSpace(user.Token))
                {
                    _challenges = await _firebaseService.GetChallenges(user.Token);
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
                    _races = await _firebaseService.GetRaces(user.Token, DateTime.Now.Year);
                }
            }

            return _races;
        }

        public async Task<IDictionary<Challenge, string>> GetRaceChoices(User user, Race race)
        {
            Dictionary<Challenge, string> choices = new Dictionary<Challenge, string>();

            var challenges = await GetGenericChallenges(user);
            var drivers = await GetDrivers(user);

            if (!string.IsNullOrWhiteSpace(user.Token))
            {
                var choiceList = await _firebaseService.GetUserChoices(user.Token, user.Key, race.Key, DateTime.Now.Year);
                foreach (var challenge in challenges)
                {
                    var choice = choiceList.FirstOrDefault(x => x.Key == challenge.Key);
                    if (!string.IsNullOrWhiteSpace(choice.Value))
                    {
                        choices.Add(challenge, choice.Value);
                    }
                    else
                    {
                        choices.Add(challenge, string.Empty);
                    }
                }
            }

            return choices;
        }

        public async Task<IList<Driver>> GetDrivers(User user)
        {
            if (_drivers == null)
            {
                _drivers = await _firebaseService.GetDrivers(user.Token);
            }
            return _drivers;
        }

        public DataService(IFirebaseService firebaseService)
        {
            _firebaseService = firebaseService;
        }
    }
}
