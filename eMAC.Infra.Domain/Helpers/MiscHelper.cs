using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Web;
using System.Xml.Linq;

namespace eMAC.Infra.Domain
{
    public static class MiscHelper
    {
      
        public static string GetFileExtension(string filename)
        {
            return Path.GetExtension(filename);
        }

        public static void CloseSqlConnection(this SqlCommand command)
        {
        }

        public static byte[] ReadStream(this Stream source)
        {
            byte[] a = new byte[source.Length];
            if (source.Length > 0)
            {
                source.Read(a, 0, (int)source.Length);
                source.Flush();
                source.Close();
            }
            return a;
        }

        public static IEnumerable<Dictionary<string, object>> ToDictionary(this DataTable dt)
        {
            return dt.AsEnumerable()
                .Select(row => dt.Columns.Cast<DataColumn>()
                    .ToDictionary(column => column.ColumnName, column => row[column] as object)).ToList();
        }


        public static string GetJsonRequest(this WebRequest request, byte[] requestData, NetworkCredential credential)
        {
            request.Method = "POST";
            request.ContentType = "application/json; charset=utf-8";
            request.ContentLength = requestData.Length;
            request.Credentials = credential;

            Stream dataStream = request.GetRequestStream();
            dataStream.Write(requestData, 0, requestData.Length);
            dataStream.Close();

            HttpWebResponse response = (HttpWebResponse)request.GetResponse();
            return new StreamReader(response.GetResponseStream()).ReadToEnd();
        }

        public static string ReadEndNotesFromXml(this XElement xelement, string xelementname)
        {
            var xLinq = xelement.Elements(xelementname).ToArray();
            var finalForm = "";
            foreach (var i in xLinq)
            {
                finalForm += string.Format("sup={0};value={1};param={2}$",
                    new object[]{
                        i.Attribute("orderNo").Value.ToString(),
                        
                        i.Attribute("value").Value.ToString(),
                        i.Attribute("parameter").Value.ToString(),
                    });
            }

            return finalForm;
        }

        public static List<Dictionary<string,string>> GetDictionaryFromXml(this XElement xdoc, string xelementname)
        {
            var xLinq = xdoc.Elements(xelementname).ToArray();
            var finalForm = new List<Dictionary<string, string>>();
            foreach (var i in xLinq)
            {
                var x = new Dictionary<string, string>();
                foreach (XAttribute attr in i.Attributes())
                {
                    x.Add(attr.Name.ToString(), attr.Value.ToString());
                }
                finalForm.Add(x);
            }

            return finalForm;
        }

        public static string FileFinder(string directory, string filename, Dictionary<string, string> credentials)
        {
            using (Impersonate i = new Impersonate(credentials["user"], credentials["pass"], credentials["domain"]))
            {
                if (i.isImpersonated())
                {
                    bool contains = Directory.EnumerateFiles(directory).Any(f => f.Contains(filename));
                    if (contains)
                    {
                        var file = Directory.EnumerateFiles(directory).FirstOrDefault(f => f.Contains(filename)).ToString();
                        return Path.GetFileName(file);
                    }
                }
            }

            return string.Empty;
        }

        public static string FileFinder(string directory, string filename)
        {
           
          
                    bool contains = Directory.EnumerateFiles(directory).Any(f => f.Contains(filename));
                    if (contains)
                    {
                        var file = Directory.EnumerateFiles(directory).FirstOrDefault(f => f.Contains(filename)).ToString();
                        return Path.GetFileName(file);
                    }

                    return string.Empty;
        }

        public static void DeleteFile(string filepath,string filename, Dictionary<string,string> credentials)
        {
            using(Impersonate i = new Impersonate(credentials["user"],credentials["pass"],credentials["domain"]))
            {
                if (i.isImpersonated())
                {

                    var file = Directory.EnumerateFiles(filepath).FirstOrDefault(f => f.Contains(filename)).ToString();
                    File.Delete(file);
                }
            }
        }

        public static void DeleteFile(string filepath, string filename)
        {
            

                    var file = Directory.EnumerateFiles(filepath).FirstOrDefault(f => f.Contains(filename)).ToString();
                    File.Delete(file);
               
        }

        //public static void SaveFile(HttpPostedFile file, string format, object arg0, object arg1, Dictionary<string, string> credentials)
        //{
        //    using (Impersonate i = new Impersonate(credentials["user"], credentials["pass"], credentials["domain"]))
        //    {
        //        if (i.isImpersonated())
        //        {
        //            file.SaveAs(string.Format(format, arg0, arg1));
        //        }
        //    }
        //}

        //public static void SaveFile(HttpPostedFile file, string format, object arg0, object arg1)
        //{
          
        //            file.SaveAs(string.Format(format, arg0, arg1));
                
        //}
    }
}
