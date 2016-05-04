using System.Web;
using System.Web.Optimization;

namespace eMAC.UI
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/site.css"));

            bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
                        "~/Content/themes/base/jquery.ui.core.css",
                        "~/Content/themes/base/jquery.ui.resizable.css",
                        "~/Content/themes/base/jquery.ui.selectable.css",
                        "~/Content/themes/base/jquery.ui.accordion.css",
                        "~/Content/themes/base/jquery.ui.autocomplete.css",
                        "~/Content/themes/base/jquery.ui.button.css",
                        "~/Content/themes/base/jquery.ui.dialog.css",
                        "~/Content/themes/base/jquery.ui.slider.css",
                        "~/Content/themes/base/jquery.ui.tabs.css",
                        "~/Content/themes/base/jquery.ui.datepicker.css",
                        "~/Content/themes/base/jquery.ui.progressbar.css",
                        "~/Content/themes/base/jquery.ui.theme.css"));

            bundles.Add(new StyleBundle("~/Content/kendo").Include(
                      "~/Content/kendo/kendo.common.min.css",
                      "~/Content/kendo/kendo.bootstrap.min.css",
                      "~/Content/kendo/kendo.default.min.css"));

            bundles.Add(new ScriptBundle("~/bundles/kendojs").Include(
                   "~/Scripts/kendo/kendo.all.min.js"));


            bundles.Add(new ScriptBundle("~/bundles/angularjs").Include(
                     "~/Scripts/angular.js",
                     "~/Scripts/angular-resource.js",
                     "~/Scripts/angular-route.js",
                     "~/Scripts/angular-animate.js",
                     "~/Scripts/angular-sanitize.js"));

            

            bundles.Add(new ScriptBundle("~/bundles/uibootstrapjs").Include(                     
                     "~/Scripts/angular-ui/ui-bootstrap.js",
                     "~/Scripts/angular-ui/ui-bootstrap-tpls.js"));

            //bundles.Add(new ScriptBundle("~/bundles/app").Include(
            //          "~/Client/app.js",
            //          "~/Client/routes.js",
            //          "~/Client/controllers/homeController.js",
            //          "~/Client/controllers/mtgsController.js",
            //          "~/Client/controllers/mtgsEditController.js",
            //          "~/Client/models/mtgDataModel.js",
            //          "~/Client/services/mtgDataSource.js"
            //          ));

            //bundles.Add(new ScriptBundle("~/bundles/bluimp").Include(
            //    "~/Scripts/bluimp/vendor/jquery.ui.widget.js",
            //    "~/Scripts/bluimp/tmpl.js",
            //    "~/Scripts/bluimp/load-image.js",
            //    "~/Scripts/bluimp/canvas-to-blob.js",
            //    "~/Scripts/bluimp/jquery.iframe-transport.js",
            //    "~/Scripts/bluimp/jquery.fileupload.js",
            //    "~/Scripts/bluimp/jquery.fileupload-fp.js",
            //    "~/Scripts/bluimp/jquery.fileupload-ui.js",
            //    "~/Scripts/bluimp/main.js"));
        }


    }
}