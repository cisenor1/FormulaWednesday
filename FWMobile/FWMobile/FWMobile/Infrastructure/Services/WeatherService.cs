using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ForecastIOPortable;
using ForecastIOPortable.Models;
using FWMobile.Infrastructure.Models.Weather;

namespace FWMobile.Infrastructure.Services
{
    public class WeatherService : IWeatherService
    {
        const string FORECAST_API_KEY = "de753b14c13a2db1687f7e66f1f8ae92";

        public async Task<IList<DayForecast>> GetForecast(double latitude, double longitude, DateTimeOffset? forecastDate = null)
        {
            try
            {
                var client = new ForecastApi(FORECAST_API_KEY);
                Forecast result;
                if (forecastDate != null)
                {
                    result = await client.GetTimeMachineWeatherAsync(latitude, longitude, (DateTimeOffset)forecastDate);
                }
                else
                {
                    result = await client.GetWeatherDataAsync(latitude, longitude);
                }
                var days = WeatherFactory.CreateDayForecasts(result);
                return days;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                return null;
            }
            
        }
    }
}