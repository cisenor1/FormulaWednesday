using FWMobile.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;

namespace FWMobile.Modules.Races
{
    public partial class RaceChoicePage : ContentPage
    {
        public RaceChoicePage()
        {
            InitializeComponent();
        }

        public void RaceTapped(object sender, EventArgs e)
        {
            var lv = sender as ListView;
            var x = lv.SelectedItem;
            lv.SelectedItem = null;
            (BindingContext as RaceChoicePageModel).RaceSelected.Execute(x);
        }
    }
}
