using eMAC.Domain.Entities;
using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;

namespace eMAC.UI.api
{
    public class MeetingController : ApiController
    {
        private IMeetingRepository _mtgRepository;
        private IMeetingDetailRepository _mtgDetailRepository;
        private IParticipantsRepository _participantRepository;
        private ILinkagesRepository _linkagesRepository;
        private IRelatedMeetingRepository _relatedMtgRepository;
        private IMeetingBudgetRepository _meetingBudgetRepository;
        private IMeetingActionHistoryRepository _meetingActionRepository;

        public MeetingController(
            IMeetingRepository mtgRepository, 
            IMeetingDetailRepository mtgDetailRepository,
            IParticipantsRepository participantRepository,
            ILinkagesRepository linkagesRepository,
            IRelatedMeetingRepository relatedMtgRepository,
            IMeetingBudgetRepository meetingBudgetRepository,
            IMeetingActionHistoryRepository meetingActionRepository
            )
        {
            _mtgRepository = mtgRepository;
            _mtgDetailRepository = mtgDetailRepository;
            _participantRepository = participantRepository;
            _linkagesRepository = linkagesRepository;
            _relatedMtgRepository = relatedMtgRepository;
            _meetingBudgetRepository = meetingBudgetRepository;
            _meetingActionRepository = meetingActionRepository;
        }

        // GET api/meeting
   
        [ActionName("List")]
        public dynamic GetMeeting(string year = "", string divisionCode = "", string unitCode = "")
        {             
            //(StoredProcedure.SituationUpdList, parameters);
            var parameters = new Dictionary<string, object>();

            parameters.Add("@mtg_year", string.IsNullOrEmpty(year) ? 0 : Convert.ToInt16(year));
            if (string.IsNullOrEmpty(divisionCode))
            {
                parameters.Add("@div_code", null);
            }
            else
            {
                parameters.Add("@div_code", divisionCode);
            }

            if (string.IsNullOrEmpty(unitCode))
            {
                parameters.Add("@org_unit", null);
            }
            else
            {
                parameters.Add("@org_unit", unitCode);
            }

            var mtgList = _mtgRepository.GetEntity(StoredProcs.MtgList, parameters);

            return mtgList.Tables[0].ToDictionary();
            //var table = JsonConvert.SerializeObject(mtgList.Tables[0]);

            //return table;
        }

        [HttpPost]
        public dynamic Delete(JObject jsonparam)
        {
            if (jsonparam != null)
            {
                var param = jsonparam.ToObject<Dictionary<string, object>>();
                _mtgRepository.GetEntity(StoredProcs.MtgDelete, new Dictionary<string, object>() { { "@mtg_id", param["mtg_id"] } });

                return new { op = true };
            }
            return new { op = false, result = "Unhandled request." };
        }

        [HttpGet]
        public object MeetingDetails(int mtg_id)
        {
            DataSet result = _mtgRepository.GetEntity(StoredProcs.MtgGet, new Dictionary<string, object>() { { "@mtg_id", mtg_id } });
            if (result.Tables.Count > 0)
            {
                Dictionary<string, IEnumerable<Dictionary<string, object>>> data = new Dictionary<string, IEnumerable<Dictionary<string, object>>>();

                data.Add("meeting", result.Tables[0].ToDictionary());
                data.Add("meetingDetail", result.Tables[1].ToDictionary());
                data.Add("countryParticipant", result.Tables[2].ToDictionary());
                data.Add("meetingCoreFx", result.Tables[3].ToDictionary());
                data.Add("linkagesResolution", result.Tables[4].ToDictionary());
                data.Add("relatedMeeting", result.Tables[5].ToDictionary());
                data.Add("meetingBudget", result.Tables[6].ToDictionary());
                data.Add("meetingPbCategory", result.Tables[7].ToDictionary());
                data.Add("meetingPbOutcome", result.Tables[8].ToDictionary());
                data.Add("meetingPbOutput", result.Tables[9].ToDictionary());
                data.Add("meetingReport", result.Tables[10].ToDictionary());
                return new { op = true, value = data };
            }
            return new { op = false, message = "Unable to retrieve data." };
        }

