using FWMobile.Infrastructure.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure.Services
{
    class FirebaseService : IFirebaseService
    {
        private string _authBaseUrl = "https://auth.firebase.com/v2/project-8891868983959640294/auth/password";
        private string _basePath = "https://project-8891868983959640294.firebaseio.com/";

        private JsonSerializerSettings _jsonSettings = new JsonSerializerSettings()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public async Task<User> GetUserInfo(string email, string password)
        {
            User user = null;
            var loginInfo = await GetLoginInfo(email, password);
            if (loginInfo == null)
            {
                throw new InvalidOperationException("Invalid email and password provided. Cannot authenticate.");
            }
            var userKey = GetKeyFromEmail(email);
            var userUrl = _basePath + "users/" + userKey + ".json?auth=" + loginInfo.Token;
            
            using (var client = new HttpClient())
            {
                var userResponse = await client.GetAsync(userUrl);
                if (!userResponse.IsSuccessStatusCode)
                {
                    throw new InvalidOperationException("User does not exist in system. Please contact an administrator.");
                }
                var userString = await userResponse.Content.ReadAsStringAsync();
                user = JsonConvert.DeserializeObject<User>(userString, _jsonSettings);
                user.Token = loginInfo.Token;
                user.ProfileImageURL = loginInfo.Password.ProfileImageURL;
            }
            return user;
        }

        private async Task<FirebaseLoginInfo> GetLoginInfo(string email, string password)
        {
            FirebaseLoginInfo loginInfo = null;
            using (var client = new HttpClient())
            {
                IDictionary<string, string> collection = new Dictionary<string, string>()
                {
                    ["email"] = email,
                    ["password"] = password
                };
                var content = new FormUrlEncodedContent(collection);
                var requestUrl = _authBaseUrl + "?" + await content.ReadAsStringAsync();
                using (var response = await client.GetAsync(requestUrl))
                {
                    if (response.IsSuccessStatusCode)
                    {
                        var responseText = await response.Content.ReadAsStringAsync();
                        loginInfo = JsonConvert.DeserializeObject<FirebaseLoginInfo>(responseText, _jsonSettings);
                    }
                }
            }
            return loginInfo;
        }

        private static string GetKeyFromEmail(string email)
        {
            var split = email.Split('@')[0].Split('.');
            var cleaned = string.Join("", split);
            return cleaned;
        }

        public async Task<IList<Race>> GetRaces(string token, int year)
        {
            var raceUrl = _basePath + "races/" + year.ToString() + ".json?auth=" + token;
            var races = new List<Race>();
            using (var client = new HttpClient())
            using (var response = await client.GetAsync(raceUrl))
            {
                var responseString = await response.Content.ReadAsStringAsync();
                var racesToken = JsonConvert.DeserializeObject<JToken>(responseString);
                foreach (JProperty raceProperty in racesToken.Children())
                {
                    var key = raceProperty.Name;
                    if (raceProperty.HasValues)
                    {
                        var raceToken = raceProperty.Children().FirstOrDefault();
                        if (raceToken != null)
                        {
                            var race = new Race();
                            race.City = raceToken.Value<string>("city");
                            race.Country = raceToken.Value<string>("country");
                            var dateString = raceToken.Value<string>("date");
                            if (!string.IsNullOrWhiteSpace(dateString))
                            {
                                race.Date = DateTime.Parse(dateString);
                            }
                            var cutoffString = raceToken.Value<string>("cutoff");
                            if (!string.IsNullOrWhiteSpace(cutoffString))
                            {
                                race.Cutoff = DateTime.Parse(cutoffString);
                            }
                            race.Title = raceToken.Value<string>("title");
                            race.Key = key;
                            races.Add(race);
                        }
                    }
                }
            }

            return races;
        }

        public async Task<IList<Challenge>> GetChallenges(string token)
        {
            IList<Challenge> challenges = new List<Challenge>();
            var challengesUrl = _basePath + "challenges.json?auth=" + token;
            using (var client = new HttpClient())
            using (var response = await client.GetAsync(challengesUrl))
            {
                var responseJson = await response.Content.ReadAsStringAsync();
                var challengesToken = JsonConvert.DeserializeObject<JToken>(responseJson);
                foreach (JProperty challengeProperty in challengesToken.Children())
                {
                    var key = challengeProperty.Name;
                    if (challengeProperty.HasValues)
                    {
                        var challengeToken = challengeProperty.Children().FirstOrDefault();
                        if (challengeToken != null)
                        {
                            var challenge = new Challenge();
                            challenge.Message = challengeToken.Value<string>("message");
                            challenge.Value = challengeToken.Value<int>("value");
                            challenge.Description = challengeToken.Value<string>("description");
                            challenge.Type = challengeToken.Value<string>("type");
                            challenge.Key = key;
                            challenges.Add(challenge);
                        }
                    }
                }
            }

            return challenges;
        }

        public async Task<IDictionary<string, string>> GetUserChoices(string token, string userKey, string raceKey, int year)
        {
            IDictionary<string, string> choices = new Dictionary<string, string>();

            var choiceUrl = _basePath + "users/" + userKey + "/results/" + year.ToString() + "/" + raceKey + ".json?auth=" + token;

            using (var client = new HttpClient())
            using (var response = await client.GetAsync(choiceUrl))
            {
                if (!response.IsSuccessStatusCode)
                {
                    return choices;
                }
                var responseString = await response.Content.ReadAsStringAsync();
                if (string.IsNullOrWhiteSpace(responseString))
                {
                    return choices;
                }
                var tokens = JsonConvert.DeserializeObject<JToken>(responseString);
                if (tokens != null && tokens.HasValues)
                {
                    foreach (JProperty prop in tokens.Children())
                    {
                        var key = prop.Name;
                        var value = tokens.Value<string>(key);
                        choices.Add(key, value);
                    }
                }
            }

            return choices;
        }

        public async Task<IList<Driver>> GetDrivers(string token)
        {
            IList<Driver> drivers = new List<Driver>();

            var driverUrl = _basePath + "drivers.json?auth=" + token;

            using (var client = new HttpClient())
            using (var response = await client.GetAsync(driverUrl))
            {
                if (!response.IsSuccessStatusCode)
                {
                    return drivers;
                }
                var responseString = await response.Content.ReadAsStringAsync();
                var driverTokens = JsonConvert.DeserializeObject<JToken>(responseString);

                foreach (JProperty prop in driverTokens.Children())
                {
                    var key = prop.Name;
                    JToken driverToken = driverTokens.Value<JToken>(key);
                    var driver = new Driver();
                    driver.Key = key;
                    driver.Name = driverToken.Value<string>("name");
                    driver.TeamName = driverToken.Value<string>("team");
                    driver.Points = driverToken.Value<int>("points");
                    driver.Active = driverToken.Value<int>("active");
                    drivers.Add(driver);
                }
            }

            return drivers;
        }

        public async Task<bool> SaveUserChoices(string token, string userKey, string raceKey, int year, IDictionary<string, string> picks)
        {
            var choiceUrl = _basePath + "users/" + userKey + "/results/" + year.ToString() + "/" + raceKey + ".json?auth=" + token;

            var pickString = JsonConvert.SerializeObject(picks);
            var content = new StringContent(pickString);
            bool success = false;
            using (var client = new HttpClient())
            using (var response = await client.PutAsync(choiceUrl, content))
            {
                success = response.IsSuccessStatusCode;
                var responseString = response.Content.ReadAsStringAsync();
            }

            return success;
        }

        public async Task<IList<BlogPost>> GetBlogPosts()
        {
            var blogUrl = _basePath + "blogPosts.json";

            IList<BlogPost> posts = new List<BlogPost>();
            using (var client = new HttpClient())
            using (var response = await client.GetAsync(blogUrl))
            {
                var responseString = await response.Content.ReadAsStringAsync();
                var postsToken = JsonConvert.DeserializeObject<JToken>(responseString);
                foreach (JProperty prop in postsToken)
                {
                    var key = prop.Name;
                    var blogPost = new BlogPost();
                    JToken postToken = postsToken.Value<JToken>(key);
                    blogPost.Key = key;
                    string message = postToken.Value<string>("message");
                    message = WebUtility.UrlDecode(message);
                    message = message.Replace("<b>", "");
                    message = message.Replace("</b>", "");
                    var split = message.Split(new string[2] { "<br/>", "\n" }, StringSplitOptions.RemoveEmptyEntries);
                    message = string.Join(Environment.NewLine, split);
                    blogPost.Message = message;
                    blogPost.Title = postToken.Value<string>("title");
                    string tss = postToken.Value<string>("timestamp");
                    long ts;
                    if (long.TryParse(tss, out ts))
                    {
                        blogPost.Timestamp = Utilities.DateUtilities.UnixTimeStampToDateTime(ts);
                    }
                    blogPost.User = postToken.Value<string>("user");
                    posts.Add(blogPost);
                }

            }
            return posts;
        }
    }

    class FirebaseLoginInfo
    {
        public string Provider { get; set; }
        public string Token { get; set; }
        public string Uid { get; set; }
        public FirebasePasswordInfo Password { get; set; }
    }

    class FirebasePasswordInfo
    {
        public string Email { get; set; }
        public bool IsTemporaryPassword { get; set; }
        public string ProfileImageURL { get; set; }
    }
}
