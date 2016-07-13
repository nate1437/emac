using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace eMAC.UI.Controllers
{
    public class HomeController : baseController
    {
        [Authorize]
        public ActionResult Index(string impersonate)
        {
            return View();
        }

        public ActionResult Home()
        {
            return PartialView();
        }
    }
}