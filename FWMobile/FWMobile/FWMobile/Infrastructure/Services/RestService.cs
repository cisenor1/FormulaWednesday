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

namespace FWMobile.Infrastructure.Services
{
    public class RestService : IRestService
    {
        private string _baseUrl = "http://192.168.0.15:3000/";
        private JsonSerializerSettings _jsonSettings = new JsonSerializerSettings()
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };
        
        public Task<IList<BlogPost>> GetBlogPosts()
        {
            var blogPost = new BlogPost()
            {
                Message =  "Test",
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
