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

namespace FWMobile.Modules.Home
{
    [ImplementPropertyChanged]
    public class HomePageModel : FreshMvvm.FreshBasePageModel
    {
        private IDataService _dataService;
        public IUserDialogs _userDialogs;
        public IUserManager _userManager;
        public string MainText { get; set; } = "Welcome to the Formula Wednesday Android App. This is a work in progress, so expect bugs and crashes.";
        public ICommand ShowAboutCommand { get; set; }
        public ObservableCollection<DisplayPost> Posts { get; set; }

        public async override void Init(object initData)
        {
            base.Init(initData);
            ShowAboutCommand = new Command(() =>
            {
                CoreMethods.PushPageModel<Profile.ProfilePageModel>();
            });
            Posts = new ObservableCollection<DisplayPost>();
            var blogPosts = await _dataService.GetBlogPosts();
            foreach (var blogPost in blogPosts)
            {
                var displayPost = new DisplayPost(blogPost);
                Posts.Add(displayPost);
            }
        }

        public HomePageModel(IDataService dataService, IUserManager userManager, IUserDialogs userDialogs)
        {
            _dataService = dataService;
            _userDialogs = userDialogs;
            _userManager = userManager;
        }

        protected override void ViewIsAppearing(object sender, EventArgs e)
        {
            base.ViewIsAppearing(sender, e);
        }
    }

    public class DisplayPost
    {
        public string Message { get; set; }
        public string Title { get; set; }
        public string UserInfo { get; set; }
        public DisplayPost(BlogPost post)
        {
            string ds = string.Empty;
            if (post.PostDate != DateTime.MinValue)
            {
                ds = post.PostDate.ToString("d");
            }
            
            Message = post.Message;
            Title = post.Title;
            UserInfo = post.UserDisplayName + " on " + ds;
        }
    }
}
