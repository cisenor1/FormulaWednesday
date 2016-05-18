using PropertyChanged;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Modules.Home
{
    [ImplementPropertyChanged]
    public class HomePageModel : FreshMvvm.FreshBasePageModel
    {
        public string MainText { get; set; } = "Welcome to the Formula Wednesday Android App. This is a work in progress, so expect bugs and crashes.";
    }
}
