using FWMobile.Infrastructure;
using FWMobile.Infrastructure.Models;
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

        public Race Race { get; set; }
        public ICommand MakePicksCommand { get; set; }

        public RacePageModel(IDataService dataService)
        {
            _dataService = dataService;
        }

        public override void Init(object initData)
        {
            base.Init(initData);

            MakePicksCommand = new Command(() =>
            {
                CoreMethods.PushPageModel<PicksPageModel>(Race);
            });

            if (initData is Race)
            {
                Race = initData as Race;
            }


        }
    }
}
