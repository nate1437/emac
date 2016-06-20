using eMAC.Domain.Entities;
using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Configuration;
using System.Web.Hosting;
using System.Web.Http;

namespace eMAC.UI.api
{
    public class NotificationController : ApiController
    {
        private IMeetingRepository _mtgRepo;
        private IUserRepository _userRepo;
        private IMeetingReportRepository _mtgReportRepo;
        private string sendTo, sendCc, sendBCc;

        public string DebugMode;
        public string DebugEmail;
        public string DebugEmailCc;
        public string Email;
        public string EmailCc;
        public string EmailBcc;

        public string SMTPServer;
        public string AdminEmail;
        public string AdminEmailName;

        public string EmailBCC;
        public string NotificationXML;

        public string WebsiteURL;
        public string ApplicationName;
        public string EmailLink;
        public string TemplateLink;

        public bool AllowNotify;

        public NotificationController(
            IMeetingRepository mtgRepo, 
            IUserRepository userRepo,
            IMeetingReportRepository mtgReportRepo)
        {
            _mtgRepo = mtgRepo;
            _userRepo = userRepo;
            _mtgReportRepo = mtgReportRepo;

            DebugMode = System.Web.Configuration.WebConfigurationManager.AppSettings["Debug"];
            //DebugEmail = System.Web.Configuration.WebConfigurationManager.AppSettings["DebugEmail"];

            DebugEmail = System.Web.Configuration.WebConfigurationManager.AppSettings["DebugEmail"];
            DebugEmailCc = System.Web.Configuration.WebConfigurationManager.AppSettings["DebugEmailCc"];

            Email = System.Web.Configuration.WebConfigurationManager.AppSettings["Email"];
            EmailCc = WebConfigurationManager.AppSettings["EmailCcEnable"].ToString().Equals("ON") ? WebConfigurationManager.AppSettings["EmailCC"] : "";
            EmailBcc = System.Web.Configuration.WebConfigurationManager.AppSettings["EmailBCC"];

            SMTPServer = System.Web.Configuration.WebConfigurationManager.AppSettings["SmtpServer"];
            AdminEmail = System.Web.Configuration.WebConfigurationManager.AppSettings["SysAdminEmail"];
            AdminEmailName = System.Web.Configuration.WebConfigurationManager.AppSettings["SysAdminName"];

            EmailBCC = System.Web.Configuration.WebConfigurationManager.AppSettings["EmailBCC"];

            NotificationXML = HostingEnvironment.MapPath("~/xml/") + System.Web.Configuration.WebConfigurationManager.AppSettings["EmailTemplateXML"].ToString();

            WebsiteURL = System.Web.Configuration.WebConfigurationManager.AppSettings["SiteURL"];
            ApplicationName = System.Web.Configuration.WebConfigurationManager.AppSettings["SiteTitle"];
            EmailLink = System.Web.Configuration.WebConfigurationManager.AppSettings["EmailPopupLink"];
            TemplateLink = System.Web.Configuration.WebConfigurationManager.AppSettings["TemplateLink"];

            AllowNotify = Convert.ToBoolean(System.Web.Configuration.WebConfigurationManager.AppSettings["EmailNotification"]);
        }

        // GET api/notification
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/notification/5
        [ActionName("NotifyCreateMtg")]
        public string Get(int id)
        {
            if (id != 0)
            {
                if (AllowNotify)
                {
                    Email_Repository email_repo = new Email_Repository(NotificationXML, WebsiteURL, ApplicationName);

                        email_repo.CreationMeeting(id.ToString(), "", "", "", "", TemplateLink, EmailLink);
                        EmailSender sender = new EmailSender(SMTPServer, AdminEmail, AdminEmailName);
                        StringBuilder emailHeader = new StringBuilder();
                    
                        sendTo = EmailCc;
                        sendCc = "";
                        sendBCc = EmailBcc;

                        if (DebugMode == "ON")
                        {
                            emailHeader.Append("--------------------------------------------------<br>");
                            emailHeader.Append("To: ").Append(sendTo.ToString()).Append("<br>");
                            emailHeader.Append("Cc: ").Append(sendCc.ToString()).Append("<br>");
                            emailHeader.Append("--------------------------------------------------<br><br>");

                            sendTo = EmailCc;
                            //sendCc = ;
                            EmailBCC = EmailBcc;
                        }
                        sender.SendEmail(sendTo, sendCc, EmailBCC, email_repo.EmailSubject, emailHeader.ToString() + email_repo.EmailMessage);
                };
            }


            return "value";
        }

