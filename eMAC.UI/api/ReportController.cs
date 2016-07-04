using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Data;
using System.Text;
using System.IO;
using Newtonsoft.Json.Linq;
using System.Web;

namespace eMAC.UI.api
{
    public class ReportController : ApiController
    {
        public ReportController()
        {
        }

        // GET api/library
        //[ActionName("View")]
        //public DataSet Get()
        //{
        //    //var parameters = new Dictionary<string, object>();
        //    //parameters.Add("@mtg_id", 75);

        //    //return _repository.GetEntity(StoredProcs.PlanningDocumentView, parameters);
        //}

        [HttpGet]
        public string test(string param)
        {
            return param;
        }
        [HttpPost]
        public dynamic RequestTableauUrl(JObject param)
        {
            var client_id = ((HttpContextWrapper)Request.Properties["MS_HttpContext"]).Request.UserHostAddress;
            if (client_id == "::1")
            {
                client_id = "127.0.0.1";
            }
            var user = System.Configuration.ConfigurationManager.AppSettings["tableauTicket"].ToString();
            var server = System.Configuration.ConfigurationManager.AppSettings["tableauServer"].ToString();
            var comment = "no";
            var toolbar = "yes";
            var filters = "";
            var request = (HttpWebRequest)WebRequest.Create(string.Format("http://{0}/trusted", server));
            var postdata = string.Format("username={0}&client_ip={1}", user, System.Web.HttpContext.Current.Request.ServerVariables["REMOTE_ADDR"]);
            var encoding = new UTF8Encoding();

            byte[] data = encoding.GetBytes(postdata);

            request.Method = "POST";
            request.ContentType = "application/x-www-form-urlencoded";
            request.ContentLength = data.Length;
            using (var stream = request.GetRequestStream())
            {
                stream.Write(data, 0, data.Length);
            }
            var response = (HttpWebResponse)request.GetResponse();
            var read = new StreamReader(response.GetResponseStream()).ReadToEnd();

            if (read != "-1")
            {
                return string.Format("http://{0}/trusted/{1}/{2}?:embed=yes&:refresh=yes&:customViews=no&:comments={3}&:toolbar=", server, read, param.ToObject<Dictionary<string, string>>()["url"], comment, toolbar);
            }
            return "";
        }
    }
}
