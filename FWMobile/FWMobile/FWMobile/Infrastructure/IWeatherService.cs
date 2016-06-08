using FWMobile.Infrastructure.Models.Weather;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure
{
    public interface IWeatherService
    {
        Task<IList<DayForecast>> GetForecast(double latitude, double longitude, DateTimeOffset? forecastDate = null);
    }
}
