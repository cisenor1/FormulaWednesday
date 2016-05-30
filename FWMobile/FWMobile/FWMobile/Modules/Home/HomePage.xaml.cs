using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Xamarin.Forms;

namespace FWMobile.Modules.Home
{
    public partial class HomePage : ContentPage
    {
        public HomePage()
        {
            InitializeComponent();
        }

        public void Tapped_Handler(object sender, ItemTappedEventArgs e)
        {
            var lv = sender as ListView;
            lv.SelectedItem = null;
        }
    }
}