        // GET api/meeting/5
        [ActionName("Detail")]
        public string Get(int id)
        {
            //(StoredProcedure.SituationUpdList, parameters);
            var parameters = new Dictionary<string, object>();           

            parameters.Add("@mtg_id", id);
            var mtgList = _mtgRepository.GetEntity(StoredProcs.MtgGet, parameters);

            var meetingObject = JsonConvert.SerializeObject(mtgList.Tables[0]);
            var meetingDetailObject = JsonConvert.SerializeObject(mtgList.Tables[1]);

            //List<MeetingDetail> mtgDetailsObj = JsonConvert.DeserializeObject<List<MeetingDetail>>(meetingDetailObject);
            //mtgDetailsObj[0].present = mtgDetailsObj[0].present.Replace("<br>", "\n");

            //meetingDetailObject = JsonConvert.SerializeObject(mtgDetailsObj[0]);

            var participantCountryObject = JsonConvert.SerializeObject(mtgList.Tables[2]);
            //var coreFunctionObject = JsonConvert.SerializeObject(mtgList.Tables[3]);
            var mtgCoreFxObject = JsonConvert.SerializeObject(mtgList.Tables[3]);
            var linkagesResolutionObject = JsonConvert.SerializeObject(mtgList.Tables[4]);
            var relatedMtgsObject = JsonConvert.SerializeObject(mtgList.Tables[5]);
            var meetingBudgetObject = JsonConvert.SerializeObject(mtgList.Tables[6]);
            var mtgPbCategoryObject = JsonConvert.SerializeObject(mtgList.Tables[7]);
            var mtgPbOutcomeObject = JsonConvert.SerializeObject(mtgList.Tables[8]);
            var mtgPbOutputObject = JsonConvert.SerializeObject(mtgList.Tables[9]);
            var mtgReportObject = JsonConvert.SerializeObject(mtgList.Tables[10]);
            

            var data = new Dictionary<string, string>();
            data.Add("meeting", meetingObject);
            data.Add("meetingDetail", meetingDetailObject);
            data.Add("countryParticipant", participantCountryObject);
            //data.Add("coreFunction", coreFunctionObject);
            data.Add("mtgCoreFx", mtgCoreFxObject);
            data.Add("linkagesResolution", linkagesResolutionObject);
            data.Add("relatedMeeting", relatedMtgsObject);
            data.Add("meetingBudget", meetingBudgetObject);
            data.Add("mtgPbCategory", mtgPbCategoryObject);
            data.Add("mtgPbOutcome", mtgPbOutcomeObject);
            data.Add("mtgPbOutput", mtgPbOutputObject);
            data.Add("mtgReport", mtgReportObject);
            

            return JsonConvert.SerializeObject(data);
        }

