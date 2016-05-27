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

namespace FWMobile.Modules.Home
{
    [ImplementPropertyChanged]
    public class HomePageModel : FreshMvvm.FreshBasePageModel
    {
        private IDataService _dataService;
        public IUserDialogs _userDialogs;
        public string MainText { get; set; } = "Welcome to the Formula Wednesday Android App. This is a work in progress, so expect bugs and crashes.";

        public ObservableCollection<DisplayPost> Posts { get; set; }

        public async override void Init(object initData)
        {
            base.Init(initData);
            
            Posts = new ObservableCollection<DisplayPost>();

            var blogPosts = await _dataService.GetBlogPosts();
            foreach (var blogPost in blogPosts)
            {
                var displayPost = new DisplayPost(blogPost);
                Posts.Add(displayPost);
            }
        }

        public HomePageModel(IDataService dataService, IUserDialogs userDialogs)
        {
            _dataService = dataService;
            _userDialogs = userDialogs;
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
            if (post.Timestamp != DateTime.MinValue)
            {
                ds = post.Timestamp.ToString("d");
            }
            
            Message = post.Message;
            Title = post.Title;
            UserInfo = post.User + " on " + ds;
        }
    }
}
