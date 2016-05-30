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
using Xamarin.Forms;

namespace FWMobile.Modules.MyPicks
{
    [ImplementPropertyChanged]
    public class RaceChoicePageModel : FreshMvvm.FreshBasePageModel
    {
        private IUserManager _userManager;
        private IDataService _dataService;
        private IUserDialogs _userDialogs;

        public ObservableCollection<Race> Races { get; set; }

        public Race SelectedRace { get; set; }

        public Command<Race> RaceSelected
        {
            get
            {
                return new Command<Race>(async (race) =>
                {
                    await CoreMethods.PushPageModel<PicksPageModel>(race);
                });
            }
        }

        public RaceChoicePageModel(IUserManager userManager, IDataService dataService, IUserDialogs userDialogs)
        {
            _userManager = userManager;
            _dataService = dataService;
            _userDialogs = userDialogs;
        }

        public override void Init(object initData)
        {
            base.Init(initData);
            Races = new ObservableCollection<Race>();
        }

        protected async override void ViewIsAppearing(object sender, EventArgs e)
        {
            base.ViewIsAppearing(sender, e);

            _userDialogs.ShowLoading("Retrieving All Races");
            var user = await _userManager.GetUser();
            if (_userManager.IsAnonymous(user))
            {
                Races.Clear();
            }
            else if (Races.Count == 0)
            {
                var races = await _dataService.GetRaces(user);
                var orderedRaces = races.OrderBy(x => x.Date);
                foreach (var race in orderedRaces)
                {
                    Races.Add(race);
                }
            }
            SelectedRace = null;
            _userDialogs.HideLoading();
        }
    }
}
