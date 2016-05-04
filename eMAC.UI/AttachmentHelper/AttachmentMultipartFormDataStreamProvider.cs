using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Configuration;
using WebApiAngularJsUploader.Helper;

namespace WebApiAngularJsUploader.Attachment
{
    public class AttachmentMultipartFormDataStreamProvider : MultipartFormDataStreamProvider
    {
       public AttachmentMultipartFormDataStreamProvider(string path)
            : base(path)    
        {
        }
 
        public override string GetLocalFileName(System.Net.Http.Headers.HttpContentHeaders headers)
        {
            try
            {
                //Make the file name URL safe and then use it & is the only disallowed url character allowed in a windows filename
                var name = !string.IsNullOrWhiteSpace(headers.ContentDisposition.FileName) ? headers.ContentDisposition.FileName : "NoName";

                return name.Trim(new char[] { '"' })
                                   .Replace("&", "and");
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
        
    }
}