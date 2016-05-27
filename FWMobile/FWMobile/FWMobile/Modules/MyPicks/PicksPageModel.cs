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
using System.Windows.Input;
using Xamarin.Forms;

namespace FWMobile.Modules.MyPicks
{
    [ImplementPropertyChanged]
    public class PicksPageModel : FreshMvvm.FreshBasePageModel
    {
        private Driver _defaultDriver = new Driver()
        {
            Name = "-- Pick a driver --"
        };
        
        private IDataService _dataService;
        private IUserManager _userManager;
        private IUserDialogs _userDialogs;
        private User _user;

        // UI Variables
        public string Title { get; set; }
        public string SaveLabel { get; set; } = "Don't forget to save your picks!";

        public Race Race { get; set; }
        public ObservableCollection<ChallengeChoice> Choices { get; set; } = new ObservableCollection<ChallengeChoice>();

        public ICommand SaveCommand { get; set; }

        public async override void Init(object initData)
        {
            base.Init(initData);

            SaveCommand = new Command(SavePicks, CanSavePicks);

            if (initData != null)
            {
                _userDialogs.ShowLoading("Loading race details");
                Race = initData as Race;
                Title = Race.Title + " Picks";
                _user = await _userManager.GetUser();
                var raceChoices = await _dataService.GetRaceChoices(_user, Race);
                var drivers = await _dataService.GetDrivers(_user);
                List<Driver> sortedDrivers = drivers.ToList();
                sortedDrivers
                    .Sort(delegate (Driver x, Driver y)
                    {
                        return x.Name.CompareTo(y.Name);
                    });
                foreach (var raceChoice in raceChoices)
                {
                    var choice = new ChallengeChoice(raceChoice.Key);
                    choice.CanChoose = CanSavePicks();
                    choice.Drivers = new ObservableCollection<DriverChoice>();
                    foreach (var driver in sortedDrivers)
                    {
                        var dc = new DriverChoice(driver);
                        choice.Drivers.Add(dc);
                    }
                    if (raceChoice.Value != null)
                    {
                        var driverChoice = choice.Drivers.FirstOrDefault(x => x.Driver.Key == raceChoice.Value.Key);
                        if (driverChoice != null)
                        {
                            var selectedIndex = choice.Drivers.IndexOf(driverChoice);
                            choice.SelectedDriver = driverChoice;
                        }
                    }
                    Choices.Add(choice);
                }

                _userDialogs.HideLoading();
            }
        }
        
        public PicksPageModel(IDataService dataService, IUserManager userManager, IUserDialogs userDialogs)
        {
            _dataService = dataService;
            _userManager = userManager;
            _userDialogs = userDialogs;
        }

        protected override void ViewIsAppearing(object sender, EventArgs e)
        {
            base.ViewIsAppearing(sender, e);
        }

        protected override void ViewIsDisappearing(object sender, EventArgs e)
        {
            base.ViewIsDisappearing(sender, e);
            Choices.Clear();
        }

        public async void SavePicks()
        {
            _userDialogs.ShowLoading("Saving challenge picks");

            IDictionary<Challenge, Driver> picks = new Dictionary<Challenge, Driver>();
            foreach (var choice in Choices)
            {
                if (choice.SelectedDriver != null)
                {
                    picks.Add(choice.Challenge, choice.SelectedDriver.Driver);
                }
                else
                {
                    picks.Add(choice.Challenge, null);
                }
            }

            var success = await _dataService.SaveUserChoices(_user, Race, picks);
            _userDialogs.HideLoading();
            if (success)
            {
                _userDialogs.ShowSuccess("Choices have been saved.", 1500);
            }
            else
            {
                _userDialogs.ShowError("Failed to save. Please try again later.", 2000);
            }
        }

        public bool CanSavePicks()
        {
            return (DateTime.Now - Race.Date).Days < 0;
        }
    }

    [ImplementPropertyChanged]
    public class ChallengeChoice
    {
        public string HeaderText { get; set; }
        public string Description { get; set; }
        public bool CanChoose { get; set; }
        public Challenge Challenge { get; set; }
        public DriverChoice SelectedDriver { get; set; }
        public ObservableCollection<DriverChoice> Drivers { get; set; }
        public ChallengeChoice(Challenge challenge)
        {
            Challenge = challenge;
            this.HeaderText = challenge.Message;
            this.Description = challenge.Description;
        }
    }

    [ImplementPropertyChanged]
    public class DriverChoice
    {
        public Driver Driver { get; set; }
        public string PickText { get; set; }

        public DriverChoice(Driver driver)
        {
            Driver = driver;
            if (!string.IsNullOrWhiteSpace(driver.Team))
            {
                PickText = String.Format("{0} ({1})", driver.Name, driver.Team);
            }
            else
            {
                PickText = driver.Name;
            }
        }
    }
}
