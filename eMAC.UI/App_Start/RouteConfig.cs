using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace eMAC.UI
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Default",
                "home/{impersonate}",
                new {controller = "Home", action = "Index", impersonate = UrlParameter.Optional }
            );

            routes.MapRoute("Home",
               "index",
             new { controller = "Home", action = "Home" });

            routes.MapRoute("Meetings",
               "Meetings/{action}",
             new { controller = "Meetings", action = "{action}" });

            routes.MapRoute("Reports",
               "Reports/{action}",
             new { controller = "Reports", action = "{action}" });

            //routes.MapRoute(
            //"hash",
            //"#/{*anything}",
            //new { controller = "Home", action = "Index", id = UrlParameter.Optional },
            //new { anything = @"^(.*)?$" });


            routes.MapRoute(
           "Anything",
           "{*anything}",
           new { controller = "Home", action = "Index", id = UrlParameter.Optional },
           new { anything = @"^(.*)?$" }
           );
        }
    }
}