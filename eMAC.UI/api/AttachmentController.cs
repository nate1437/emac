using System.Net;
using System.Net.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using WebApiAngularJsUploader.Attachment;
using WebApiAngularJsUploader.Models;
using System;
using System.IO;
using System.Data;
using System.Net.Http.Headers;
using System.Web.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using eMAC.Domain.Entities;
using eMAC.Infra.Domain;
using eMAC.Infra.Common;
using System.Linq;


namespace eMAC.UI.api
{
    public class AttachmentController : ApiController
    {
        private static string _fileDump = WebConfigurationManager.AppSettings["FileDump"];

        private IAttachmentManager _attachmentManager;
        private IAttachmentsRepository _attachmentRepo;
        private IMeetingActionHistoryRepository _meetingActionRepository;
        private IMeetingRepository _meetingRepo;

        //public AttachmentController()
        //    : this(new LocalAttachmentManager(_fileDump + "Attachments"))
        //{
        //    //System.IO.Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().GetName().CodeBase) + @"\Album")
        //}      

        public AttachmentController(
            IAttachmentsRepository attachmentRepo,
            IMeetingActionHistoryRepository meetingActionRepository,
            IMeetingRepository meetingRepo
            )
        {
            this._attachmentManager = new LocalAttachmentManager(_fileDump);
            this._attachmentRepo = attachmentRepo;
            this._meetingActionRepository = meetingActionRepository;
            this._meetingRepo = meetingRepo;
        }

        // GET: api/Photo
        [ActionName("GetAll")]
        public async Task<HttpResponseMessage> Get()
        {
            var results = await _attachmentManager.Get();
            //return (new { photos = results });

            return this.Request.CreateResponse(HttpStatusCode.OK, new { photos = results });
        }

        // GET api/attachment/5
        [ActionName("Get")]
        public async Task<HttpResponseMessage> GetById(int mtgId, string mtgNo)
        {
            var attachments = new List<UploadGetNeeded>();
            try
            {
                bool isDirAvailable = _attachmentManager.CheckTargetMtgDirectory(mtgNo);

                if (isDirAvailable)
                {
                    var dsMeetingDocuments = _attachmentRepo.GetEntity(
                        StoredProcs.MtgDocumentsObjectGet,
                        new Dictionary<string, object>() 
                        { 
                            {"@mtg_id", mtgId}
                        }
                    );

                    if (dsMeetingDocuments != null)
                    {
                        var meetingDocsEntity = JsonConvert.DeserializeObject<List<UploadGetNeeded>>(JsonConvert.SerializeObject(dsMeetingDocuments.Tables[0]));
                        foreach (var attachment in meetingDocsEntity)
                        {
                            if (attachment.upload_type == "file")
                            {
                                var docFileName = attachment.file_name;

                                if (this._attachmentManager.FileExists(mtgNo, docFileName))
                                {
                                    attachments.Add(attachment);
                                }
                            }
                            else if (attachment.upload_type == "link" || attachment.upload_type == "unc")
                            {
                                attachments.Add(attachment);
                            }
                        }

                        return this.Request.CreateResponse(HttpStatusCode.OK, new { mtg_docs = JsonConvert.SerializeObject(attachments) });
                    }
                }
                return this.Request.CreateResponse(HttpStatusCode.NotFound, new { });
            }
            catch (Exception ex)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }
        }

        [ActionName("Download")]
        public HttpResponseMessage Get(int mtgId, string mtgNo, string fileName)
        {

            if (!this._attachmentManager.FileExists(mtgNo, fileName))
            {
                return this.Request.CreateResponse(HttpStatusCode.NotFound, "Not found");
            }

            var path = this._attachmentManager.GetFilePath(mtgNo, fileName);

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            var stream = _attachmentManager.GetAttachmentFileStream(path);
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType =
                new MediaTypeHeaderValue("application/octet-stream");

            result.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
            result.Content.Headers.ContentDisposition.FileName = fileName;
            return result;
        }

