using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure.Models.Weather
{
    public class DayForecast
    {
        public double PrecipitationProbability { get; set; }
        public double PrecipitationIntensity { get; set; }
        public string PrecipitationType { get; set; }
        public double CloudCover { get; set; }
        public double MaxTemperature { get; set; }
        public double MinTemperature { get; set; }
        public DateTime Day { get; set; }
    }
}
