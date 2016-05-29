using PropertyChanged;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure.Models
{
    [ImplementPropertyChanged]
    public class Challenge
    {
        public string Key { get; set; }
        public string Message { get; set; }
        public int Value { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public IList<Driver> DriverChoices { get; set; }
    }
}
