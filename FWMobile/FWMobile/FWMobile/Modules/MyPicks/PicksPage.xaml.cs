using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;
using XLabs.Forms.Controls;

namespace FWMobile.Modules.MyPicks
{
    public partial class PicksPage : ContentPage
    {
        public PicksPage()
        {
            InitializeComponent();
        }

        public void IndexChanged(object sender, EventArgs e)
        {
            if (sender is ExtendedPicker)
            {
                var ep = sender as ExtendedPicker;
                if (ep.BindingContext is ChallengeChoice)
                {
                    var cc = ep.BindingContext as ChallengeChoice;
                    if (ep.SelectedIndex > 0 && ep.SelectedIndex < cc.Drivers.Count)
                    {
                        cc.SelectedDriver = cc.Drivers[ep.SelectedIndex];
                    }
                }
            }
        }

        public void ChallengeTapped(object sender, EventArgs e)
        {
            (sender as ListView).SelectedItem = null;
        }
    }
}