        // POST api/meeting
        [ActionName("Save")]
        public HttpResponseMessage Post([FromBody]dynamic value)
        {
            try
            {
                var parameters = new Dictionary<string, object>();

                parameters.Add("@mtg_title", Convert.ToString(value["mtg_title"]));
                parameters.Add("@start_date", Convert.ToDateTime(Convert.ToString(value["start_date"])));
                parameters.Add("@end_date", Convert.ToDateTime(Convert.ToString(value["end_date"])));
                parameters.Add("@office_code", Convert.ToString(value["office_code"])); //division
                parameters.Add("@org_unit", Convert.ToString(value["unit"]));
                parameters.Add("@resp_officer", Convert.ToString(value["resp_officer"]));
                parameters.Add("@co_resp_officer", Convert.ToString(value["co_resp_officer"]));
                parameters.Add("@venue", Convert.ToString(value["city"]));
                parameters.Add("@ctry_code", Convert.ToString(value["ctry"]));
                parameters.Add("@status", Convert.ToString(value["status"]));
                parameters.Add("@user_name", Convert.ToString(value["curr_user"]));

                //parameters.Add("@mtg_no", Convert.ToString(value["mtg_no"]));
                //parameters.Add("@mtg_title", Convert.ToString(value["mtg_title"]));
                //parameters.Add("@start_date", Convert.ToDateTime(Convert.ToString(value["start_date"])));
                //parameters.Add("@end_date", Convert.ToDateTime(Convert.ToString(value["end_date"])));
                //parameters.Add("@resp_officer", Convert.ToString(value["resp_officer"]));
                //parameters.Add("@co_resp_officer", Convert.ToString(value["co_resp_officer"]));
                //parameters.Add("@venue", Convert.ToString(value["city"]));
                //parameters.Add("@ctry_code", Convert.ToString(value["ctry"]));
                //parameters.Add("@div_code", Convert.ToString(value["unit"])); //division
                //parameters.Add("@unit_code", Convert.ToString(value["unit"]));
                //parameters.Add("@status", Convert.ToString(value["status"]));
                //parameters.Add("@created_by", Convert.ToString(value["curr_user"]));

                //_mtgRepository.SaveEntity(StoredProcs.MtgSave, parameters);
                var result = _mtgRepository.InsertEntity(StoredProcs.MtgSave, parameters);

                //return Ok(new { Message = "Photos uploaded ok", Photos = photos });
                return this.Request.CreateResponse(HttpStatusCode.OK, new { mtg_id = result });
            }
            catch (Exception ex)
            {
                return this.Request.CreateResponse(HttpStatusCode.OK, ex.GetBaseException().Message);
            }
    
        }

