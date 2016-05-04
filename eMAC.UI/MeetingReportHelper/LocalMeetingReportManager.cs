using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Net.Http;
using System.IO;
using WebApiAngularJsUploader.Models;
using System.Web.Configuration;
using WebApiAngularJsUploader.Helper;
using WebApiAngularJsUploader.Attachment;
using System.Collections.Specialized;

namespace WebApiAngularJsUploader.MeetingReport
{
    public class LocalMeetingReportManager : IMeetingReportManager
    {
        private static string _fileDump = WebConfigurationManager.AppSettings["FileDump"];
        private static string user = WebConfigurationManager.AppSettings["ImpersonateUser"];
        private static string pass = new CryptLib.CryptLib().Decrypt3DES(WebConfigurationManager.AppSettings["ImpersonatePassword"].ToString());
        private static string domain = WebConfigurationManager.AppSettings["ImpersonateDomain"];

        private string workingFolder { get; set; }

        public LocalMeetingReportManager()
        {

        }

        public LocalMeetingReportManager(string workingFolder)
        {
            this.workingFolder = workingFolder;
            CheckTargetDirectory();
        }

        public async Task<IEnumerable<MeetingReportViewModel>> GetById(int mtgId)
        {
            List<MeetingReportViewModel> mtgReports = new List<MeetingReportViewModel>();

            DirectoryInfo mtgReportFolder = new DirectoryInfo(this.workingFolder + @"\" + mtgId);

            var excludedExts = new List<string> { ".db" };

            await Task.Factory.StartNew(() =>
            {
                using (Impersonate i = new Impersonate(user, pass, domain))
                {
                    if (i.isImpersonated())
                    {
                        mtgReports = mtgReportFolder.EnumerateFiles()
                            .Where(fi => new[] { ".pdf "}.Contains(fi.Extension.ToLower()))
                            .Where(fi => !excludedExts.Contains(fi.Extension.ToLower()))
                                                    .Select(fi => new MeetingReportViewModel
                                                    {
                                                        Name = fi.Name
                                                        //Created = fi.CreationTime,
                                                        //Modified = fi.LastWriteTime,
                                                        //Size = fi.Length / 1024
                                                    })
                                                    .ToList();
                    }
                }
            });

            return mtgReports;
        }

        public async Task<MeetingReportActionResult> DeleteById(int mtgId, string fileName)
        {
            try
            {
                using (Impersonate i = new Impersonate(user, pass, domain))
                {
                    if (i.isImpersonated())
                    {
                        var filePath = Directory.GetFiles(this.workingFolder + @"\" + mtgId, fileName)
                                    .FirstOrDefault();

                        await Task.Factory.StartNew(() =>
                        {
                            using (Impersonate ui = new Impersonate(user, pass, domain))
                            {
                                if (ui.isImpersonated())
                                {
                                    File.Delete(filePath);
                                }
                            }
                        });
                    }
                }

                return new MeetingReportActionResult { Successful = true, Message = fileName + "deleted successfully" };
            }
            catch (Exception ex)
            {
                return new MeetingReportActionResult { Successful = false, Message = "error deleting fileName " + ex.GetBaseException().Message };
            }
        }

        public async Task<MeetingReportActionResult> DeleteByMtgNumber(string mtgNumber, string fileName)
        {
            try
            {
                using (Impersonate i = new Impersonate(user, pass, domain))
                {
                    if (i.isImpersonated())
                    {
                        var filePath = Directory.GetFiles(this.workingFolder + @"\" + mtgNumber, fileName)
                                    .FirstOrDefault();

                        await Task.Factory.StartNew(() =>
                        {
                            using (Impersonate ui = new Impersonate(user, pass, domain))
                            {
                                if (ui.isImpersonated())
                                {
                                    File.Delete(filePath);
                                }
                            }
                        });
                    }
                }

                return new MeetingReportActionResult { Successful = true, Message = fileName + "deleted successfully" };
            }
            catch (Exception ex)
            {
                return new MeetingReportActionResult { Successful = false, Message = "error deleting fileName " + ex.GetBaseException().Message };
            }
        }

        public async Task<IEnumerable<MeetingReportViewModel>> AddToDir(int mtgId, string fileName, HttpRequestMessage request)
        {
            var meetingReports = new List<MeetingReportViewModel>();

            var provider = await request.Content.ReadAsMultipartAsync<InMemoryMultipartFormDataStreamProvider>(new InMemoryMultipartFormDataStreamProvider());

            //access form data
            //NameValueCollection formData = provider.FormData;

            //access files
            IList<HttpContent> files = provider.Files;

            //Example: reading a file's stream like below
            HttpContent file1 = files[0];
            Stream file1Stream = await file1.ReadAsStreamAsync();

            var thisFileName = !string.IsNullOrWhiteSpace(file1.Headers.ContentDisposition.Name) ? file1.Headers.ContentDisposition.Name : "NoName";

            var newFileName = thisFileName.Trim(new char[] { '"' }).Replace("&", "and");

            //var newFileName = fileName + "_Summary_Report.pdf";

            var dirFileName = Path.Combine(Path.Combine(this.workingFolder, mtgId.ToString()), fileName);

            try
            {
                FileInfo fileInfo = null;
                using (Impersonate i = new Impersonate(user, pass, domain))
                {
                    if (i.isImpersonated())
                    {
                        if (File.Exists(dirFileName))
                        {
                            File.Delete(dirFileName);
                        }

                        using (FileStream fileStream = File.Create(dirFileName))
                        {
                            file1Stream.Seek(0, SeekOrigin.Begin);
                            file1Stream.CopyTo(fileStream);
                        }
                        fileInfo = new FileInfo(dirFileName); 
                    }
                }

                meetingReports.Add(new MeetingReportViewModel
                {
                    Name = fileInfo.Name
                    //Created = fileInfo.CreationTime,
                    //Modified = fileInfo.LastWriteTime,
                    //Size = fileInfo.Length / 1024
                });

                return meetingReports;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<IEnumerable<MeetingReportViewModel>> AddToDirByMtgNumber(string mtgNumber, string fileName, HttpRequestMessage request)
        {
            var meetingReports = new List<MeetingReportViewModel>();

            var provider = await request.Content.ReadAsMultipartAsync<InMemoryMultipartFormDataStreamProvider>(new InMemoryMultipartFormDataStreamProvider());

            //access form data
            //NameValueCollection formData = provider.FormData;

            //access files
            IList<HttpContent> files = provider.Files;

            //Example: reading a file's stream like below
            HttpContent file1 = files[0];
            Stream file1Stream = await file1.ReadAsStreamAsync();

            var thisFileName = !string.IsNullOrWhiteSpace(file1.Headers.ContentDisposition.Name) ? file1.Headers.ContentDisposition.Name : "NoName";

            var newFileName = thisFileName.Trim(new char[] { '"' }).Replace("&", "and");

            //var newFileName = fileName + "_Summary_Report.pdf";

            var dirFileName = Path.Combine(Path.Combine(this.workingFolder, mtgNumber), fileName);

            try
            {
                FileInfo fileInfo = null;
                using (Impersonate i = new Impersonate(user, pass, domain))
                {
                    if (i.isImpersonated())
                    {
                        if (File.Exists(dirFileName))
                        {
                            File.Delete(dirFileName);
                        }

                        using (FileStream fileStream = File.Create(dirFileName))
                        {
                            file1Stream.Seek(0, SeekOrigin.Begin);
                            file1Stream.CopyTo(fileStream);
                        }
                        fileInfo = new FileInfo(dirFileName);
                    }
                }
                meetingReports.Add(new MeetingReportViewModel
                {
                    Name = fileInfo.Name
                    //Created = fileInfo.CreationTime,
                    //Modified = fileInfo.LastWriteTime,
                    //Size = fileInfo.Length / 1024
                });
                

                return meetingReports;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public bool FileExists(string fileName)
        {
            var file = Directory.GetFiles(this.workingFolder, fileName)
                                .FirstOrDefault();

            return file != null;
        }

        public bool FileExists(int mtgId, string fileName)
        {
            var file = "";

            using (Impersonate i = new Impersonate(user, pass, domain))
            {
                if (i.isImpersonated())
                {
                    file = Directory.GetFiles(this.workingFolder + @"\\" + mtgId, fileName)
                                        .FirstOrDefault();
                }
            }

            return file != null;
        }

        public bool FileExists(string mtgNumber, string fileName)
        {
            var file = "";

            using (Impersonate i = new Impersonate(user, pass, domain))
            {
                if (i.isImpersonated())
                {
                    file = Directory.GetFiles(this.workingFolder + @"\\" + mtgNumber, fileName)
                                        .FirstOrDefault();
                }
            }

            return file != null;
        }

        public bool CheckTargetMtgDirectory(int mtgId)
        {
            string thisDir = this.workingFolder + @"\" + mtgId;
            using (Impersonate i = new Impersonate(user, pass, domain))
            {
                if (i.isImpersonated())
                {
                    if (!Directory.Exists(thisDir))
                    {
                        Directory.CreateDirectory(thisDir);
                        //throw new ArgumentException("the destination path " + this.workingFolder + " could not be found");

                    }
                    return true;
                }

                return false;
            }
        }

        public bool CheckTargetMtgDirectory(string mtgNumber)
        {
            string thisDir = this.workingFolder + @"\" + mtgNumber;
            using (Impersonate i = new Impersonate(user, pass, domain))
            {
                if (i.isImpersonated())
                {
                    if (!Directory.Exists(thisDir))
                    {
                        Directory.CreateDirectory(thisDir);
                        //throw new ArgumentException("the destination path " + this.workingFolder + " could not be found");

                    }
                    return true;
                }

                return false;
            }
        }

        private void CheckTargetDirectory()
        {
            using (Impersonate i = new Impersonate(user, pass, domain))
            {
                if (i.isImpersonated())
                {
                    if (!Directory.Exists(this.workingFolder))
                    {
                        //string localPath = new Uri(this.workingFolder).LocalPath;
                        //this.workingFolder = localPath;
                        Directory.CreateDirectory(this.workingFolder);
                        //throw new ArgumentException("the destination path " + this.workingFolder + " could not be found");
                    }
                }
            }
        }

        public string GetFilePath(int mtgId, string fileName)
        {
            return this.workingFolder + @"\\" + mtgId + @"\\" + fileName;
        }

        public string GetFilePath(string mtgNumber, string fileName)
        {
            return this.workingFolder + @"\\" + mtgNumber + @"\\" + fileName;
        }

        public FileStream GetMtgReportFileStream(string filePath)
        {
            using (Impersonate i = new Impersonate(user, pass, domain))
            {
                if (i.isImpersonated())
                {
                    return new FileStream(filePath, FileMode.Open);
                }

                return null;
            }
        }
    }
}