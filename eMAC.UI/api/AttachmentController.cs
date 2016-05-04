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
        public async Task<HttpResponseMessage> GetById(int mtgId)
        {
            var parameters = new Dictionary<string, object>();
            var mtgGetParams = new Dictionary<string, object>();
            var mtgDocObject = "[]";
            var attachments = new List<UploadGetNeeded>();

            try
            {
                // get meeting data
                mtgGetParams.Add("@mtg_id", mtgId);
                var mtgList = _meetingRepo.GetEntity(StoredProcs.MtgGetHeader, mtgGetParams);
                var mtgNumber = mtgList.Tables[0].Rows[0]["mtg_no"].ToString();

                //bool isDirAvailable = _attachmentManager.CheckTargetMtgDirectory(mtgId);
                bool isDirAvailable = _attachmentManager.CheckTargetMtgDirectory(mtgNumber);

                if (isDirAvailable)
                {
                    //var results = await _attachmentManager.GetById(mtgId);
                    //return (new { photos = results });

                    // get file record
                    parameters.Add("@mtg_id", mtgId);
                    var mtgDocData = _attachmentRepo.GetEntity(StoredProcs.MtgDocumentsObjectGet, parameters);

                    var meetingAttachmentObject = JsonConvert.SerializeObject(mtgDocData.Tables[0]);
                    var attachObjects = JsonConvert.DeserializeObject<List<UploadGetNeeded>>(meetingAttachmentObject.ToString());

                    foreach (var attachment in attachObjects)
                    {
                        if (attachment.upload_type == "file")
                        {
                            var docFileName = attachment.file_name;

                            if (this._attachmentManager.FileExists(mtgNumber, docFileName))
                            {
                                attachments.Add(attachment);
                            }
                        }
                        else if (attachment.upload_type == "link" || attachment.upload_type == "unc")
                        {
                            attachments.Add(attachment);
                        }

                        mtgDocObject = JsonConvert.SerializeObject(attachments);
                    }

                    //return this.Request.CreateResponse(HttpStatusCode.OK, new { photos = results });
                    return this.Request.CreateResponse(HttpStatusCode.OK, new { mtg_docs = mtgDocObject });
                }
                else
                    return this.Request.CreateResponse(HttpStatusCode.NotFound, new { });
            }
            catch (Exception ex)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }
        }
        // download
        [ActionName("Download")]
        public HttpResponseMessage Get(int mtgId, string fileName)
        {
            var mtgGetParams = new Dictionary<string, object>();

            // get meeting data
            mtgGetParams.Add("@mtg_id", mtgId);
            var mtgList = _meetingRepo.GetEntity(StoredProcs.MtgGetHeader, mtgGetParams);
            var mtgNumber = mtgList.Tables[0].Rows[0]["mtg_no"].ToString();


            if (!this._attachmentManager.FileExists(mtgNumber, fileName))
            {
                return this.Request.CreateResponse(HttpStatusCode.NotFound, "Not found");
            }

            var path = this._attachmentManager.GetFilePath(mtgNumber, fileName);

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            var stream = _attachmentManager.GetAttachmentFileStream(path);
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentType =
                new MediaTypeHeaderValue("application/octet-stream");

            result.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
            result.Content.Headers.ContentDisposition.FileName = fileName;
            //HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            //response.Content = new StreamContent(new FileStream(localFilePath, FileMode.Open, FileAccess.Read));
            //response.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
            //response.Content.Headers.ContentDisposition.FileName = fileName;



            return result;
        }

        // POST: api/Photo
        [ActionName("Save")]
        public async Task<HttpResponseMessage> PostSave(int mtgId, string fileName, string value)
        {
            Upload uploadObj = JsonConvert.DeserializeObject<Upload>(value);
            var mtgDocObject = "[]";
            IDictionary<string, object> parameters;
            var getParams = new Dictionary<string, object>();
            var upDateParams = new Dictionary<string, object>();
            var mtgGetParams = new Dictionary<string, object>();
            var meetingDocumentParam = new Dictionary<string, object>();

            try
            {
                // get meeting data
                mtgGetParams.Add("@mtg_id", mtgId);
                var mtgList = _meetingRepo.GetEntity(StoredProcs.MtgGetHeader, mtgGetParams);
                var mtgNumber = mtgList.Tables[0].Rows[0]["mtg_no"].ToString();
                
                if (uploadObj.upload_type == "file")
                {
                    // Check if the request contains multipart/form-data.
                    if (!Request.Content.IsMimeMultipartContent("form-data"))
                    {
                        //eturn BadRequest("Unsupported media type");
                        return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Unsupported media type");
                    }

                    if (!this._attachmentManager.FileExists(mtgNumber, fileName))
                    {
                        uploadObj.mtg_id = mtgId;
                        //if (uploadObj.upload_type == "link")
                        //    uploadObj.file_name = uploadObj.doc_title;

                        parameters = uploadObj.AsDictionary();
                        // insert row data
                        var result = _attachmentRepo.InsertEntity(StoredProcs.MtgDocumentsObjectSave, (Dictionary<string, object>)parameters);

                        // create the file
                        var files = await _attachmentManager.AddToDir(mtgNumber, Request);

                        // log action
                        LogMeetingAction(uploadObj);

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
                                    updated_by = uploadObj.user_name,
                                    upload_type = "file"
                                }
                            }
                        });
                    }
                    /*else
                    {
                        meetingDocumentParam.Add("@mtg_id", mtgId);
                        var getFileList = _attachmentRepo.GetEntity(StoredProcs.MtgDocumentsObjectGet, meetingDocumentParam);
                        var fileList = getFileList.Tables.Count > 0 ? ((JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(getFileList.Tables[0]))).ToObject<IEnumerable<UploadGetNeeded>>() : null;

                        if (fileList != null)
                        {
                            var filter = fileList.Where(x => x.file_name == fileName).SingleOrDefault();

                            upDateParams.Add("@mtg_doc_id", filter.meeting_document_id);
                            upDateParams.Add("@user_name", uploadObj.user_name);
                            _attachmentRepo.UpdateEntity(StoredProcs.MtgDocumentUpdate, upDateParams);

                            // create the file
                            var files = await _attachmentManager.AddToDir(mtgNumber, Request);

                            // log action
                            LogMeetingAction(uploadObj);

                            //return Ok(new { Message = "Photos uploaded ok", Photos = photos });
                            return this.Request.CreateResponse(HttpStatusCode.OK, new
                            {
                                mtg_docs = filter
                            });
                        }
                        return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Failed to update attachment. File already exists");
                    }*/

                    return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Failed to update attachment. File already exists");
                }
                // link
                else
                {
                    uploadObj.mtg_id = mtgId;
                    parameters = uploadObj.AsDictionary();

                    // insert row data
                    var result = _attachmentRepo.InsertEntity(StoredProcs.MtgDocumentsObjectSave, (Dictionary<string, object>)parameters);

                    meetingDocumentParam.Add("@mtg_id", mtgId);
                    var getFileList = _attachmentRepo.GetEntity(StoredProcs.MtgDocumentsObjectGet, meetingDocumentParam);
                    var fileList = getFileList.Tables.Count > 0 ? ((JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(getFileList.Tables[0]))).ToObject<IEnumerable<UploadGetNeeded>>() : null;
                    if (fileList != null)
                    {
                        var filter = fileList.Where(x => x.meeting_document_id == result).ToList();
                        // log action
                        LogMeetingAction(uploadObj);

                        //return Ok(new { Message = "Photos uploaded ok", Photos = photos });
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
        public async Task<HttpResponseMessage> PostDel(int mtgDocId, int mtgId, string fileName)//int mtgId, string fileName, string fileObj)
        {
            /* NEW HANDLING */

            var getDocumentParam = new Dictionary<string, object>();

            getDocumentParam.Add("@mtg_id", mtgId);

            var mtgDocs = _attachmentRepo.GetEntity(StoredProcs.MtgDocumentsObjectGet, getDocumentParam);
            var mtgDocsDictionary = mtgDocs.Tables.Count > 0 ? ((JArray)JsonConvert.DeserializeObject(JsonConvert.SerializeObject(mtgDocs.Tables[0]))).ToObject<IEnumerable<UploadGetNeeded>>() : null;

            if (mtgDocsDictionary != null)
            {
                
                var deleteDoc = mtgDocsDictionary.Where(x => x.meeting_document_id == mtgDocId).SingleOrDefault();
                if (deleteDoc != null)
                {
                    if (deleteDoc.upload_type == "file")
                    {
                        var mtg = _meetingRepo.GetEntity(StoredProcs.MtgGetHeader, new Dictionary<string, object>() { { "@mtg_id", mtgId } });
                        var mtgNumber = mtg.Tables[0].Rows[0]["mtg_no"].ToString();
                        AttachmentActionResult result = null;
                        if (this._attachmentManager.FileExists(mtgNumber, fileName))
                        {
                            result = await this._attachmentManager.DeleteByMtgNumber(mtgNumber, fileName);

                            if (result.Successful)
                            {
                                var deleteParam = new Dictionary<string, object>()
                                {
                                    {"@meeting_document_id", mtgDocId}
                                };
                                _attachmentRepo.DeleteEntity(StoredProcs.MtgDocumentDelete, deleteParam);

                                return this.Request.CreateResponse(HttpStatusCode.OK, 
                                    new 
                                    { 
                                        message = result.Message,
                                        doclist = mtgDocsDictionary.Where(x=> x.meeting_document_id != deleteDoc.meeting_document_id).ToList()
                                    });
                            }
                        }
                    }
                    else
                    {
                        var deleteParam = new Dictionary<string, object>()
                                {
                                    {"@meeting_document_id", mtgDocId}
                                };
                        _attachmentRepo.DeleteEntity(StoredProcs.MtgDocumentDelete, deleteParam);
                        return this.Request.CreateResponse(HttpStatusCode.OK, 
                            new { 
                                message = deleteDoc.doc_title + " deleted successfully", 
                                doclist = mtgDocsDictionary.Where(x=> x.meeting_document_id != deleteDoc.meeting_document_id).ToList() });
                    }
                }
            }

            return this.Request.CreateResponse(HttpStatusCode.NotFound, "Not found");

            /*
            UploadGet uploadObj = JsonConvert.DeserializeObject<UploadGet>(fileObj);
            var parameters = new Dictionary<string, object>();
            var mtgGetParams = new Dictionary<string, object>();

            // get meeting data
            mtgGetParams.Add("@mtg_id", mtgId);
            var mtgList = _meetingRepo.GetEntity(StoredProcs.MtgGetHeader, mtgGetParams);
            var mtgNumber = mtgList.Tables[0].Rows[0]["mtg_no"].ToString();

            if (uploadObj.upload_type == "file")
            {
                if (!this._attachmentManager.FileExists(mtgNumber, fileName))
                {
                    return this.Request.CreateResponse(HttpStatusCode.NotFound, "Not found");
                }

                var result = await this._attachmentManager.DeleteByMtgNumber(mtgNumber, fileName);

                if (result.Successful)
                {
                    parameters.Add("@meeting_document_id", uploadObj.meeting_document_id);
                    _attachmentRepo.DeleteEntity(StoredProcs.MtgDocumentDelete, parameters);

                    //return Ok(new { message = result.Message });
                    return this.Request.CreateResponse(HttpStatusCode.OK, new { message = result.Message });
                }
                else
                {
                    //return BadRequest(result.Message);
                    return this.Request.CreateResponse(HttpStatusCode.BadRequest, result.Message);
                }
            }
            else
            {
                parameters.Add("@meeting_document_id", uploadObj.meeting_document_id);
                _attachmentRepo.DeleteEntity(StoredProcs.MtgDocumentDelete, parameters);

                //return Ok(new { message = result.Message });
                return this.Request.CreateResponse(HttpStatusCode.OK, new { message = uploadObj.doc_title + "deleted successfully" });
            }*/
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
            IDictionary<string, object> parameters;
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
                parameters = actionInsert.AsDictionary();
                // update row data                       
                _meetingActionRepository.UpdateEntity(StoredProcs.MtgActionInsert, (Dictionary<string, object>)parameters);
            }
        }
    }
}
