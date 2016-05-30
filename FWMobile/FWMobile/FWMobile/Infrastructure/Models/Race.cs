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
    public class Race
    {
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public DateTime Cutoff { get; set; }
        public string Country { get; set; }
        public string City { get; set; }
        public Driver Winner { get; set; }
        public string Key { get; set; }
    }
}
