using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FWMobile.Infrastructure.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Net.Http;
using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;

namespace FWMobile.Infrastructure.Services
{
    public class RestService : IRestService
    {
        private string _baseUrl = "http://192.168.0.15:3000";
        private JsonSerializerSettings _jsonSettings = new JsonSerializerSettings()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        public Task<IList<BlogPost>> GetBlogPosts()
        {
            var blogPost = new BlogPost()
            {
                Message = "Test",
                Title = "Test",
                User = "Derrick"
            };
            IList<BlogPost> blogs = new List<BlogPost>();
            blogs.Add(blogPost);
            return Task.FromResult(blogs);
        }

        public async Task<IList<Challenge>> GetChallenges(string token, string raceKey)
        {
            string challengesUrl = _baseUrl + "/challenges/" + DateTime.Now.Year + "/" + raceKey;
            AuthenticationHeaderValue authHeaders = new AuthenticationHeaderValue("Bearer", token);
            IList<Challenge> challenges = null;
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = authHeaders;
                var response = await client.GetAsync(challengesUrl);
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    challenges = JsonConvert.DeserializeObject<IList<Challenge>>(responseString);
                }
            }
            return challenges;
        }

        public Task<IList<Driver>> GetDrivers(string token)
        {
            throw new NotImplementedException();
        }

        public async Task<IList<Race>> GetRaces(string token, int year)
        {
            AuthenticationHeaderValue authHeaders = new AuthenticationHeaderValue("Bearer", token);
            var raceUrl = _baseUrl + "/races/" + year.ToString();
            IList<Race> races = null;
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = authHeaders;
                var response = await client.GetAsync(raceUrl);
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    races = JsonConvert.DeserializeObject<IList<Race>>(responseString, _jsonSettings);
                }
            }

            return races;
        }

        public async Task<IDictionary<string, string>> GetUserChoices(string token, string userKey, string raceKey, int year)
        {
            IDictionary<string, string> userChoices = null;
            AuthenticationHeaderValue authHeaders = new AuthenticationHeaderValue("Bearer", token);
            var choicesUrl = _baseUrl + "/challenges/" + year.ToString() + "/" + raceKey + "/" + userKey + "/picks";
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = authHeaders;
                var response = await client.GetAsync(choicesUrl);
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    var choices = JsonConvert.DeserializeObject<IList<KeyValuePair<string, string>>>(responseString);
                    userChoices = choices.ToDictionary(pair => pair.Key, pair => pair.Value);
                }
            }

            return userChoices;
        }

        public async Task<User> GetUserInfo(string email, string password)
        {
            User user = null;
            var loginUrl = _baseUrl + "/users/authenticate";

            IDictionary<string, string> collection = new Dictionary<string, string>()
            {
                ["email"] = email,
                ["password"] = password
            };
            var content = new FormUrlEncodedContent(collection);
            string idToken = string.Empty;
            string userKey = string.Empty;
            using (var client = new HttpClient())
            {
                var response = await client.PostAsync(loginUrl, content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    var credToken = JsonConvert.DeserializeObject<JToken>(responseString);
                    idToken = credToken.Value<string>("id_token");
                    userKey = credToken.Value<string>("key");
                }
            }

            if (string.IsNullOrWhiteSpace(idToken) || string.IsNullOrWhiteSpace(userKey))
            {
                throw new InvalidOperationException("Invalid credentials.");
            }

            AuthenticationHeaderValue authHeaders = new AuthenticationHeaderValue("Bearer", idToken);
            string userUrl = _baseUrl + "/users/" + userKey;

            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Authorization = authHeaders;
                var response = await client.GetAsync(userUrl);
                if (response.IsSuccessStatusCode)
                {
                    var responseString = await response.Content.ReadAsStringAsync();
                    user = JsonConvert.DeserializeObject<User>(responseString, _jsonSettings);
                    user.Token = idToken;
                }
            }

            return user;
        }

        public Task<bool> SaveUserChoices(string token, string userKey, string raceKey, int year, IDictionary<string, string> picks)
        {
            throw new NotImplementedException();
        }
    }
}
