using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Net.Http;
using System.IO;
using WebApiAngularJsUploader.Models;
using WebApiAngularJsUploader.Helper;
using System.Web.Configuration;
using eMAC.Infra.Domain;
using System.Net;
using System.Collections.Specialized;

namespace WebApiAngularJsUploader.Attachment
{
    public class LocalAttachmentManager : IAttachmentManager
    {
        //private static string _imgDump = WebConfigurationManager.AppSettings["ImageDump"];
        //private static string _imgView = WebConfigurationManager.AppSettings["ImageView"];
        private static string _fileDump = WebConfigurationManager.AppSettings["FileDump"];
        private static string user = WebConfigurationManager.AppSettings["ImpersonateUser"];
        private static string pass = new CryptLib.CryptLib().Decrypt3DES(WebConfigurationManager.AppSettings["ImpersonatePassword"].ToString());
        private static string domain = WebConfigurationManager.AppSettings["ImpersonateDomain"];

        private string workingFolder { get; set; }

        public LocalAttachmentManager()
        {

        }

        public LocalAttachmentManager(string workingFolder)
        {
            this.workingFolder = workingFolder;
            CheckTargetDirectory();
        }

        public async Task<IEnumerable<AttachmentViewModel>> Get()
        {
            List<AttachmentViewModel> attachments = new List<AttachmentViewModel>();

            DirectoryInfo attachmentFolder = new DirectoryInfo(this.workingFolder);

            await Task.Factory.StartNew(() =>
            {
                attachments = attachmentFolder.EnumerateFiles()
                                            .Where(fi => new[] { ".jpg", ".bmp", ".png", ".gif", ".tiff" }.Contains(fi.Extension.ToLower()))
                                            .Select(fi => new AttachmentViewModel
                                            {
                                                Name = fi.Name                                             
                                                //Created = fi.CreationTime,
                                                //Modified = fi.LastWriteTime,
                                                //Size = fi.Length / 1024
                                            })
                                            .ToList();
            });

            return attachments;
        }

