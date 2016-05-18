using Acr.UserDialogs;
using FWMobile.Infrastructure;
using FWMobile.Infrastructure.Models;
using PropertyChanged;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Modules.Races
{
    [ImplementPropertyChanged]
    public class RacePageModel : FreshMvvm.FreshBasePageModel
    {
        private IDataService _dataService;
        private IUserManager _userManager;
        private IUserDialogs _userDialogs;

        public Race Race { get; set; }
        public async override void Init(object initData)
        {
            base.Init(initData);

            if (initData != null)
            {
                _userDialogs.ShowLoading("Loading race details");
                Race = initData as Race;
                var user = await _userManager.GetUser();
                var raceChoices = await _dataService.GetRaceChoices(user, Race);
                var drivers = await _dataService.GetDrivers(user);
                _userDialogs.HideLoading();
            }
        }

        public RacePageModel(IDataService dataService, IUserManager userManager, IUserDialogs userDialogs)
        {
            _dataService = dataService;
            _userManager = userManager;
            _userDialogs = userDialogs;
        }

        protected override void ViewIsAppearing(object sender, EventArgs e)
        {
            base.ViewIsAppearing(sender, e);
        }
    }
}
