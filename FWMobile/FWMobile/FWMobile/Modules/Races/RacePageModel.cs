using Acr.UserDialogs;
using FWMobile.Infrastructure;
using FWMobile.Infrastructure.Models;
using FWMobile.Infrastructure.Models.Weather;
using PropertyChanged;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;
using Xamarin.Forms;

namespace FWMobile.Modules.Races
{
    [ImplementPropertyChanged]
    public class RacePageModel : FreshMvvm.FreshBasePageModel
    {
        private IDataService _dataService;
        private IWeatherService _weatherService;
        private IUserDialogs _userDialogs;

        public Race Race { get; set; }
        public ICommand MakePicksCommand { get; set; }

        public RacePageModel(IDataService dataService, IWeatherService weatherService, IUserDialogs userDialogs)
        {
            _dataService = dataService;
            _weatherService = weatherService;
            _userDialogs = userDialogs;
        }

        public async override void Init(object initData)
        {
            base.Init(initData);

            MakePicksCommand = new Command(() =>
            {
                CoreMethods.PushPageModel<PicksPageModel>(Race);
            });
            _userDialogs.ShowLoading("Loading race data");
            if (initData is Race)
            {
                Race = initData as Race;
                IList<DayForecast> dayForecasts = null;
                if (Race.RaceDate != DateTime.MinValue)
                {
                    
                    DateTimeOffset raceDate = new DateTimeOffset(Race.RaceDate);
                    dayForecasts = await _weatherService.GetForecast(Race.Latitude, Race.Longitude, raceDate);
                }
                else
                {
                    dayForecasts = await _weatherService.GetForecast(Race.Latitude, Race.Longitude);
                }
            }
            _userDialogs.HideLoading();
        }
    }
}
