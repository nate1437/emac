using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public class EmailSender : ISender
    {
        public string EmailHost;
        public string SenderName;
        public string SenderEmail;
        public SmtpClient SMTPServer;

        public EmailSender()
            : this("10.24.0.54", "noreply@wpro.who.int", "System Administrator")
        {
        }

        public EmailSender(string host, string emailFrom, string sender)
        {
            EmailHost = host;
            SenderEmail = emailFrom;
            SenderName = sender;
            SMTPServer = new SmtpClient(EmailHost);
        }

        public void SendEmail(string sendTo, string sendCC, string sendBCC, string subject, string body)
        {
            MailMessage message = new MailMessage();

            try
            {
                message.From = new MailAddress(SenderEmail, SenderName);
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;

                //message.To.Add(sendTo.Replace(';', ','));
                if (sendTo.Length > 0)
                {
                    foreach (string e in sendTo.Split(';'))
                    {
                        if (!string.IsNullOrEmpty(e))
                            message.To.Add(new MailAddress(e));
                    }

                }
                if (sendCC.Length > 0)
                {
                    foreach (string e in sendCC.Split(';'))
                    {   if(!string.IsNullOrEmpty(e))
                            message.CC.Add(new MailAddress(e));
                    }
                    
                    //message.CC.Add(sendCC.Replace(';', ','));
                }
                if (sendBCC.Length > 0)
                {
                    foreach (string e in sendBCC.Split(';'))
                    {
                        if (!string.IsNullOrEmpty(e))
                            message.Bcc.Add(new MailAddress(e));
                    }

                    //message.Bcc.Add(sendBCC.Replace(';', ','));
                }

                SMTPServer.Send(message);
            }
            catch (Exception ex)
            {
                //throw ex;
            }
        }
    }
}
