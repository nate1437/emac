using eMAC.Infra.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace eMAC.UI.Controllers
{
    public class ReportsController : Controller
    {
        public ReportsController()
        {
        }
        //
        // GET: /Reports/

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult PlanningDocument()
        {
            ViewBag.PlanningDocument = true;
            return PartialView();
        }

        public ActionResult GetIB2Document()
        {
            ViewBag.IB2Document = true;
            return PartialView("PlanningDocument");
        }
    }
}
