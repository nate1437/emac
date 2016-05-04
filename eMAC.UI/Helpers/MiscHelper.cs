using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;

namespace WebApiAngularJsUploader.Helper
{
    public static class MiscHelper
    {
      
        public static string GetFileExtension(string filename)
        {
            return Path.GetExtension(filename);
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
