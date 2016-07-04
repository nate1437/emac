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

        public void CreationMeeting(string mtgId, string mtgNumber, string authorName, string startDate, string endDate, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "CREATION", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "CREATION", "subject").Replace("[MEETING_NUMBER]", mtgNumber);
                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                //throw ex;
                EmailMessage = ex.Message;
            }

        }
        // submit meeting

        public void MeetingUserAction(int mtgId, MeetingGet meetingObjectData, string actionBy, string templateURL, string dataURL)
        //public void SubmitMeeting(string mtgId, MeetingGet meetingObjectData, string actionBy, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "SUBMISSION", "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "SUBMISSION", "subject")
                    .Replace("[MEETING_NUMBER]", meetingObjectData.mtg_no)
                    .Replace("[MEETING_STATUS]", meetingObjectData.status)
                    .Replace("[MEETING_NAME]", meetingObjectData.mtg_title);

                message
                    .Replace("[AUTHOR]", meetingObjectData.updated_by)
                    .Replace("[TEMPLATE_URL]", templateURL + mtgId.ToString())
                    .Replace("[APP_URL]", WebsiteURL)
                    .Replace("[MEETING_NUMBER]", meetingObjectData.mtg_no)
                    .Replace("[MEETING_STATUS]", meetingObjectData.status);

                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                EmailMessage = ex.Message;
            }
        }

        public void MeetingMacAction(int mtgId, string code, MeetingGet meetingObjectData, string templateURL, string dataURL, string remarks = "")
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();
            string _code = code.ToLower() == "revise for spmc" || code.ToLower() == "revise for finalization" ? "REJECTED" :
                code.ToLower() == "finalized" ? "FINALIZED" : "APPROVAL";

            try
            {
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", _code, "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", _code, "subject")
                    .Replace("[MEETING_NUMBER]", meetingObjectData.mtg_no)
                    .Replace("[MEETING_STATUS]", meetingObjectData.status)
                    .Replace("[MEETING_NAME]", meetingObjectData.mtg_title);
                
                message
                    .Replace("[TEMPLATE_URL]", templateURL + mtgId.ToString())
                    .Replace("[MEETING_STATUS]", meetingObjectData.status)
                    .Replace("[APP_URL]", WebsiteURL)
                    .Replace("[MEETING_NAME]", meetingObjectData.mtg_title)
                    .Replace("[DISAPPROVAL_REASON]", remarks)
                    .Replace("[MEETING_NUMBER]", meetingObjectData.mtg_no);

                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                EmailMessage = ex.Message;
            }
        }

        public void MeetingReportAction(int mtgId, string reportType, MeetingGet mtgDetails, string uploadedBy, string templateURL, string dataURL)
        {
            XMLLoader loader = new XMLLoader();
            StringBuilder message = new StringBuilder();

            try
            {
                // load notification from XML
                message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", reportType, "body"));
                EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", reportType, "subject")
                    .Replace("[MEETING_NUMBER]", mtgDetails.mtg_no)
                    .Replace("[MEETING_NAME]", mtgDetails.mtg_title);
                message
                    .Replace("[APP_URL]", WebsiteURL)
                    .Replace("[MEETING_NUMBER]", mtgDetails.mtg_no)
                    .Replace("[MEETING_STATUS]", mtgDetails.status)
                    .Replace("[AUTHOR]", uploadedBy);

                EmailMessage = message.ToString();
            }
            catch (Exception ex)
            {
                EmailMessage = ex.Message;
            }
        }

        

        //{
        //    XMLLoader loader = new XMLLoader();
        //    StringBuilder message = new StringBuilder();

        //    try
        //    {
        //        // load notification from XML
        //        message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "APPROVAL", "body"));
        //        EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "APPROVAL", "subject")
        //            .Replace("[MEETING_NUMBER]", mtgNumber)
        //            .Replace("[MEETING_STATUS]", "Approved")
        //            .Replace("[SUBMIT_DATE]", DateTime.Today.ToShortDateString());
                               
        //        message.Replace("[TEMPLATE_URL]", templateURL + mtgId.ToString());               
        //        message.Replace("[SITE_URL]", WebsiteURL);
        //        message.Replace("[APPNAME]", ApplicationName);
        //        message.Replace("[MEETING_NUMBER]", mtgNumber);


        //        EmailMessage = message.ToString();
        //    }
        //    catch (Exception ex)
        //    {
        //        //throw ex;
        //        EmailMessage = ex.Message;
        //    }
        //}

        //// finalized meeting
        //public void FinalizeMeeting(string mtgId, string mtgNumber, string authorName, string templateURL, string dataURL)
        //{
        //    XMLLoader loader = new XMLLoader();
        //    StringBuilder message = new StringBuilder();

        //    try
        //    {
        //        // load notification from XML
        //        message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "FINALIZED", "body"));
        //        EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "FINALIZED", "subject")
        //            .Replace("[MEETING_NUMBER]", mtgNumber)
        //            .Replace("[MEETING_STATUS]", "Finalized")
        //            .Replace("[SUBMIT_DATE]", DateTime.Today.ToShortDateString());

        //        message.Replace("[AUTHOR]", authorName);
        //        message.Replace("[MEETING_NUMBER]", mtgNumber);
        //        message.Replace("[TEMPLATE_URL]", templateURL + mtgId);
        //        message.Replace("[SITE_URL]", WebsiteURL);
        //        message.Replace("[APPNAME]", ApplicationName);
        //        message.Replace("[MEETING_NUMBER]", mtgNumber);


        //        EmailMessage = message.ToString();
        //    }
        //    catch (Exception ex)
        //    {
        //        //throw ex;
        //        EmailMessage = ex.Message;
        //    }
        //}
        //// reject meeting
        //// finalized meeting
        //public void RejectMeeting(string mtgId, string mtgNumber, string authorName, string remarks, string templateURL, string dataURL)
        //{
        //    XMLLoader loader = new XMLLoader();
        //    StringBuilder message = new StringBuilder();

        //    try
        //    {
        //        // load notification from XML
        //        message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "REJECTED", "body"));
        //        EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "REJECTED", "subject")
        //            .Replace("[MEETING_NUMBER]", mtgNumber)
        //            .Replace("[MEETING_STATUS]", "Revise for SPMC")
        //            .Replace("[SUBMIT_DATE]", DateTime.Today.ToShortDateString());

        //        message.Replace("[AUTHOR]", authorName);
        //        message.Replace("[DISAPPROVAL_REASON]", remarks);
        //        message.Replace("[TEMPLATE_URL]", templateURL + mtgId);
        //        message.Replace("[SITE_URL]", WebsiteURL);
        //        message.Replace("[APPNAME]", ApplicationName);
        //        message.Replace("[MEETING_NUMBER]", mtgNumber);

        //        EmailMessage = message.ToString();
        //    }
        //    catch (Exception ex)
        //    {
        //        //throw ex;
        //        EmailMessage = ex.Message;
        //    }
        //}

        //public void MeetingReportSubmit(string mtgId, string mtgNumber, string authorName, string remarks, string templateURL, string dataURL)
        //{
        //    XMLLoader loader = new XMLLoader();
        //    StringBuilder message = new StringBuilder();

        //    try
        //    {
        //        // load notification from XML
        //        message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "SUMM_REP_SUBMISSION", "body"));
        //        EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "SUMM_REP_SUBMISSION", "subject")
        //            .Replace("[MEETING_NUMBER]", mtgNumber)
        //            .Replace("[MEETING_STATUS]", "Finalized");

        //        message.Replace("[AUTHOR]", authorName);
        //        message.Replace("[TEMPLATE_URL]", templateURL + mtgId);
        //        message.Replace("[SITE_URL]", WebsiteURL);
        //        message.Replace("[APPNAME]", ApplicationName);
        //        message.Replace("[MEETING_NUMBER]", mtgNumber);

        //        EmailMessage = message.ToString();
        //    }
        //    catch (Exception ex)
        //    {
        //        //throw ex;
        //        EmailMessage = ex.Message;
        //    }
        //}

        //public void FinalMeetingReportSubmit(string mtgId, string mtgNumber, string authorName, string remarks, string templateURL, string dataURL)
        //{
        //    XMLLoader loader = new XMLLoader();
        //    StringBuilder message = new StringBuilder();

        //    try
        //    {
        //        // load notification from XML
        //        message.Append(loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "FINAL_REP_SUBMISSION", "body"));
        //        EmailSubject = loader.LoadMessageFromXML(XMLFile, "LIB_MESSAGE/MESSAGE", "code", "FINAL_REP_SUBMISSION", "subject")
        //            .Replace("[MEETING_NUMBER]", mtgNumber)
        //            .Replace("[MEETING_STATUS]", "Finalized");

        //        message.Replace("[AUTHOR]", authorName);
        //        message.Replace("[TEMPLATE_URL]", templateURL + mtgId);
        //        message.Replace("[SITE_URL]", WebsiteURL);
        //        message.Replace("[APPNAME]", ApplicationName);
        //        message.Replace("[MEETING_NUMBER]", mtgNumber);

        //        EmailMessage = message.ToString();
        //    }
        //    catch (Exception ex)
        //    {
        //        //throw ex;
        //        EmailMessage = ex.Message;
        //    }
        //}
    }
}
