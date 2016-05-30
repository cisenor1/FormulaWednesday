using Newtonsoft.Json;
using PropertyChanged;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure.Models
{
    [ImplementPropertyChanged]
    public class User
    {
        public string DisplayName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; }
        public int Points { get; set; }
        public string Email { get; set; }
        public string Key { get; set; }
        [JsonIgnore]
        public string Token { get; set; }
        [JsonIgnore]
        public string ProfileImageURL { get; set; }
        [JsonIgnore]
        public bool IsAnonymous { get; set; }
    }
}
