using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Utilities
{
    public static class WeatherUtilities
    {
        public static double ConvertToCelsius(double fahrenheit)
        {
            return (fahrenheit - 32) / 1.8;
        }

        public static double ConvertToFahrenheit(double celsius)
        {
            return (celsius * 1.8) + 32;
        }
    }
}