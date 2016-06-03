using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FWMobile.Infrastructure.Models
{
    public class BlogPost
    {
        public string Title { get; set; }
        public string Message { get; set; }
        public string UserDisplayName { get; set; }
        public DateTime PostDate { get; set; }
    }
}