        // POST: api/Photo
        [ActionName("Save")]
        public async Task<HttpResponseMessage> PostSave(int mtgId, string mtgNo, string fileName, string value)
        {
            //Upload uploadObj = JsonConvert.DeserializeObject<Upload>(value);
            //var mtgDocObject = "[]";
            //IDictionary<string, object> parameters;
            //var getParams = new Dictionary<string, object>();
            //var upDateParams = new Dictionary<string, object>();
            //var mtgGetParams = new Dictionary<string, object>();
            //var meetingDocumentParam = new Dictionary<string, object>();

            try
            {
                Upload uploadEntity = JsonConvert.DeserializeObject<Upload>(value);
                uploadEntity.mtg_id = mtgId;
                if (uploadEntity.upload_type == "file")
                {
                    if (!Request.Content.IsMimeMultipartContent("form-data"))
                    {
                        return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Unsupported media type");
                    }

                    if (!this._attachmentManager.FileExists(mtgNo, fileName))
                    {
                        int result = _attachmentRepo.InsertEntity(StoredProcs.MtgDocumentsObjectSave, (Dictionary<string,object>)uploadEntity.AsDictionary());
                        var files = await _attachmentManager.AddToDir(mtgNo, Request);
                        LogMeetingAction(uploadEntity);

                        //return Ok(new { Message = "Photos uploaded ok", Photos = photos });
                        return this.Request.CreateResponse(HttpStatusCode.OK, new
                        {
                            mtg_docs = new List<UploadGetNeeded>()
                            {
                                new UploadGetNeeded()
                                {
                                    meeting_document_id = result,
                                    date_updated = DateTime.Now,
                                    doc_title = "",
                                    doc_type = "file",
                                    mtg_id = mtgId,
                                    file_name = fileName,
                                    updated_by = uploadEntity.user_name,
                                    upload_type = "file"
                                }
                            }
                        });
                    }
                    return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Failed to update attachment. File already exists");
                }
                else
                {
                    var result = _attachmentRepo.InsertEntity(StoredProcs.MtgDocumentsObjectSave, (Dictionary<string, object>)uploadEntity.AsDictionary());
                    var getFileList = _attachmentRepo.GetEntity(StoredProcs.MtgDocumentsObjectGet, new Dictionary<string, object>()
                        {
                            {"@mtg_id", mtgId}
                        });
                    var fileList = getFileList.Tables.Count > 0 ? ((JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(getFileList.Tables[0]))).ToObject<IEnumerable<UploadGetNeeded>>() : null;
                    if (fileList != null)
                    {
                        var filter = fileList.Where(x => x.meeting_document_id == result).ToList();
                        LogMeetingAction(uploadEntity);
                        return this.Request.CreateResponse(HttpStatusCode.OK, new { mtg_docs = filter });
                    }
                    return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Failed to save attachment.");
                }

            }
            catch (Exception ex)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }
        }

        // DELETE: api/Photo/5
        [ActionName("Delete")]
        public async Task<HttpResponseMessage> PostDel(int mtgDocId, int mtgId, string mtgNo, string fileName)//int mtgId, string fileName, string fileObj)
        {
            DataSet dsMeetingDocuments = _attachmentRepo.GetEntity(StoredProcs.MtgDocumentsObjectGet, new Dictionary<string, object>() { 
                {"@mtg_id", mtgId}
            });

            List<UploadGetNeeded> meetingDocumentsEntity = dsMeetingDocuments != null ?
                dsMeetingDocuments.Tables.Count > 0 ? ((JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(dsMeetingDocuments.Tables[0]))).ToObject<List<UploadGetNeeded>>() : null : null;

            if (meetingDocumentsEntity != null)
            {

                UploadGetNeeded deleteDoc = meetingDocumentsEntity.Where(x => x.meeting_document_id == mtgDocId).SingleOrDefault();
                if (deleteDoc != null)
                {
                    if (deleteDoc.upload_type == "file")
                    {
                        AttachmentActionResult result = null;
                        if (this._attachmentManager.FileExists(mtgNo, fileName))
                        {
                            result = await this._attachmentManager.DeleteByMtgNumber(mtgNo, fileName);

                            if (result.Successful)
                            {
                                _attachmentRepo.DeleteEntity(StoredProcs.MtgDocumentDelete, new Dictionary<string, object>()
                                {
                                    {"@meeting_document_id", mtgDocId}
                                });

                                return this.Request.CreateResponse(HttpStatusCode.OK, 
                                    new 
                                    { 
                                        message = result.Message,
                                        doclist = meetingDocumentsEntity.Where(x => x.meeting_document_id != deleteDoc.meeting_document_id).ToList()
                                    });
                            }
                        }
                    }
                    else
                    {
                        _attachmentRepo.DeleteEntity(StoredProcs.MtgDocumentDelete, new Dictionary<string, object>()
                                {
                                    {"@meeting_document_id", mtgDocId}
                                });
                        return this.Request.CreateResponse(HttpStatusCode.OK, 
                            new { 
                                message = deleteDoc.doc_title + " deleted successfully",
                                doclist = meetingDocumentsEntity.Where(x => x.meeting_document_id != deleteDoc.meeting_document_id).ToList()
                            });
                    }
                }
            }

            return this.Request.CreateResponse(HttpStatusCode.NotFound, "Not found");
        }

        // PUT api/attachment/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/attachment/5
        public void Delete(int id)
        {
        }

        private void LogMeetingAction(Upload uploadObj)
        {
            MeetingActionHistoryInsert actionInsert = new MeetingActionHistoryInsert()
            {
                mtg_id = uploadObj.mtg_id,
                action = "Attachment uploaded.",
                action_by = uploadObj.user_name,
                remarks = "Added attachment : " + uploadObj.file_name
            };

            //iterate thru list
            if (actionInsert != null)
            {        
                _meetingActionRepository.UpdateEntity(StoredProcs.MtgActionInsert, (Dictionary<string, object>)actionInsert.AsDictionary());
            }
        }
    }
}
