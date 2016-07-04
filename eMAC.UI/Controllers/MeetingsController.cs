using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.Web.Mvc;
using WebApiAngularJsUploader.Helper;

namespace eMAC.UI.Controllers
{
    public class MeetingsController : Controller
    {
        private static string _fileDump = WebConfigurationManager.AppSettings["FileDump"];
        private static string user = WebConfigurationManager.AppSettings["ImpersonateUser"];
        private static string pass = new CryptLib.CryptLib().Decrypt3DES(WebConfigurationManager.AppSettings["ImpersonatePassword"].ToString());
        private static string domain = WebConfigurationManager.AppSettings["ImpersonateDomain"];
        private string _localDir = new Uri(System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase) + @"\Album").LocalPath;
        //
        // GET: /Meetings/

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Edit()
        {
            return PartialView();
        }

        [HttpGet]
        public ActionResult Reports()
        {
            return PartialView("_ReportsPartial");
        }

        public ActionResult EditTest()
        {
            return PartialView();
        }

        public ActionResult NewEdit()
        {
            return PartialView();
        }

        public FileContentResult DownloadFile(int mtgId, string fileName)
        {
            var filepath = _fileDump + "Attachments" + "/" + mtgId + "/" + fileName;


            try
            {
                var fileType = MimeMapping.GetMimeMapping(filepath);
                //if (i.isImpersonated())
                //{
                // var filePathResult = File(filepath, MimeMapping.GetMimeMapping(filepath), fileName);

                //return null;
                //}

                using (Impersonate i = new Impersonate(user, pass, domain))
                {
                    //FilePathResult result = new FilePathResult(filepath, fileType);
                    byte[] doc = System.IO.File.ReadAllBytes(filepath);

                    //result.FileDownloadName = fileName;
                    string mimeType = "application/pdf";
                    Response.AppendHeader("Content-Disposition", "attachment; filename=" + fileName);
                    return File(doc, mimeType);

                    //if (!string.IsNullOrEmpty(filepath))
                    //{
                    //    //var vFullFileName = HostingEnvironment.MapPath(path);

                    //    var file = new FileInfo(filepath);
                    //    if (file.Exists)
                    //    {
                    //        FilePathResult result = new FilePathResult(filepath, fileType);

                    //        result.FileDownloadName = fileName;

                    //        //return File(vFullFileName, "application/binary");
                    //        return result;
                    //    }
                    //}

                    ////file is empty, so return null
                    //return null;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            //var filepath = System.IO.Path.Combine(Server.MapPath("/Album/" + mtgId +"/"), fileName);
           
            //return File(filepath, MimeMapping.GetMimeMapping(filepath), fileName);
        }
    }
}
