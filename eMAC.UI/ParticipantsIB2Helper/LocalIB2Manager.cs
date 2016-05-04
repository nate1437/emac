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
using eMAC.Infra.Domain;

namespace WebApiAngularJsUploader.Participants
{
    public class LocalIB2Manager : IIB2Manager
    {
        private static string _fileDump = WebConfigurationManager.AppSettings["FileDump"];
        private static string user = WebConfigurationManager.AppSettings["ImpersonateUser"];
        private static string pass = new CryptLib.CryptLib().Decrypt3DES(WebConfigurationManager.AppSettings["ImpersonatePassword"].ToString());
        private static string domain = WebConfigurationManager.AppSettings["ImpersonateDomain"];       

        private string workingFolder { get; set; }
        private IParticipantIB2Repository _ib2Repo;

        public LocalIB2Manager()
        {
            
        }

        public LocalIB2Manager(string workingFolder, IParticipantIB2Repository ib2Repo)
        {
            _ib2Repo = ib2Repo;
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

        public async Task<IB2ActionResult> DeleteById(int mtgId, string fileName)
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

                return new IB2ActionResult { Successful = true, Message = fileName + "deleted successfully" };
            }
            catch (Exception ex)
            {
                return new IB2ActionResult { Successful = false, Message = "error deleting fileName " + ex.GetBaseException().Message };
            }
        }

        public async Task<IEnumerable<IB2ViewModel>> AddToDir(string mtgNumber, int mtgId, string fileName, string userName, HttpRequestMessage request)
        {
            var meetingReports = new List<IB2ViewModel>();

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

            var dirFileName = Path.Combine(Path.Combine(this.workingFolder, mtgNumber), newFileName);


            try
            {
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

                        // import
                        bool importSuccess = _ib2Repo.ImportEmac(mtgId, userName,pass, domain, dirFileName);

                        if (importSuccess)
                        {
                            var fileInfo = new FileInfo(dirFileName);

                            meetingReports.Add(new IB2ViewModel
                            {
                                Name = fileInfo.Name
                                //Created = fileInfo.CreationTime,
                                //Modified = fileInfo.LastWriteTime,
                                //Size = fileInfo.Length / 1024
                            });
                        }
                    }
                }

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