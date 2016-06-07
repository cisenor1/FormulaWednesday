using Acr.UserDialogs;
using FWMobile.Infrastructure;
using FWMobile.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

using Xamarin.Forms;

namespace FWMobile
{
    public class App : Application
    {
        public App()
        {
            SetupIOC();
            //var masterDetailPage = new FreshMvvm.FreshMasterDetailNavigationContainer();
            //masterDetailPage.Init("Menu");
            //masterDetailPage.AddPage<Modules.Home.HomePageModel>("Home");
            //masterDetailPage.AddPage<Modules.Profile.ProfilePageModel>("Profile");
            ////masterDetailPage.AddPage<ChallengesPageModel>("Challenges");
            //masterDetailPage.AddPage<Modules.MyPicks.RaceChoicePageModel>("My Picks");
            //MainPage = masterDetailPage;
            var tabbedPage = new FreshMvvm.FreshTabbedNavigationContainer();
            tabbedPage.AddTab<Modules.Home.HomePageModel>("Home", "");
            tabbedPage.AddTab<Modules.Races.RaceChoicePageModel>("Races", "");
            
            MainPage = tabbedPage;
        }

        private void SetupIOC()
        {
            FreshMvvm.FreshIOC.Container.Register(UserDialogs.Instance);
            FreshMvvm.FreshIOC.Container.Register<IRestService, RestService>();
            FreshMvvm.FreshIOC.Container.Register<IDataService, DataService>();
            FreshMvvm.FreshIOC.Container.Register<IUserManager, UserManager>();
            FreshMvvm.FreshIOC.Container.Register<IWeatherService, WeatherService>();
        }

        protected override void OnStart()
        {
            // Handle when your app starts
        }

        protected override void OnSleep()
        {
            // Handle when your app sleeps
        }

        protected override void OnResume()
        {
            // Handle when your app resumes
        }
    }
}
