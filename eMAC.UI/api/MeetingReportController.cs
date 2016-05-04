using eMAC.Domain.Entities;
using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.Http;
using WebApiAngularJsUploader.MeetingReport;

namespace eMAC.UI.api
{
    public class MeetingReportController : ApiController
    {
        private static string _fileDump = WebConfigurationManager.AppSettings["FileDump"];

        private IMeetingReportManager _mtgReportManager;
        private IMeetingReportRepository _mtgReportRepo;
        private IMeetingActionHistoryRepository _meetingActionRepository;
        private IMeetingRepository _meetingRepo;

        //public MeetingReportController(IMeetingReportRepository mtgReportRepo)
        //    : this(new LocalMeetingReportManager(_fileDump + "MeetingReport"))
        //{
        //    _mtgReportRepo = mtgReportRepo;
        //}

        public MeetingReportController(
            IMeetingReportRepository mtgReportRepo, 
            IMeetingActionHistoryRepository meetingActionRepository,
            IMeetingRepository meetingRepo)
        {
            this._mtgReportManager = new LocalMeetingReportManager(_fileDump);
            this._mtgReportRepo = mtgReportRepo;
            this._meetingActionRepository = meetingActionRepository;
            this._meetingRepo = meetingRepo;
        }

        // GET api/meetingreport
        [ActionName("GetAll")]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/meetingreport/5
        [ActionName("GetSummaryMtgReport")]
        public async Task<HttpResponseMessage> GetById(int mtgId, string mtgNumber)
        {            
            var reportObjParams = new Dictionary<string, object>();
            var summRepObjParams = new Dictionary<string, object>();
            var mtgGetParams = new Dictionary<string, object>(); 
            var mtgReportObject = "[]";
            var mtgSummReportObject = "[]";

            try
            {
                // get meeting data
                //mtgGetParams.Add("@mtg_id", mtgId);
                //var mtgList = _meetingRepo.GetEntity(StoredProcs.MtgGetHeader, mtgGetParams);
                //var mtgNumber = mtgList.Tables[0].Rows[0]["mtg_no"].ToString();

                bool isDirAvailable = this._mtgReportManager.CheckTargetMtgDirectory(mtgNumber);

                if (isDirAvailable)
                {
                    var newSummReportCsFileName = mtgNumber + "_Summary_Report.pdf";

                    //var results = await this._mtgReportManager.GetById(mtgId);
                    //return (new { photos = results });

                    reportObjParams.Add("@mtg_id", mtgId);
                    var mtgReportObjData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportObjectGet, reportObjParams);
                    mtgReportObject = JsonConvert.SerializeObject(mtgReportObjData.Tables[0]);


                    // get file record
                    summRepObjParams.Add("@mtg_id", mtgId);
                    //summRepObjParams.Add("@report_type", "S");
                    var mtgReportData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportGet, summRepObjParams);
                    //var summRepFileName = mtgReportData.Tables[0].Rows[0]["summary_report_filename"].ToString();


                    // get actual file
                    if (!this._mtgReportManager.FileExists(mtgNumber, newSummReportCsFileName))
                    {
                        return this.Request.CreateResponse(HttpStatusCode.OK, new { summ_reports = mtgSummReportObject, mtg_rep_obj = mtgReportObject });
                    }

                    if (newSummReportCsFileName.ToString() != null
                        || newSummReportCsFileName.ToString() != string.Empty)
                    {
                        mtgSummReportObject = JsonConvert.SerializeObject(mtgReportData.Tables[0]);
                    }                    

                    return this.Request.CreateResponse(HttpStatusCode.OK, new { summ_reports = mtgSummReportObject, mtg_rep_obj = mtgReportObject });
                }
                else
                    return this.Request.CreateResponse(HttpStatusCode.NotFound, new { });
            }
            catch (Exception ex)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }
        }
        [ActionName("GetSummaryMtgReportCs")]
        public async Task<HttpResponseMessage> GetCsById(int mtgId, string mtgNumber)
        {            
            var summRepObjParams = new Dictionary<string, object>();
            var mtgSummReportCsObject = "[]";

            try
            {
                bool isDirAvailable = this._mtgReportManager.CheckTargetMtgDirectory(mtgNumber);

                if (isDirAvailable)
                {
                    //var results = await this._mtgReportManager.GetById(mtgId);
                    //return (new { photos = results });
                                       
                    // summary report file name
                    var newSummReportCsFileName = mtgNumber + "_Summary_Report_Cs.pdf";


                    // get file record
                    summRepObjParams.Add("@mtg_id", mtgId);
                    //summRepObjParams.Add("@report_type", "S");
                    var mtgReportData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportGet, summRepObjParams);
                    //var summRepFileName = mtgReportData.Tables[0].Rows[0]["summary_report_filename"].ToString();


                    // get actual file
                    if (!this._mtgReportManager.FileExists(mtgNumber, newSummReportCsFileName))
                    {
                        return this.Request.CreateResponse(HttpStatusCode.OK, new { summ_cs_reports = mtgSummReportCsObject });
                    }

                    if (newSummReportCsFileName.ToString() != null
                        || newSummReportCsFileName.ToString() != string.Empty)
                    {
                        mtgSummReportCsObject = JsonConvert.SerializeObject(mtgReportData.Tables[0]);
                    }

                    return this.Request.CreateResponse(HttpStatusCode.OK, new { summ_cs_reports = mtgSummReportCsObject});
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
        public HttpResponseMessage GetDl(int mtgId, string mtgNumber)
        {
            var fileName = mtgNumber + "_Summary_Report.pdf";

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
            var fileName = mtgNumber + "_Summary_Report_Cs.pdf";

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
        [ActionName("SaveSummaryMtgReport")]
        public async Task<HttpResponseMessage> PostSave(int mtgId, string userName, string fileName, string rtsparse)
        {
            var getParams = new Dictionary<string, object>();
            var mtgGetParams = new Dictionary<string, object>();

            // summary report file name
            var newSummReportFileName = fileName + "_Summary_Report.pdf";

            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent("form-data"))
            {
                //eturn BadRequest("Unsupported media type");
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Unsupported media type");
            }

            try
            {
                //save file
                //var files = await _mtgReportManager.AddToDir(mtgId, newSummReportFileName, Request);
                var files = await _mtgReportManager.AddToDirByMtgNumber(fileName, newSummReportFileName, Request);

                foreach (var file in files)
                {
                    // update meeting_report
                    var parameters = new Dictionary<string, object>();

                    parameters.Add("@mtg_id", mtgId);
                    parameters.Add("@report_type", "S");
                    //parameters.Add("@report_filename", file.Name);
                    parameters.Add("@user_name", userName);

                    _mtgReportRepo.UpdateEntity(StoredProcs.MtgReportUpdate, parameters);
                }

                getParams.Add("@mtg_id", mtgId);
                //getParams.Add("@report_type", "S");
                var mtgReportData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportGet, getParams);

                var mtgSummReportObject = JsonConvert.SerializeObject(mtgReportData.Tables[0]);

                MeetingSummaryReport uploadObj = JsonConvert.DeserializeObject<List<MeetingSummaryReport>>(mtgSummReportObject)[0];
                // log action
                uploadObj.mtg_id = mtgId;
                uploadObj.summary_report_filename = newSummReportFileName;
                LogMeetingAction(uploadObj);
                /*var request =  WebRequest.Create
                    (
                        ConfigurationManager.AppSettings["RTSParser"].ToString()
                    );
                var requestResult = request.GetJsonRequest
                        (
                            Encoding.UTF8.GetBytes(rtsparse), 
                            new NetworkCredential()
                            {
                                Domain = ConfigurationManager.AppSettings["ImpersonateDomain"].ToString(),
                                Password = new CryptLib.CryptLib().Decrypt3DES(ConfigurationManager.AppSettings["ImpersonatePassword"].ToString()),
                                UserName = ConfigurationManager.AppSettings["ImpersonateUser"].ToString()
                            }
                        );
                 */
                return this.Request.CreateResponse(HttpStatusCode.OK, 
                    new { 
                        summ_reports = mtgSummReportObject,
                        rts_response = ""
                    });

            }
            catch (Exception ex)
            {
                //return BadRequest(ex.GetBaseException().Message);
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }

        }
        [ActionName("SaveSummaryCsMtgReport")]
        public async Task<HttpResponseMessage> PostSaveCs(int mtgId, string userName, string fileName)
        {
            var getParams = new Dictionary<string, object>();
            var mtgGetParams = new Dictionary<string, object>();

            // summary report file name
            var newSummReportCsFileName = fileName + "_Summary_Report_Cs.pdf";

            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent("form-data"))
            {
                //eturn BadRequest("Unsupported media type");
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Unsupported media type");
            }

            try
            {
                //save file
                //var files = await _mtgReportManager.AddToDir(mtgId, newSummReportCsFileName, Request);
                var files = await _mtgReportManager.AddToDirByMtgNumber(fileName, newSummReportCsFileName, Request);

                foreach (var file in files)
                {
                    // update meeting_report
                    var parameters = new Dictionary<string, object>();

                    parameters.Add("@mtg_id", mtgId);
                    parameters.Add("@report_type", "SCS");
                    //parameters.Add("@report_filename", file.Name);
                    parameters.Add("@user_name", userName);

                    _mtgReportRepo.UpdateEntity(StoredProcs.MtgReportCsUpdate, parameters);
                }

                getParams.Add("@mtg_id", mtgId);
                //getParams.Add("@report_type", "SCS");
                var mtgReportData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportGet, getParams);

                var mtgSummReportCsObject = JsonConvert.SerializeObject(mtgReportData.Tables[0]);

                MeetingSummaryReport uploadObj = JsonConvert.DeserializeObject<List<MeetingSummaryReport>>(mtgSummReportCsObject)[0];
                // log action
                uploadObj.mtg_id = mtgId;                
                // LogMeetingAction(uploadObj);

                //return Ok(new { Message = "Photos uploaded ok", Photos = photos });
                return this.Request.CreateResponse(HttpStatusCode.OK, new { summ_cs_reports = mtgSummReportCsObject });
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
            var summRepObjParams = new Dictionary<string, object>();
            var fileName = "";

            if (type.ToLower() == "s")
                fileName = mtgNumber + "_Summary_Report.pdf";
            else if (type.ToLower() == "scs")
                fileName = mtgNumber + "_Summary_Report_Cs.pdf";


            if (!this._mtgReportManager.FileExists(mtgNumber, fileName))
            {
                return this.Request.CreateResponse(HttpStatusCode.NotFound, "Not found");
            }

            var result = await this._mtgReportManager.DeleteByMtgNumber(mtgNumber, fileName);

            if (result.Successful)
            {
                // get file record
                summRepObjParams.Add("@mtg_id", mtgId);
                summRepObjParams.Add("@report_type", type);
                _mtgReportRepo.DeleteEntity(StoredProcs.MtgReportDelete, summRepObjParams);

                //return Ok(new { message = result.Message });
                return this.Request.CreateResponse(HttpStatusCode.OK, new { message = result.Message });
            }
            else
            {
                //return BadRequest(result.Message);
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, result.Message);
            }
        }

        // Update meeting report responsible officer
        [ActionName("UpdateOfficer")]
        public void PostUpdateOfficer(int mtgId, string ofcrName, string currUser)
        {
            var mtgRepParams = new Dictionary<string, object>();

            mtgRepParams.Add("@mtg_id", mtgId);
            mtgRepParams.Add("@resp_officer", ofcrName);
            mtgRepParams.Add("@user_name", currUser);

            _mtgReportRepo.UpdateEntity(StoredProcs.MtgReportRespOfcrUpdate, mtgRepParams);

        }

        // PUT api/meetingreport/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/meetingreport/5
        public void Delete(int id)
        {
        }

        private void LogMeetingAction(MeetingSummaryReport uploadObj)
        {
            IDictionary<string, object> parameters;
            //var teststr = Convert.ToString(value["newParticipants"]);
            MeetingActionHistoryInsert mtgACtion = new MeetingActionHistoryInsert
            {
                mtg_id = uploadObj.mtg_id,
                action = "Summary report file uploaded.",
                action_by = uploadObj.summary_report_uploaded_by,
                remarks = "Uploaded summary report file : " + uploadObj.summary_report_filename
            };

            //iterate thru list
            if (mtgACtion != null)
            {
                parameters = mtgACtion.AsDictionary();
                // update row data                       
                _meetingActionRepository.UpdateEntity(StoredProcs.MtgActionInsert, (Dictionary<string, object>)parameters);
            }

        }
    }
}
