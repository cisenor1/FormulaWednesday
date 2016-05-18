using PropertyChanged;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure.Models
{
    [ImplementPropertyChanged]
    public class Driver
    {
        public string Name { get; set; }
        public string Key { get; set; }
        public string Team { get; set; }
        public int Points { get; set; }
        public bool Active { get; set; }
    }
}