        public async Task<IEnumerable<AttachmentViewModel>> GetById(int mtgId)
        {
            List<AttachmentViewModel> attachments = new List<AttachmentViewModel>();

            DirectoryInfo attachmentFolder = new DirectoryInfo(this.workingFolder + @"\"+ mtgId);

            var excludedExts = new List<string> {".db" };

            await Task.Factory.StartNew(() =>
            {
                using (Impersonate i = new Impersonate(user, pass, domain))
                {
                    if (i.isImpersonated())
                    {
                        attachments = attachmentFolder.EnumerateFiles()
                            //.Where(fi => new[] { ".jpg", ".bmp", ".png", ".gif", ".tiff" }.Contains(fi.Extension.ToLower()))
                            //                        .Select(fi => new AttachmentViewModel
                            //                        {
                            //                            Name = fi.Name,
                            //                            Created = fi.CreationTime,
                            //                            Modified = fi.LastWriteTime,
                            //                            Size = fi.Length / 1024
                            //                        })
                            //                        .ToList();

                        .Where(fi => !excludedExts.Contains(fi.Extension.ToLower()))
                                                    .Select(fi => new AttachmentViewModel
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

            return attachments;
            
        }

        public async Task<AttachmentActionResult> Delete(string fileName)
        {                         
            try
            {
                var filePath = Directory.GetFiles(this.workingFolder, fileName)
                                .FirstOrDefault();

                await Task.Factory.StartNew(() =>
                {
                    File.Delete(filePath);
                });

                return new AttachmentActionResult { Successful = true, Message = fileName + "deleted successfully" };
            }
            catch (Exception ex)
            {
                return new AttachmentActionResult { Successful = false, Message = "error deleting fileName " + ex.GetBaseException().Message };
            }            
        }

        public async Task<AttachmentActionResult> DeleteById(int mtgId, string fileName)
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

                return new AttachmentActionResult { Successful = true, Message = fileName + "deleted successfully" };
            }
            catch (Exception ex)
            {
                return new AttachmentActionResult { Successful = false, Message = "error deleting fileName " + ex.GetBaseException().Message };
            }
        }

        public async Task<AttachmentActionResult> DeleteByMtgNumber(string mtgNumber, string fileName)
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

                return new AttachmentActionResult { Successful = true, Message = fileName + "deleted successfully" };
            }
            catch (Exception ex)
            {
                return new AttachmentActionResult { Successful = false, Message = "error deleting fileName " + ex.GetBaseException().Message };
            }
        }

        public async Task<IEnumerable<AttachmentViewModel>> Add(HttpRequestMessage request)
        {
            var provider = new AttachmentMultipartFormDataStreamProvider(this.workingFolder);
            
            await request.Content.ReadAsMultipartAsync(provider);

            var attachments = new List<AttachmentViewModel>();

            foreach(var file in provider.FileData)
            {
                var fileInfo = new FileInfo(file.LocalFileName);

                attachments.Add(new AttachmentViewModel
                {
                    Name = fileInfo.Name
                    //Created = fileInfo.CreationTime,
                    //Modified = fileInfo.LastWriteTime,
                    //Size = fileInfo.Length /1024
                });                
            }

            return attachments;            
        }

        public async Task<IEnumerable<AttachmentViewModel>> AddToDir(int mtgId, HttpRequestMessage request)
        {
            var attachments = new List<AttachmentViewModel>();

            var provider = await request.Content.ReadAsMultipartAsync<InMemoryMultipartFormDataStreamProvider>(new InMemoryMultipartFormDataStreamProvider());

            //access form data
            NameValueCollection formData = provider.FormData;

            //access files
            IList<HttpContent> files = provider.Files;

            //Example: reading a file's stream like below
            HttpContent file1 = files[0];
            Stream file1Stream = await file1.ReadAsStreamAsync();

            var thisFileName = !string.IsNullOrWhiteSpace(file1.Headers.ContentDisposition.Name) ? file1.Headers.ContentDisposition.Name : "NoName";

            var newFileName = thisFileName.Trim(new char[] { '"' }).Replace("&", "and");

            var dirFileName = Path.Combine(Path.Combine(this.workingFolder, mtgId.ToString()), newFileName);

            try
            {
                FileInfo fileInfo = null;// = new FileInfo(dirFileName);
                using (Impersonate i = new Impersonate(user, pass, domain))
                {
                    if (i.isImpersonated())
                    {
                        if (File.Exists(dirFileName))
                        {
                            File.Delete(dirFileName);
                        }

                        using (FileStream  fileStream = File.Create(dirFileName))
                        {
                            file1Stream.Seek(0, SeekOrigin.Begin);
                            file1Stream.CopyTo(fileStream);
                        }
                        fileInfo = new FileInfo(dirFileName);
                    }
                }


                attachments.Add(new AttachmentViewModel
                {
                    Name = fileInfo.Name
                    //Created = fileInfo.CreationTime,
                    //Modified = fileInfo.LastWriteTime,
                    //Size = fileInfo.Length / 1024
                });

                return attachments;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            //using (Impersonate i = new Impersonate(user, pass, domain))
            //{
            //    if (i.isImpersonated())
            //    {                    
            //        var streamProvider = new AttachmentMultipartFormDataStreamProvider(Path.Combine(this.workingFolder, mtgId.ToString()));

            //        try
            //        {
            //            await request.Content.ReadAsMultipartAsync(streamProvider);

            //            foreach (var file in streamProvider.FileData)
            //            {
            //                var fileInfo = new FileInfo(file.LocalFileName);

            //                attachments.Add(new AttachmentViewModel
            //                {
            //                    Name = fileInfo.Name,
            //                    Created = fileInfo.CreationTime,
            //                    Modified = fileInfo.LastWriteTime,
            //                    Size = fileInfo.Length / 1024
            //                });
            //            }
            //        }
            //        catch (Exception e)
            //        {
            //            throw new Exception(e.Message);
            //        }

            //        //var task = await request.Content.ReadAsMultipartAsync(provider).ContinueWith(t =>
            //        //{
            //        //    AttachmentMultipartFormDataStreamProvider newProvider = t.Result;

            //        //    foreach (var file in newProvider.FileData)
            //        //    {
            //        //        var fileInfo = new FileInfo(file.LocalFileName);

            //        //        attachments.Add(new AttachmentViewModel
            //        //        {
            //        //            Name = fileInfo.Name,
            //        //            Created = fileInfo.CreationTime,
            //        //            Modified = fileInfo.LastWriteTime,
            //        //            Size = fileInfo.Length / 1024
            //        //        });
            //        //    }
            //        //    return attachments;
            //        //});

            //        //var provider = new AttachmentMultipartFormDataStreamProvider(this.workingFolder + @"\" + mtgId);

            //        //await request.Content.ReadAsMultipartAsync();

            //        //foreach (var file in provider.FileData)
            //        //{
            //        //    var fileInfo = new FileInfo(file.LocalFileName);

            //        //    attachments.Add(new AttachmentViewModel
            //        //    {
            //        //        Name = fileInfo.Name,
            //        //        Created = fileInfo.CreationTime,
            //        //        Modified = fileInfo.LastWriteTime,
            //        //        Size = fileInfo.Length / 1024
            //        //    });
            //        //}

            //        //return attachments;
            //    }
            //    //return attachments;
            //    //return new List<AttachmentViewModel>();
            //}            
        }

        public async Task<IEnumerable<AttachmentViewModel>> AddToDir(string mtgNumber, HttpRequestMessage request)
        {
            var attachments = new List<AttachmentViewModel>();

            var provider = await request.Content.ReadAsMultipartAsync<InMemoryMultipartFormDataStreamProvider>(new InMemoryMultipartFormDataStreamProvider());

            //access form data
            NameValueCollection formData = provider.FormData;

            //access files
            IList<HttpContent> files = provider.Files;

            //Example: reading a file's stream like below
            HttpContent file1 = files[0];
            Stream file1Stream = await file1.ReadAsStreamAsync();

            var thisFileName = !string.IsNullOrWhiteSpace(file1.Headers.ContentDisposition.Name) ? file1.Headers.ContentDisposition.Name : "NoName";

            var newFileName = thisFileName.Trim(new char[] { '"' }).Replace("&", "and");

            var dirFileName = Path.Combine(Path.Combine(this.workingFolder, mtgNumber), newFileName);

            try
            {
                FileInfo fileInfo = null;// new FileInfo(dirFileName);
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

                attachments.Add(new AttachmentViewModel
                {
                    Name = fileInfo.Name
                    //Created = fileInfo.CreationTime,
                    //Modified = fileInfo.LastWriteTime,
                    //Size = fileInfo.Length / 1024
                });

                return attachments;
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
            var newFileName = fileName.Trim(new char[] { '"' }).Replace("&", "and");

            var file = "";

            using (Impersonate i = new Impersonate(user, pass, domain))
            {
                if (i.isImpersonated())
                {
                    file = Directory.GetFiles(this.workingFolder + @"\\" + mtgId, newFileName)
                                        .FirstOrDefault();
                }
            }

            return file != null;
        }

        public bool FileExists(string mtgNumber, string fileName)
        {
            var newFileName = fileName.Trim(new char[] { '"' }).Replace("&", "and");

            var file = "";

            using (Impersonate i = new Impersonate(user, pass, domain))
            {
                if (i.isImpersonated())
                {
                    file = Directory.GetFiles(this.workingFolder + @"\\" + mtgNumber, newFileName)
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

        //public bool CheckTargetMtgDirectory(int mtgId)
        //{
        //    string thisDir = this.workingFolder + @"\" + mtgId;
        //    using (Impersonate i = new Impersonate(user, pass, domain))
        //    {
        //        if (i.isImpersonated())
        //        {
        //            if (!Directory.Exists(thisDir))
        //            {
        //                Directory.CreateDirectory(thisDir);
        //                //throw new ArgumentException("the destination path " + this.workingFolder + " could not be found");

        //            }
        //            return true;
        //        }

        //        return false;
        //    }
        //}

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
        
        public FileStream GetAttachmentFileStream(string filePath)
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