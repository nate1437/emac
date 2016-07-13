using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace eMAC.UI.Controllers
{
    public class baseController : Controller
    {
        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            var request = new
            {
                controller = filterContext.ActionDescriptor.ControllerDescriptor.ControllerName,
                action = filterContext.ActionDescriptor.ActionName,
                param = filterContext.ActionParameters
            };


            if (request.controller.ToUpper().Equals("HOME") &&
                request.action.ToUpper().Equals("INDEX"))
            {
                string userToUse = "";
                if (System.Web.HttpContext.Current.Session.Count == 0)
                {
                    if (!string.IsNullOrEmpty(Convert.ToString(request.param["impersonate"])))
                    {
                        var impersonate = request.param["impersonate"].ToString();
                        var user = User.Identity.Name.Split('\\')[1].ToLower();
                        var allowedToImpersonate = new CryptLib.CryptLib().Decrypt3DES(ConfigurationManager.AppSettings["ImpersonateUsers"].ToString()).Split(';').Where(x => x == user).ToList();
                        userToUse = (allowedToImpersonate.Count > 0) ? impersonate : user;
                    }
                    System.Web.HttpContext.Current.Session["USER"] =
                        string.IsNullOrEmpty(userToUse) ? User.Identity.Name.Split('\\')[1].ToLower() : userToUse;
                }


            }

            base.OnActionExecuting(filterContext);
        }

    }
}
