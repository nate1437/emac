using eMAC.Domain.Entities;
using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.Http;
using WebApiAngularJsUploader.MeetingReport;

namespace eMAC.UI.api
{
    public class FinalReportController : ApiController
    {
        private static string _fileDump = WebConfigurationManager.AppSettings["FileDump"];

        private IMeetingReportManager _mtgReportManager;
        private IMeetingReportRepository _mtgReportRepo;
        private IMeetingActionHistoryRepository _meetingActionRepository;

        //public FinalReportController()
        //    : this(new LocalMeetingReportManager(_fileDump + "FinalReport"))
        //{

        //}

        public FinalReportController(
            IMeetingReportRepository mtgReportRepo,
            IMeetingActionHistoryRepository mtgActionRepo)
        {
            this._mtgReportManager = new LocalMeetingReportManager(_fileDump);
            this._mtgReportRepo = mtgReportRepo;
            this._meetingActionRepository = mtgActionRepo;
        }

        // GET api/meetingreport/5
        [ActionName("GetFinalMtgReport")]
        public async Task<HttpResponseMessage> GetById(int mtgId, string mtgNumber)
        {           
            var parameters = new Dictionary<string, object>();
            var mtgFinalReportObject = "[]";

            try
            {
                // get meeting data
                //mtgGetParams.Add("@mtg_id", mtgId);
                //var mtgList = _meetingRepo.GetEntity(StoredProcs.MtgGetHeader, mtgGetParams);
                //var mtgNumber = mtgList.Tables[0].Rows[0]["mtg_no"].ToString();

                bool isDirAvailable = this._mtgReportManager.CheckTargetMtgDirectory(mtgNumber);

                if (isDirAvailable)
                {

                    var newSummReportCsFileName = mtgNumber + "_Final_Report.pdf";
                    //var results = await this._mtgReportManager.GetById(mtgId);
                    ////return (new { photos = results });

                    //if (results.Count() > 0)
                    //{
                    //    parameters.Add("@mtg_id", mtgId);
                    //    parameters.Add("@report_type", "F");
                    //    var mtgReportData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportGet, parameters);

                    //    mtgFinalReportObject = JsonConvert.SerializeObject(mtgReportData.Tables[0]);
                    //}

                    // get file record
                    parameters.Add("@mtg_id", mtgId);
                    //parameters.Add("@report_type", "F");
                    var mtgReportData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportGet, parameters);
                    //var finalRepFileName = mtgReportData.Tables[0].Rows[0]["final_report_filename"].ToString();


                    // get actual file
                    if (!this._mtgReportManager.FileExists(mtgNumber, newSummReportCsFileName))
                    {
                        return this.Request.CreateResponse(HttpStatusCode.OK, new { final_reports = mtgFinalReportObject});
                    }

                    if (newSummReportCsFileName.ToString() != null
                        || newSummReportCsFileName.ToString() != string.Empty)
                    {
                        mtgFinalReportObject = JsonConvert.SerializeObject(mtgReportData.Tables[0]);
                    }

                    return this.Request.CreateResponse(HttpStatusCode.OK, new { final_reports = mtgFinalReportObject });
                }
                else
                    return this.Request.CreateResponse(HttpStatusCode.NotFound, new { });
            }
            catch (Exception ex)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }
        }
        [ActionName("GetFinalMtgReportCs")]
        public async Task<HttpResponseMessage> GetCsById(int mtgId, string mtgNumber)
        {
            
            var finRepObjParams = new Dictionary<string, object>();
            var mtgFinalReportCsObject = "[]";

            try
            {
                bool isDirAvailable = this._mtgReportManager.CheckTargetMtgDirectory(mtgNumber);

                if (isDirAvailable)
                {
                    //var results = await this._mtgReportManager.GetById(mtgId);
                    //return (new { photos = results });

                    // summary report file name
                    var newSummReportCsFileName = mtgNumber + "_Final_Report_Cs.pdf";


                    // get file record
                    finRepObjParams.Add("@mtg_id", mtgId);
                    // finRepObjParams.Add("@report_type", "F");
                    var mtgReportData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportGet, finRepObjParams);
                    //var summRepFileName = mtgReportData.Tables[0].Rows[0]["summary_report_filename"].ToString();


                    // get actual file
                    if (!this._mtgReportManager.FileExists(mtgNumber, newSummReportCsFileName))
                    {
                        return this.Request.CreateResponse(HttpStatusCode.OK, new { fin_cs_reports = mtgFinalReportCsObject });
                    }

                    if (newSummReportCsFileName.ToString() != null
                        || newSummReportCsFileName.ToString() != string.Empty)
                    {
                        mtgFinalReportCsObject = JsonConvert.SerializeObject(mtgReportData.Tables[0]);
                    }

                    return this.Request.CreateResponse(HttpStatusCode.OK, new { fin_cs_reports = mtgFinalReportCsObject });
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
        public HttpResponseMessage Get(int mtgId, string mtgNumber)
        {
            var fileName = mtgNumber + "_Final_Report.pdf";

            if (!this._mtgReportManager.FileExists(mtgNumber, fileName))
            {
                return this.Request.CreateResponse(HttpStatusCode.NotFound, "Not found");
            }

            var path = this._mtgReportManager.GetFilePath(mtgNumber, fileName);

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            var stream = _mtgReportManager.GetMtgReportFileStream(path);
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
        [ActionName("DownloadCs")]
        public HttpResponseMessage GetDlCs(int mtgId, string mtgNumber)
        {
            // summary report file name
            var fileName = mtgNumber + "_Final_Report_Cs.pdf";

            if (!this._mtgReportManager.FileExists(mtgNumber, fileName))
            {
                return this.Request.CreateResponse(HttpStatusCode.NotFound, "Not found");
            }

            var path = this._mtgReportManager.GetFilePath(mtgNumber, fileName);

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            var stream = _mtgReportManager.GetMtgReportFileStream(path);
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
        /// POST: api/meetingreport
        [ActionName("SaveFinalMtgReport")]
        public async Task<HttpResponseMessage> PostSave(int mtgId, string userName, string fileName)
        {
            var getParams = new Dictionary<string, object>();
            var newFinalReportFileName = fileName + "_Final_Report.pdf";

            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent("form-data"))
            {
                //eturn BadRequest("Unsupported media type");
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Unsupported media type");
            }

            try
            {
                //var files = await _mtgReportManager.AddToDir(mtgId, newFinalReportFileName, Request);
                var files = await _mtgReportManager.AddToDirByMtgNumber(fileName, newFinalReportFileName, Request);

                foreach (var file in files)
                {
                    // update meeting_report
                    var parameters = new Dictionary<string, object>();

                    parameters.Add("@mtg_id", mtgId);
                    parameters.Add("@report_type", "F");
                    //parameters.Add("@report_filename", file.Name);
                    parameters.Add("@user_name", userName);

                    _mtgReportRepo.UpdateEntity(StoredProcs.MtgReportUpdate, parameters);
                }

                getParams.Add("@mtg_id", mtgId);
                //getParams.Add("@report_type", "F");
                var mtgReportData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportGet, getParams);

                var mtgFinalReportObject = JsonConvert.SerializeObject(mtgReportData.Tables[0]);

                MeetingFinalReport uploadObj = JsonConvert.DeserializeObject<List<MeetingFinalReport>>(mtgFinalReportObject)[0];
                // log action
                uploadObj.mtg_id = mtgId;
                uploadObj.final_report_filename = newFinalReportFileName;
                LogMeetingAction(uploadObj);

                //return Ok(new { Message = "Photos uploaded ok", Photos = photos });
                return this.Request.CreateResponse(HttpStatusCode.OK, new { final_reports = mtgFinalReportObject });
            }
            catch (Exception ex)
            {
                //return BadRequest(ex.GetBaseException().Message);
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }

        }
        [ActionName("SaveFinalCsMtgReport")]
        public async Task<HttpResponseMessage> PostSaveCs(int mtgId, string userName, string fileName)
        {
            var getParams = new Dictionary<string, object>();
            var mtgGetParams = new Dictionary<string, object>();

            // summary report file name
            var newFinalReportCsFileName = fileName + "_Final_Report_Cs.pdf";

            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent("form-data"))
            {
                //eturn BadRequest("Unsupported media type");
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Unsupported media type");
            }

            try
            {
                //save file
                //var files = await _mtgReportManager.AddToDir(mtgId, newFinalReportCsFileName, Request);
                var files = await _mtgReportManager.AddToDirByMtgNumber(fileName, newFinalReportCsFileName, Request);

                foreach (var file in files)
                {
                    // update meeting_report
                    var parameters = new Dictionary<string, object>();

                    parameters.Add("@mtg_id", mtgId);
                    parameters.Add("@report_type", "FCS");
                    //parameters.Add("@report_filename", file.Name);
                    parameters.Add("@user_name", userName);

                    _mtgReportRepo.UpdateEntity(StoredProcs.MtgReportCsUpdate, parameters);
                }

                getParams.Add("@mtg_id", mtgId);
                //getParams.Add("@report_type", "F");
                var mtgReportData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportGet, getParams);

                var mtgFinalReportCsObject = JsonConvert.SerializeObject(mtgReportData.Tables[0]);

                MeetingSummaryReport uploadObj = JsonConvert.DeserializeObject<List<MeetingSummaryReport>>(mtgFinalReportCsObject)[0];
                // log action
                uploadObj.mtg_id = mtgId;
                // LogMeetingAction(uploadObj);

                //return Ok(new { Message = "Photos uploaded ok", Photos = photos });
                return this.Request.CreateResponse(HttpStatusCode.OK, new { final_cs_reports = mtgFinalReportCsObject });
            }
            catch (Exception ex)
            {
                //return BadRequest(ex.GetBaseException().Message);
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }

        }
        // DELETE: api/Photo/5
        [ActionName("Delete")]
        public async Task<HttpResponseMessage> PostDel(int mtgId, string mtgNumber, string type)
        {
            var finRepObjParams = new Dictionary<string, object>();
            var fileName = "";

            if (type.ToLower() == "f")
                fileName = mtgNumber + "_Final_Report.pdf";
            else if (type.ToLower() == "fcs")
                fileName = mtgNumber + "_Final_Report_Cs.pdf";

            if (!this._mtgReportManager.FileExists(mtgNumber, fileName))
            {
                return this.Request.CreateResponse(HttpStatusCode.NotFound, "Not found");
            }

            var result = await this._mtgReportManager.DeleteByMtgNumber(mtgNumber, fileName);

            if (result.Successful)
            {
                // get file record
                finRepObjParams.Add("@mtg_id", mtgId);
                finRepObjParams.Add("@report_type", type);
                _mtgReportRepo.DeleteEntity(StoredProcs.MtgReportDelete, finRepObjParams);

                //return Ok(new { message = result.Message });
                return this.Request.CreateResponse(HttpStatusCode.OK, new { message = result.Message });
            }
            else
            {
                //return BadRequest(result.Message);
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, result.Message);
            }
        }

        private void LogMeetingAction(MeetingFinalReport uploadObj)
        {
            IDictionary<string, object> parameters;
            MeetingActionHistoryInsert actionInsert = new MeetingActionHistoryInsert()
            {
                mtg_id = uploadObj.mtg_id,
                action = "Final report file uploaded.",
                action_by = uploadObj.final_report_uploaded_by,
                remarks = "Uploaded final report file: " + uploadObj.final_report_filename
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
