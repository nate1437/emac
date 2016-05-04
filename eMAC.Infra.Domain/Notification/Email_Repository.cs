using eMAC.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public class Email_Repository
    {
        public string XMLFile;
        public string WebsiteURL;
        public string ApplicationName;

        public string EmailMessage;
        public string EmailSubject;

        public Email_Repository(string xmlFile, string siteURL, string appName)
        {
            this.XMLFile = xmlFile;
            this.WebsiteURL = siteURL;
            this.ApplicationName = appName;
        }

        public void SubmitMR_Returned(string mr_id, string mr_no, string authorName, string duration, string reviewer,string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                // load notification from XML
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "RETURNED", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "RETURNED", "subject").Replace("[MR_NO]", mr_no);

                message.Replace("[AUTHOR]", authorName);
                message.Replace("[DURATION]", duration);
                message.Replace("[DATA_URL]", dataURL);
                message.Replace("[MR_ID]", mr_id);
                message.Replace("[SITE_URL]", WebsiteURL);
                message.Replace("[APPNAME]", ApplicationName);

                message.Replace("[REVIEWER]", reviewer);
                message.Replace("[RETURN_DUE_DATE]", DateTime.Today.AddDays(3.0).ToString("dd MMM yyyy"));

                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                //throw ex;
                EmailMessage = ex.Message;
            }

        }
        
        public void CreationMeeting(string mtgId, string mtgNumber, string authorName, string startDate, string endDate, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                // load notification from XML
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "CREATION", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "CREATION", "subject").Replace("[MEETING_NUMBER]", mtgNumber);

                //message.Replace("[AUTHOR]", authorName);
                //message.Replace("[DURATION]", duration);
                //message.Replace("[TEMPLATE_URL]", templateURL);
                //message.Replace("[DATA_URL]", dataURL);
                //message.Replace("[DUE_DATE]", dueDate);
                //message.Replace("[SITE_URL]", WebsiteURL);
                //message.Replace("[APPNAME]", ApplicationName);
                //message.Replace("[MR_ID]", mr_id);

                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                //throw ex;
                EmailMessage = ex.Message;
            }

        }
        // submit meeting
        public void SubmitMeeting(string mtgId, MeetingGet meetingObjectData, string actionBy, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                // load notification from XML
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "SUBMISSION", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "SUBMISSION", "subject")
                    .Replace("[MEETING_NUMBER]", meetingObjectData.mtg_no)
                    .Replace("[MEETING_STATUS]", meetingObjectData.status)
                    .Replace("[SUBMIT_DATE]", DateTime.Today.ToShortDateString());

                message.Replace("[AUTHOR]", actionBy);
                //message.Replace("[DURATION]", duration);
                message.Replace("[TEMPLATE_URL]", templateURL + mtgId);
                message.Replace("[DATA_URL]", dataURL);
                message.Replace("[SITE_URL]", WebsiteURL);
                message.Replace("[APPNAME]", ApplicationName);
                message.Replace("[MEETING_NUMBER]", meetingObjectData.mtg_no);


                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                //throw ex;
                EmailMessage = ex.Message;
            }
        }

        // approve meeting
        public void ApproveMeeting(string mtgId, string mtgNumber, string authorName, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                // load notification from XML
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "APPROVAL", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "APPROVAL", "subject")
                    .Replace("[MEETING_NUMBER]", mtgNumber)
                    .Replace("[MEETING_STATUS]", "Approved")
                    .Replace("[SUBMIT_DATE]", DateTime.Today.ToShortDateString());
                               
                //message.Replace("[DURATION]", duration);
                message.Replace("[TEMPLATE_URL]", templateURL + mtgId);               
                message.Replace("[SITE_URL]", WebsiteURL);
                message.Replace("[APPNAME]", ApplicationName);
                message.Replace("[MEETING_NUMBER]", mtgNumber);


                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                //throw ex;
                EmailMessage = ex.Message;
            }
        }

        // finalized meeting
        public void FinalizeMeeting(string mtgId, string mtgNumber, string authorName, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                // load notification from XML
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "FINALIZED", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "FINALIZED", "subject")
                    .Replace("[MEETING_NUMBER]", mtgNumber)
                    .Replace("[MEETING_STATUS]", "Finalized")
                    .Replace("[SUBMIT_DATE]", DateTime.Today.ToShortDateString());

                message.Replace("[AUTHOR]", authorName);
                message.Replace("[MEETING_NUMBER]", mtgNumber);
                message.Replace("[TEMPLATE_URL]", templateURL + mtgId);
                message.Replace("[SITE_URL]", WebsiteURL);
                message.Replace("[APPNAME]", ApplicationName);
                message.Replace("[MEETING_NUMBER]", mtgNumber);


                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                //throw ex;
                EmailMessage = ex.Message;
            }
        }
        // reject meeting
        // finalized meeting
        public void RejectMeeting(string mtgId, string mtgNumber, string authorName, string remarks, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                // load notification from XML
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "REJECTED", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "REJECTED", "subject")
                    .Replace("[MEETING_NUMBER]", mtgNumber)
                    .Replace("[MEETING_STATUS]", "Revise for SPMC")
                    .Replace("[SUBMIT_DATE]", DateTime.Today.ToShortDateString());

                message.Replace("[AUTHOR]", authorName);
                message.Replace("[DISAPPROVAL_REASON]", remarks);
                message.Replace("[TEMPLATE_URL]", templateURL + mtgId);
                message.Replace("[SITE_URL]", WebsiteURL);
                message.Replace("[APPNAME]", ApplicationName);
                message.Replace("[MEETING_NUMBER]", mtgNumber);

                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                //throw ex;
                EmailMessage = ex.Message;
            }
        }

        public void MeetingReportSubmit(string mtgId, string mtgNumber, string authorName, string remarks, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                // load notification from XML
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "SUMM_REP_SUBMISSION", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "SUMM_REP_SUBMISSION", "subject")
                    .Replace("[MEETING_NUMBER]", mtgNumber)
                    .Replace("[MEETING_STATUS]", "Finalized");

                message.Replace("[AUTHOR]", authorName);
                message.Replace("[TEMPLATE_URL]", templateURL + mtgId);
                message.Replace("[SITE_URL]", WebsiteURL);
                message.Replace("[APPNAME]", ApplicationName);
                message.Replace("[MEETING_NUMBER]", mtgNumber);

                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                //throw ex;
                EmailMessage = ex.Message;
            }
        }

        public void FinalMeetingReportSubmit(string mtgId, string mtgNumber, string authorName, string remarks, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                // load notification from XML
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "FINAL_REP_SUBMISSION", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "FINAL_REP_SUBMISSION", "subject")
                    .Replace("[MEETING_NUMBER]", mtgNumber)
                    .Replace("[MEETING_STATUS]", "Finalized");

                message.Replace("[AUTHOR]", authorName);
                message.Replace("[TEMPLATE_URL]", templateURL + mtgId);
                message.Replace("[SITE_URL]", WebsiteURL);
                message.Replace("[APPNAME]", ApplicationName);
                message.Replace("[MEETING_NUMBER]", mtgNumber);

                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                //throw ex;
                EmailMessage = ex.Message;
            }
        }
    }
}
