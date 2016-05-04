using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace eMAC.UI.Controllers
{
    public class HomeController : Controller
    {
        [Authorize]
        public ActionResult Index()
        {
            var test = User.Identity.Name;
            
            return View();
        }

        public ActionResult Home()
        {
            ViewBag.Title = "Home Page";

           

            return PartialView();
        }
    }
}