        // PUT api/meeting/5
        [ActionName("Notify")]
        public void Post(int id, [FromBody]dynamic value)
        {             
            if (id != 0)
            {
                var parameters = new Dictionary<string, object>();
                var userParameters = new Dictionary<string, object>();
                var mtgReportParameters = new Dictionary<string, object>();

                parameters.Add("@mtg_id", id);
                var mtgHeader = _mtgRepo.GetEntity(StoredProcs.MtgGetHeader, parameters);

                var meetingObject = JsonConvert.SerializeObject(mtgHeader.Tables[0]);
                var meetingObjectData = JsonConvert.DeserializeObject<List<MeetingGet>>(meetingObject.ToString()).FirstOrDefault();

                userParameters.Add("@user_name", meetingObjectData.resp_officer);
                var userResult = _userRepo.GetEntity(StoredProcs.LibUserGet, userParameters);
                var userObject = JsonConvert.SerializeObject(userResult.Tables[0]);
                var userObjectData = JsonConvert.DeserializeObject<List<User>>(userObject.ToString()).FirstOrDefault();

                // get co-responsible user data
                // get meeting creator data

                if (AllowNotify)
                {
                    Email_Repository email_repo = new Email_Repository(NotificationXML, WebsiteURL, ApplicationName);
                    if (value["mtgActionObj"] != null)
                    {
                        NotifyObject notifyObject = JsonConvert.DeserializeObject<NotifyObject>(Convert.ToString(value["mtgActionObj"]));
                                                
                        // submitting
                        if (notifyObject.status.ToLower() == "submitted for spmc" || notifyObject.status.ToLower() == "submitted for finalization")
                        {
                            // sendTo eMAC
                            sendTo = Email;
                            sendCc = EmailCc;
                            EmailBCC = EmailBcc;

                            email_repo.SubmitMeeting(id.ToString(), meetingObjectData, notifyObject.action_by,TemplateLink, EmailLink);
                        }
                        // approving
                        else if (notifyObject.status.ToLower() == "approved for spmc")
                        {
                            sendTo = userObjectData.email;
                            sendCc = meetingObjectData.created_by + "@wpro.who.int;" + EmailCc;
                            EmailBCC = EmailBcc;

                            // send aproval
                            email_repo.ApproveMeeting(id.ToString(), meetingObjectData.mtg_no, meetingObjectData.resp_officer, TemplateLink, EmailLink);
                        }      
                        // finalizing
                        else if (notifyObject.status.ToLower() == "finalized")
                        {
                            sendTo = userObjectData.email;
                            sendCc = meetingObjectData.created_by + "@wpro.who.int;" + EmailCc;
                            EmailBCC = EmailBcc;
                            //sendTo = userObjectData.email;
                            //sendCc = meetingObjectData.created_by + "@wpro.who.int";
                            //EmailBCC = "";

                            // send aproval
                            email_repo.FinalizeMeeting(id.ToString(), meetingObjectData.mtg_no, meetingObjectData.resp_officer, TemplateLink, EmailLink);
                        }
                        // rejecting
                        else if (notifyObject.status.ToLower() == "revise for spmc" || notifyObject.status.ToLower() == "revise for finalization")
                        {
                            sendTo = userObjectData.email;
                            sendCc = meetingObjectData.created_by + "@wpro.who.int;" + EmailCc;
                            EmailBCC = EmailBcc;
                            //sendTo = userObjectData.email;
                            //sendCc = meetingObjectData.created_by + "@wpro.who.int";
                            //EmailBCC = "";

                            // send aproval
                            email_repo.RejectMeeting(id.ToString(), meetingObjectData.mtg_no, meetingObjectData.resp_officer, notifyObject.remarks, TemplateLink, EmailLink);
                        }                        
                    }

                    if (value["mtgReportData"] != null)
                    {
                        mtgReportParameters.Add("@mtg_id", id);
                        var mtgReportObjData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportObjectGet, mtgReportParameters);
                        var mtgReportObject = JsonConvert.SerializeObject(mtgReportObjData.Tables[0]);
                        var mtgReportObjectData = JsonConvert.DeserializeObject<List<MeetingSummaryReport>>(mtgReportObject.ToString()).FirstOrDefault();

                        //var teststr = Convert.ToString(value["newParticipants"]);
                        NotifyObject notifyObject = JsonConvert.DeserializeObject<NotifyObject>(Convert.ToString(value["mtgReportData"]));

                        //set up mail recipients
                        sendTo = Email;
                        sendCc = EmailCc;
                        EmailBCC = EmailCc;

                        // send aproval
                        email_repo.MeetingReportSubmit(id.ToString(), meetingObjectData.mtg_no, mtgReportObjectData.summary_report_uploaded_by, notifyObject.remarks, TemplateLink, EmailLink);

                    }
                    if (value["finMtgReportData"] != null)
                    {
                        mtgReportParameters.Add("@mtg_id", id);
                        var mtgReportObjData = _mtgReportRepo.GetEntity(StoredProcs.MtgReportObjectGet, mtgReportParameters);
                        var mtgReportObject = JsonConvert.SerializeObject(mtgReportObjData.Tables[0]);
                        var mtgReportObjectData = JsonConvert.DeserializeObject<List<MeetingFinalReport>>(mtgReportObject.ToString()).FirstOrDefault();

                        //var teststr = Convert.ToString(value["newParticipants"]);
                        NotifyObject notifyObject = JsonConvert.DeserializeObject<NotifyObject>(Convert.ToString(value["finMtgReportData"]));

                        //set up mail recipients
                        sendTo = Email;
                        sendCc = EmailCc;
                        EmailBCC = EmailBcc;

                        // send aproval
                        email_repo.FinalMeetingReportSubmit(id.ToString(), meetingObjectData.mtg_no, mtgReportObjectData.final_report_uploaded_by, notifyObject.remarks, TemplateLink, EmailLink);

                    }

                    EmailSender sender = new EmailSender(SMTPServer, AdminEmail, AdminEmailName);
                    StringBuilder emailHeader = new StringBuilder();

                    // replace email receivers if debug mode
                    if (DebugMode == "ON")
                    {
                        emailHeader.Append("--------------------------------------------------<br>");
                        emailHeader.Append("To: ").Append(sendTo.ToString()).Append("<br>");
                        emailHeader.Append("Cc: ").Append(sendCc.ToString()).Append("<br>");
                        emailHeader.Append("Bcc: ").Append(EmailBCC.ToString()).Append("<br>");
                        emailHeader.Append("--------------------------------------------------<br><br>");

                        sendTo = DebugEmail;
                        sendCc = DebugEmailCc;
                        EmailBCC = "";
                    }

                    sender.SendEmail(sendTo, sendCc, EmailBCC, email_repo.EmailSubject, emailHeader.ToString() + email_repo.EmailMessage);              
                };
            }
        }

        // POST api/notification
        public void Post([FromBody]string value)
        {
        }

        // PUT api/notification/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/notification/5
        public void Delete(int id)
        {
        }
    }
}
