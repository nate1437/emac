using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Configuration;
using System.Web.Http;
using WebApiAngularJsUploader.Participants;
using eMAC.Infra.Domain;
using eMAC.Infra.Common;
using eMAC.Domain.Entities;
using System.Web.Hosting;
using System.IO;
using System.Net.Http.Headers;

namespace eMAC.UI.api
{
    public class ParticipantsController : ApiController
    {
        private static string _fileDump = WebConfigurationManager.AppSettings["FileDump"];
        private IIB2Manager _participantsManager;
        private IParticipantIB2Repository _ib2Repo;
        private IMeetingActionHistoryRepository _meetingActionRepository;

        private ISpireHelper _spireHelper;

        public ParticipantsController(
            IParticipantIB2Repository ib2Repo,
            IMeetingActionHistoryRepository meetingActionRrepo,
            ISpireHelper spirehelper)
        {
            _ib2Repo = ib2Repo;
            _meetingActionRepository = meetingActionRrepo;
            this._participantsManager = new LocalIB2Manager(_fileDump, _ib2Repo);
            _spireHelper = spirehelper;
            //this._mtgReportRepo = mtgReportRepo;
        }

        [HttpGet]
        public HttpResponseMessage GetIB2Document(int mtg_id = 0)
        {
            if (mtg_id > 0)
            {
                try
                {
                    _spireHelper.DocPath = HostingEnvironment.MapPath("~/templates") + WebConfigurationManager.AppSettings["IB2Template"].ToString();
                    _spireHelper.DocType = Infra.Domain.Helpers.SpireHelperBase.DocTypes.Docx;
                    _spireHelper.TempPath = HostingEnvironment.MapPath("~/templates");
                    _spireHelper.IB2Repo = this._ib2Repo;
                    _spireHelper.GenerateIB2Document(mtg_id);
                    var file = _spireHelper.GetDocumentBytes();

                    HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
                    result.Content = new ByteArrayContent(file);

                    result.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
                    result.Content.Headers.ContentDisposition.FileName = mtg_id + "_ib2.docx";
                    return result;
                }
                catch (Exception e)
                {
                    return this.Request.CreateResponse(HttpStatusCode.BadRequest, e.GetBaseException().Message);
                }
            }

            return this.Request.CreateResponse(HttpStatusCode.BadRequest, "No meeting record found.");
        }

        // GET api/meetingreport/5
        [ActionName("GetParticipantsIB2")]
        public async Task<HttpResponseMessage> GetById(string mtgNumber, int mtgId)
        {
            bool isDirAvailable = this._participantsManager.CheckTargetMtgDirectory(mtgNumber);
            var participantsIb2ObjParams = new Dictionary<string, object>();
            var mtgParticipantsIB2Object = "[]";

            try
            {
                if (isDirAvailable)
                {
                    //var results = await this._mtgReportManager.GetById(mtgId);
                    //return (new { photos = results });

                    //reportObjParams.Add("@mtg_id", mtgId);
                    //var mtgReportObjData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportObjectGet, reportObjParams);
                    //mtgReportObject = JsonConvert.SerializeObject(mtgReportObjData.Tables[0]);


                    // get file record
                    participantsIb2ObjParams.Add("@mtg_id", mtgId);
                    var mtgParticipantData =  _ib2Repo.GetEntity(StoredProcs.MtgParticipantsIB2ObjectGet, participantsIb2ObjParams);

                    if (mtgParticipantData.Tables[0] != null)
                    {
                        mtgParticipantsIB2Object = JsonConvert.SerializeObject(mtgParticipantData.Tables[0]);
                    }

                    return this.Request.CreateResponse(HttpStatusCode.OK, new { participants_ib2 = mtgParticipantsIB2Object });
                }
                else
                    return this.Request.CreateResponse(HttpStatusCode.NotFound, new { });
            }
            catch (Exception ex)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }
        }

        
        /// POST: api/meetingreport
        [ActionName("ImportIB2File")]
        public async Task<HttpResponseMessage> PostSave(string mtgNumber, int mtgId, string fileName, string value)
        {
            Upload uploadObj = JsonConvert.DeserializeObject<Upload>(value);
            uploadObj.mtg_id = mtgId;

            var getParams = new Dictionary<string, object>();
            var newSummReportFileName = fileName + "_Import.xls";

            // Check if the request contains multipart/form-data.
            if (!Request.Content.IsMimeMultipartContent("form-data"))
            {
                //eturn BadRequest("Unsupported media type");
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "Unsupported media type");
            }

            try
            {
                // save physical file
                var files = await _participantsManager.AddToDir(mtgNumber, mtgId, newSummReportFileName, uploadObj.user_name, Request);

                LogMeetingAction(uploadObj);

                //return Ok(new { Message = "Photos uploaded ok", Photos = photos });
                return this.Request.CreateResponse(HttpStatusCode.OK, new { participants = files });
            }
            catch (Exception ex)
            {
                //return BadRequest(ex.GetBaseException().Message);
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }

        }

        private void LogMeetingAction(Upload uploadObj)
        {
            IDictionary<string, object> parameters;
            //var teststr = Convert.ToString(value["newParticipants"]);
            MeetingActionHistoryInsert mtgACtion = new MeetingActionHistoryInsert
            {
                mtg_id = uploadObj.mtg_id,
                action = "Imported participants.",
                action_by = uploadObj.user_name,
                remarks = "Imported participants file : " + uploadObj.file_name
            };

            //iterate thru list
            if (mtgACtion != null)
            {
                parameters = mtgACtion.AsDictionary();
                // update row data                       
                _meetingActionRepository.UpdateEntity(StoredProcs.MtgActionInsert, (Dictionary<string, object>)parameters);
            }
        }

        // GET api/participants
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/participants/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/participants
        public void Post([FromBody]string value)
        {
        }

        // PUT api/participants/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/participants/5
        public void Delete(int id)
        {
        }
    }
}
