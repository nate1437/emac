using eMAC.Domain.Entities;
using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
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
        public string AppEmailSuffix;
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

            AppEmailSuffix = WebConfigurationManager.AppSettings["AppEmailSuffix"];

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
        public void Post(JObject jsonparam)
        {
            Meeting meetingEntity = jsonparam["meeting"].ToObject<Meeting>(new JsonSerializer() { DateFormatString = "dd/MM/yyyy" });
            if (meetingEntity.mtg_id != 0)
            {

                if (AllowNotify)
                {
                    Email_Repository email_repo = new Email_Repository(NotificationXML, WebsiteURL, ApplicationName);
                    if (jsonparam["action"] != null)
                    {
                        NotifyObject notifyEntity = jsonparam["action"].ToObject<NotifyObject>();//JsonConvert.DeserializeObject<NotifyObject>(Convert.ToString(value["action"]));


                        if (notifyEntity.status.ToLower().Equals("submitted for spmc") ||
                            notifyEntity.status.ToLower().Equals("submitted for finalization"))
                        {
                            sendTo = Email;
                            sendCc = string.Format("{0};{1}", EmailCc, meetingEntity.mtg_assistant_email);
                            EmailBCC = EmailBcc;
                            email_repo.MeetingUserAction(meetingEntity.mtg_id, meetingEntity, notifyEntity.action_by, TemplateLink, EmailLink);
                        }

                        else if (notifyEntity.status.ToLower().Equals("approved for spmc") ||
                            notifyEntity.status.ToLower().Equals("finalized") ||
                            (notifyEntity.status.ToLower().Equals("revise for spmc") || notifyEntity.status.ToLower().Equals("revise for finalization")))
                        {
                            sendTo = meetingEntity.resp_officer_email;
                            sendCc = string.Format("{0};{1}", EmailCc, meetingEntity.mtg_assistant_email);
                            EmailBCC = EmailBcc;

                            email_repo.MeetingMacAction(meetingEntity.mtg_id, notifyEntity.status, meetingEntity, TemplateLink, EmailLink, (notifyEntity.status.ToLower().Equals("revise for spmc") || notifyEntity.status.ToLower().Equals("revise for finalization")) ? notifyEntity.remarks : "");
                        }
          
                    }

                    if (jsonparam["mtgReportData"] != null || jsonparam["finMtgReportData"] != null)
                    {
                        var dsMeetingReport = _mtgReportRepo.GetEntity(StoredProcs.MtgReportObjectGet,
                            new Dictionary<string, object>() 
                            { 
                            
                            { "@mtg_id", meetingEntity.mtg_id}
                            });

                        var meetingReportEntity = JsonConvert.DeserializeObject<List<MeetingSummaryReport>>(JsonConvert.SerializeObject(dsMeetingReport.Tables[0])).FirstOrDefault();
                        NotifyObject notifyObject = JsonConvert.DeserializeObject<NotifyObject>(Convert.ToString(jsonparam["mtgReportData"] != null ? jsonparam["mtgReportData"] : jsonparam["finMtgReportData"]));

                        //set up mail recipients
                        sendTo = Email;
                        sendCc = string.Format("{0};{1}", EmailCc, meetingEntity.mtg_assistant_email);
                        EmailBCC = EmailCc;

                        // send aproval
                        email_repo.MeetingReportAction(meetingEntity.mtg_id, jsonparam["mtgReportData"] != null ? "SUMM_REP_SUBMISSION" : "FINAL_REP_SUBMISSION", meetingEntity, meetingReportEntity.summary_report_uploaded_by, TemplateLink, EmailLink);
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

                    sender.SendEmail(sendTo, sendCc, EmailBCC, email_repo.EmailSubject, emailHeader.ToString() + email_repo.EmailMessage.Replace("[MAC_MAILBOX]", EmailCc));              
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
