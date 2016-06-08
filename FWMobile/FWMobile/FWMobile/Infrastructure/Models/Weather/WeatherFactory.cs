using ForecastIOPortable.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure.Models.Weather
{
    public static class WeatherFactory
    {
        public static DayForecast CreateDayForecast(Forecast forecast)
        {
            throw new NotImplementedException("CreateDayForecast");
        }

        public static IList<DayForecast> CreateDayForecasts(Forecast forecast)
        {
            List<DayForecast> dayForecasts = new List<DayForecast>();
            var daily = forecast.Daily;
            foreach (var day in daily.Days)
            {
                var dayForecast = new DayForecast();
                dayForecast.PrecipitationProbability = Convert.ToDouble(day.PrecipitationProbability);
                dayForecast.PrecipitationIntensity = Convert.ToDouble(day.PrecipitationIntensity);
                dayForecast.PrecipitationType = day.PrecipitationType;
                dayForecast.MaxTemperature = Utilities.WeatherUtilities.ConvertToCelsius(Convert.ToDouble(day.MaxTemperature));
                dayForecast.MinTemperature = Utilities.WeatherUtilities.ConvertToCelsius(Convert.ToDouble(day.MinTemperature));
                
                dayForecasts.Add(dayForecast);
            }
            return dayForecasts;
        }
    }
}
