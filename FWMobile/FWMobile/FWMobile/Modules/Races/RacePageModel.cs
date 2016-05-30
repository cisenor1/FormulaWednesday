using Acr.UserDialogs;
using FWMobile.Infrastructure;
using FWMobile.Infrastructure.Models;
using PropertyChanged;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
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
        public ObservableCollection<ChallengeChoice> Choices { get; set; } = new ObservableCollection<ChallengeChoice>();
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

                foreach (var raceChoice in raceChoices)
                {
                    var choice = new ChallengeChoice(raceChoice.Key);
                    choice.Drivers = new ObservableCollection<Driver>(drivers);
                    if (raceChoice.Value != null)
                    {
                        var driver = choice.Drivers.FirstOrDefault(x => x.Key == raceChoice.Value.Key);
                        if (driver != null)
                        {
                            choice.SelectedDriver = driver;
                        }
                        try
                        {
                            Choices.Add(choice);
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine(ex.Message);
                        }
                    }
                }

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

    public class ChallengeChoice : Challenge
    {
        public Driver SelectedDriver { get; set; }
        public ObservableCollection<Driver> Drivers { get; set; }
        public ChallengeChoice(Challenge challenge)
        {
            this.Message = challenge.Message;
            this.Key = challenge.Key;
            this.Value = challenge.Value;
            this.Type = challenge.Type;
            this.Description = challenge.Description;
        }
    }
}