        // PUT api/meeting/5
        [ActionName("Update")]
        public void Post(int id, [FromBody]dynamic value)
        {
            string curr_user = "";
            if (value["curr_user"] != null)
                curr_user = Convert.ToString(value["curr_user"]);

            // meeting object
            #region MEETING            
            if (value["mtgObj"] != null)
            {
                IDictionary<string, object> parameters;

                Meeting mtgObj = JsonConvert.DeserializeObject<Meeting>(Convert.ToString(value["mtgObj"]), new JsonSerializerSettings() { DateFormatString = "dd/MM/yyyy" });
               // mtgObj.date_updated = DateTime.Today;

                parameters = mtgObj.AsDictionary();

                _mtgRepository.UpdateEntity(StoredProcs.MtgUpdate, (Dictionary<string, object>)parameters);
            }
            #endregion
            // meeting detail object
            #region MEETING_DETAIL
            if (value["mtgDetailObj"] != null)
            {
                IDictionary<string, object> parameters;

                // call sp to update meeting details
                MeetingDetail mtgDetailsObj = JsonConvert.DeserializeObject<MeetingDetail>(Convert.ToString(value["mtgDetailObj"]));
                //var newStr = mtgDetailsObj.present.Replace("\n", "<br>");
                //mtgDetailsObj.present = newStr;
                Dictionary<string, string> x = JsonConvert.DeserializeObject<Dictionary<string, string>>(Convert.ToString(value["mtgDetailObj"]));
                parameters = mtgDetailsObj.AsDictionary();
                if (!string.IsNullOrEmpty(x["end_notes_final"]))
                {
                    parameters["@end_notes"] = x["end_notes_final"];
                }
                _mtgDetailRepository.UpdateEntity(StoredProcs.MtgDetailUpdate, (Dictionary<string, object>)parameters);
            }
            #endregion
            // new participants object
            #region PARTICIPANT_COUNTRY
            if (value["newParticipants"] != null)
            {
                IDictionary<string, object> parameters;
                //var teststr = Convert.ToString(value["newParticipants"]);
                List<ParticipantObject> newParticipantsList = JsonConvert.DeserializeObject<List<ParticipantObject>>(Convert.ToString(value["newParticipants"]));

                //iterate thru list
                if (newParticipantsList.Count > 0)
                {
                    for (int i = 0; i < newParticipantsList.Count; i++)
                    {
                        newParticipantsList[i].mtg_id = id;
                        parameters = newParticipantsList[i].AsDictionary();
                        // insert row data
                        _participantRepository.UpdateEntity(StoredProcs.ParticipantSave, (Dictionary<string, object>)parameters);
                    }
                }
            }
            // update participants object
            if (value["modParticipants"] != null)
            {
                IDictionary<string, object> parameters;
                //var teststr = Convert.ToString(value["newParticipants"]);
                List<ParticipantObject> modParticipantsList = JsonConvert.DeserializeObject<List<ParticipantObject>>(Convert.ToString(value["modParticipants"]));

                //iterate thru list
                if (modParticipantsList.Count > 0)
                {
                    for (int i = 0; i < modParticipantsList.Count; i++)
                    {
                        modParticipantsList[i].mtg_id = id;
                        modParticipantsList[i].user_name = curr_user;
                        parameters = modParticipantsList[i].AsDictionary();
                        // insert row data
                        _participantRepository.UpdateEntity(StoredProcs.ParticipantUpdate, (Dictionary<string, object>)parameters);
                                                
                    }
                }
            }
            // delete participant object
            if (value["delParticipants"] != null)
            {
                var parameters = new Dictionary<string, object>();
                StringBuilder sb = new StringBuilder();
                
                //var teststr = Convert.ToString(value["newParticipants"]);
                List<ParticipantObject> modParticipantsList = JsonConvert.DeserializeObject<List<ParticipantObject>>(Convert.ToString(value["delParticipants"]));
                

                //iterate thru list
                if (modParticipantsList.Count > 0)
                {
                    List<string> intResult = modParticipantsList.Select(o => o.mtg_participant_ctry_id.ToString()).Distinct().ToList();

                    //for (int i = 0; i < modParticipantsList.Count; i++)
                    //{
                    //    idList.Add(modParticipantsList[i].mtg_id.ToString());
                    //    //modParticipantsList[i].mtg_id = id;
                    //    //parameters = modParticipantsList[i].AsDictionary();
                    //    //// insert row data
                    //    //_participantRepository.UpdateEntity(StoredProcs.ParticipantUpdate, (Dictionary<string, object>)parameters);
                    //}

                    string result = string.Join(",", intResult.ToArray());
                    parameters.Add("@mtg_participant_ctry_ids", result);


                    _participantRepository.DeleteEntity(StoredProcs.ParticipantDelete, parameters);
                }
            }
            #endregion
            // linkages to resolutions
            #region MEETING_RESOLUTION_LINKAGE
            if (value["newLinkages"] != null)
            {
                IDictionary<string, object> parameters;
                //var teststr = Convert.ToString(value["newParticipants"]);
                List<LinkagesToResolution> newLinkagesList = JsonConvert.DeserializeObject<List<LinkagesToResolution>>(Convert.ToString(value["newLinkages"]));

                //iterate thru list
                if (newLinkagesList.Count > 0)
                {
                    for (int i = 0; i < newLinkagesList.Count; i++)
                    {
                        newLinkagesList[i].mtg_id = id;
                        parameters = newLinkagesList[i].AsDictionary();
                        // insert row data

                        _linkagesRepository.UpdateEntity(StoredProcs.LinkagesSave, (Dictionary<string, object>)parameters);
                    }
                }
            }
            // update linkages object
            if (value["modLinkages"] != null)
            {
                IDictionary<string, object> parameters;
                //var teststr = Convert.ToString(value["newParticipants"]);
                List<LinkagesToResolution> modLinkagesList = JsonConvert.DeserializeObject<List<LinkagesToResolution>>(Convert.ToString(value["modLinkages"]));

                //iterate thru list
                if (modLinkagesList.Count > 0)
                {
                    for (int i = 0; i < modLinkagesList.Count; i++)
                    {
                        modLinkagesList[i].mtg_id = id;
                        parameters = modLinkagesList[i].AsDictionary();
                        // update row data
                        _linkagesRepository.UpdateEntity(StoredProcs.LinkagesUpdate, (Dictionary<string, object>)parameters);

                    }
                }
            }
            // delete linkages object
            if (value["delLinkages"] != null)
            {
                var parameters = new Dictionary<string, object>();
                StringBuilder sb = new StringBuilder();

                //var teststr = Convert.ToString(value["newParticipants"]);
                List<ModLinkagesToResolution> delLinkagesList = JsonConvert.DeserializeObject<List<ModLinkagesToResolution>>(Convert.ToString(value["delLinkages"]));


                //iterate thru list
                if (delLinkagesList.Count > 0)
                {
                    List<string> intResult = delLinkagesList.Select(o => o.mtg_resolution_linkage_id.ToString()).Distinct().ToList();

                    //for (int i = 0; i < modParticipantsList.Count; i++)
                    //{
                    //    idList.Add(modParticipantsList[i].mtg_id.ToString());
                    //    //modParticipantsList[i].mtg_id = id;
                    //    //parameters = modParticipantsList[i].AsDictionary();
                    //    //// insert row data
                    //    //_participantRepository.UpdateEntity(StoredProcs.ParticipantUpdate, (Dictionary<string, object>)parameters);
                    //}

                    string result = string.Join(",", intResult.ToArray());
                    parameters.Add("@mtg_resolution_linkage_ids", result);


                    _linkagesRepository.DeleteEntity(StoredProcs.LinkagesDelete, parameters);
                }
            }
            #endregion
            // realted meetings
            #region RELATED MEETINGS
            if (value["newRelatedMtgs"] != null)
            {
                IDictionary<string, object> parameters;

                List<RelatedMeeting> newRelatedMtgsList = JsonConvert.DeserializeObject<List<RelatedMeeting>>(Convert.ToString(value["newRelatedMtgs"]),
                                                                                        new JsonSerializerSettings
                                                                                        {
                                                                                            NullValueHandling = NullValueHandling.Ignore
                                                                                        });
             
                //iterate thru list
                if (newRelatedMtgsList.Count > 0)
                {
                    for (int i = 0; i < newRelatedMtgsList.Count; i++)
                    {
                        newRelatedMtgsList[i].mtg_id = id;
                        parameters = newRelatedMtgsList[i].AsDictionary();
                        // insert row data

                        _relatedMtgRepository.UpdateEntity(StoredProcs.RelatedMtgSave, (Dictionary<string, object>)parameters);
                      
                    }
                }
            }
            // update related mtg object
            if (value["modRelatedMtgs"] != null)
            {
                IDictionary<string, object> parameters;
                //var teststr = Convert.ToString(value["newParticipants"]);
                List<RelatedMeeting> modRelatedMtgsList = JsonConvert.DeserializeObject<List<RelatedMeeting>>(Convert.ToString(value["modRelatedMtgs"]));

                //iterate thru list
                if (modRelatedMtgsList.Count > 0)
                {
                    for (int i = 0; i < modRelatedMtgsList.Count; i++)
                    {
                        modRelatedMtgsList[i].mtg_id = id;
                        parameters = modRelatedMtgsList[i].AsDictionary();
                        // update row data                       
                        _relatedMtgRepository.UpdateEntity(StoredProcs.RelatedMtgUpdate, (Dictionary<string, object>)parameters);
                    }
                }
            }
            // delete related mtg object
            if (value["delRelatedMtgs"] != null)
            {
                var parameters = new Dictionary<string, object>();
                StringBuilder sb = new StringBuilder();

                //var teststr = Convert.ToString(value["newParticipants"]);
                List<RelatedMeeting> delRelatedMtgsList = JsonConvert.DeserializeObject<List<RelatedMeeting>>(Convert.ToString(value["delRelatedMtgs"]));
                
                //iterate thru list
                if (delRelatedMtgsList.Count > 0)
                {
                    List<string> intResult = delRelatedMtgsList.Select(o => o.mtg_related_meeting_id.ToString()).Distinct().ToList();
                    

                    string result = string.Join(",", intResult.ToArray());
                    parameters.Add("@mtg_related_meeting_ids", result);

                    _relatedMtgRepository.DeleteEntity(StoredProcs.RelatedMtgDelete, (Dictionary<string, object>)parameters);                   
                }
            }
            #endregion
            // funding
            #region FUNDING

            if (value["newMtgFunds"] != null)
            {
                IDictionary<string, object> parameters;
                //var teststr = Convert.ToString(value["newParticipants"]);
                List<MeetingBudget> newFundingList = JsonConvert.DeserializeObject<List<MeetingBudget>>(Convert.ToString(value["newMtgFunds"]));

                //iterate thru list
                if (newFundingList.Count > 0)
                {
                    for (int i = 0; i < newFundingList.Count; i++)
                    {
                        newFundingList[i].mtg_id = id;
                        parameters = newFundingList[i].AsDictionary();
                        // insert row data

                       _meetingBudgetRepository.UpdateEntity(StoredProcs.MtgBudgetSave, (Dictionary<string, object>)parameters);

                    }
                }
            }
            // update mtg budget object
            if (value["modMtgFunds"] != null)
            {
                IDictionary<string, object> parameters;
                //var teststr = Convert.ToString(value["newParticipants"]);
                List<MeetingBudget> modFundingList = JsonConvert.DeserializeObject<List<MeetingBudget>>(Convert.ToString(value["modMtgFunds"]));

                //iterate thru list
                if (modFundingList.Count > 0)
                {
                    for (int i = 0; i < modFundingList.Count; i++)
                    {
                        modFundingList[i].mtg_id = id;
                        parameters = modFundingList[i].AsDictionary();
                        // update row data                       
                        _meetingBudgetRepository.UpdateEntity(StoredProcs.MtgBudgetUpdate, (Dictionary<string, object>)parameters);
                    }
                }
            }
            // delete mtg budget object
            if (value["delMtgFunds"] != null)
            {
                var parameters = new Dictionary<string, object>();

                //var teststr = Convert.ToString(value["newParticipants"]);
                List<MeetingBudget> delFundingList = JsonConvert.DeserializeObject<List<MeetingBudget>>(Convert.ToString(value["delMtgFunds"]));

                //iterate thru list
                if (delFundingList.Count > 0)
                {
                    List<string> intResult = delFundingList.Select(o => o.mtg_budget_id.ToString()).Distinct().ToList();


                    string result = string.Join(",", intResult.ToArray());
                    parameters.Add("@mtg_budget_ids", result);

                    _meetingBudgetRepository.DeleteEntity(StoredProcs.MtgBudgetDelete, (Dictionary<string, object>)parameters);
                }
            }
            #endregion
            // core functions
            #region COREFX
            if (value["delCoreFunctions"] != null)
            {
                List<string> intResult = new List<string>();
                var deleteObjects = JsonConvert.DeserializeObject<Dictionary<string, Object>>(Convert.ToString(value["delCoreFunctions"]));
                
                var parameters = new Dictionary<string, object>();

                foreach (KeyValuePair<string, Object> entry in deleteObjects)
                {                   
                   // parameters.Add("@core_function_id", Convert.ToInt32(entry.Key));
                    intResult.Add(entry.Key);
                }

                parameters.Add("@mtg_id", id);

                string result = string.Join(",", intResult.ToArray());
                parameters.Add("@combo", result);              

                _participantRepository.UpdateEntity(StoredProcs.CoreFunctionDelete, parameters);
        
            }
            if (value["insCoreFunctions"] != null)
            {
                var insertObjects = JsonConvert.DeserializeObject<Dictionary<string, Object>>(Convert.ToString(value["insCoreFunctions"]));

                foreach (KeyValuePair<string, Object> entry in insertObjects)
                {
                    var parameters = new Dictionary<string, object>();

                    parameters.Add("@mtg_id", id);
                    parameters.Add("@created_by", curr_user);
                    parameters.Add("@is_selected", entry.Value);
                    parameters.Add("@core_function_id", Convert.ToInt32(entry.Key));

                    _participantRepository.UpdateEntity(StoredProcs.CoreFunctionSave, parameters);
                }
            }
            if (value["updCoreFunctions"] != null)
            {
                var updateObjects = JsonConvert.DeserializeObject<Dictionary<string, Object>>(Convert.ToString(value["updCoreFunctions"]));

                foreach (KeyValuePair<string, Object> entry in updateObjects)
                {
                    var parameters = new Dictionary<string, object>();

                    parameters.Add("@mtg_id", id);
                    parameters.Add("@user_name", curr_user);
                    parameters.Add("@is_selected", entry.Value);
                    parameters.Add("@mtg_core_function_id", Convert.ToInt32(entry.Key));

                    _participantRepository.UpdateEntity(StoredProcs.CoreFunctionUpdate, parameters);
                }
            }
            #endregion
            #region PB CATEGORY
            if (value["delPbCategories"] != null)
            {
                List<string> intResult = new List<string>();
                var deleteObjects = JsonConvert.DeserializeObject<Dictionary<string, Object>>(Convert.ToString(value["delPbCategories"]));

                var parameters = new Dictionary<string, object>();

                foreach (KeyValuePair<string, Object> entry in deleteObjects)
                {
                    // parameters.Add("@core_function_id", Convert.ToInt32(entry.Key));
                    intResult.Add(entry.Key);
                }

                parameters.Add("@mtg_id", id);

                string result = string.Join(",", intResult.ToArray());
                parameters.Add("@combo", result);

                _linkagesRepository.UpdateEntity(StoredProcs.MtgPbCategoryDelete, parameters);

            }
            if (value["insPbCategories"] != null)
            {
                var insertObjects = JsonConvert.DeserializeObject<Dictionary<string, Object>>(Convert.ToString(value["insPbCategories"]));

                foreach (KeyValuePair<string, Object> entry in insertObjects)
                {
                    var parameters = new Dictionary<string, object>();

                    parameters.Add("@mtg_id", id);
                    parameters.Add("@created_by", curr_user);
                    parameters.Add("@is_selected", entry.Value);
                    parameters.Add("@pb_deliverable_cat_id", Convert.ToInt32(entry.Key));

                    _linkagesRepository.UpdateEntity(StoredProcs.MtgPbCategorySave, parameters);
                }
            }
            #endregion
            #region PB OUTCOME
            if (value["delPbOutcomes"] != null)
            {
                List<string> intResult = new List<string>();
                var deleteObjects = JsonConvert.DeserializeObject<Dictionary<string, Object>>(Convert.ToString(value["delPbOutcomes"]));

                var parameters = new Dictionary<string, object>();

                foreach (KeyValuePair<string, Object> entry in deleteObjects)
                {
                    // parameters.Add("@core_function_id", Convert.ToInt32(entry.Key));
                    intResult.Add(entry.Key);
                }

                parameters.Add("@mtg_id", id);

                string result = string.Join(",", intResult.ToArray());
                parameters.Add("@combo", result);

                _linkagesRepository.UpdateEntity(StoredProcs.MtgPbOutcomeDelete, parameters);

            }
            if (value["insPbOutcomes"] != null)
            {
                var insertObjects = JsonConvert.DeserializeObject<Dictionary<string, Object>>(Convert.ToString(value["insPbOutcomes"]));

                foreach (KeyValuePair<string, Object> entry in insertObjects)
                {
                    var parameters = new Dictionary<string, object>();

                    parameters.Add("@mtg_id", id);
                    parameters.Add("@created_by", curr_user);
                    parameters.Add("@is_selected", entry.Value);
                    parameters.Add("@pb_deliverable_outcome_id", Convert.ToInt32(entry.Key));

                    _linkagesRepository.UpdateEntity(StoredProcs.MtgPbOutcomeSave, parameters);
                }
            }
            #endregion
            #region PB OUTPUT
            if (value["delPbOutputs"] != null)
            {
                List<string> intResult = new List<string>();
                var deleteObjects = JsonConvert.DeserializeObject<Dictionary<string, Object>>(Convert.ToString(value["delPbOutputs"]));

                var parameters = new Dictionary<string, object>();

                foreach (KeyValuePair<string, Object> entry in deleteObjects)
                {
                    // parameters.Add("@core_function_id", Convert.ToInt32(entry.Key));
                    intResult.Add(entry.Key);
                }

                parameters.Add("@mtg_id", id);

                string result = string.Join(",", intResult.ToArray());
                parameters.Add("@combo", result);

                _linkagesRepository.UpdateEntity(StoredProcs.MtgPbOutputDelete, parameters);

            }
            if (value["insPbOutputs"] != null)
            {
                var insertObjects = JsonConvert.DeserializeObject<Dictionary<string, Object>>(Convert.ToString(value["insPbOutputs"]));

                foreach (KeyValuePair<string, Object> entry in insertObjects)
                {
                    var parameters = new Dictionary<string, object>();

                    parameters.Add("@mtg_id", id);
                    parameters.Add("@created_by", curr_user);
                    parameters.Add("@is_selected", entry.Value);
                    parameters.Add("@pb_deliverable_output_id", Convert.ToInt32(entry.Key));

                    _linkagesRepository.UpdateEntity(StoredProcs.MtgPbOutputSave, parameters);
                }
            }
            #endregion

            //#region ACTION HISTORY OLD
            //if (value["mtgActionObj"] != null)
            //{
            //    IDictionary<string, object> parameters;
            //    //var teststr = Convert.ToString(value["newParticipants"]);
            //    MeetingActionHistory mtgACtion = JsonConvert.DeserializeObject<MeetingActionHistory>(Convert.ToString(value["mtgActionObj"]));

            //    //iterate thru list
            //    if (mtgACtion != null)
            //    {                    
            //        parameters = mtgACtion.AsDictionary();
            //        // update row data                       
            //        _meetingActionRepository.UpdateEntity(StoredProcs.MtgActionSave, (Dictionary<string, object>)parameters);                    
            //    }

            //}

            //#endregion

            #region UPDATE STATUS WITH ACTION
            if (value["mtgUpdateStatusObj"] != null)
            {
                IDictionary<string, object> parameters;
                //var teststr = Convert.ToString(value["newParticipants"]);
                NewMeetingActionHistory mtgACtion = JsonConvert.DeserializeObject<NewMeetingActionHistory>(Convert.ToString(value["mtgUpdateStatusObj"]));

                //iterate thru list
                if (mtgACtion != null)
                {                    
                    parameters = mtgACtion.AsDictionary();
                    // update row data                       
                    _meetingActionRepository.UpdateEntity(StoredProcs.MtgUpdateStatus, (Dictionary<string, object>)parameters);                    
                }

            }
            #endregion

            #region ACTION ONLY
            if (value["mtgActionOnlyObj"] != null)
            {
                IDictionary<string, object> parameters;
                //var teststr = Convert.ToString(value["newParticipants"]);
                MeetingActionHistoryInsert mtgACtion = JsonConvert.DeserializeObject<MeetingActionHistoryInsert>(Convert.ToString(value["mtgActionOnlyObj"]));

                //iterate thru list
                if (mtgACtion != null)
                {
                    parameters = mtgACtion.AsDictionary();
                    // update row data                       
                    _meetingActionRepository.UpdateEntity(StoredProcs.MtgActionInsert, (Dictionary<string, object>)parameters);
                }

            }
            #endregion



            //Meeting tmp = JsonConvert.DeserializeObject<Meeting>(mtgObj);
            //parameters.Add("@mtg_no", id);
        }

        // DELETE api/meeting/5
        public void Delete(int id)
        {
        }

        // get next mtg no
        [ActionName("MeetingNumber")]
        public string GetMeetingNumber()
        {
            //(StoredProcedure.SituationUpdList, parameters);
            var parameters = new Dictionary<string, object>();

            var mtgList = _mtgRepository.GetEntity(StoredProcs.MtgNumberGet, new Dictionary<string, object>());

            var table = JsonConvert.SerializeObject(mtgList.Tables[0]);

            return table;
        }
    }
}
