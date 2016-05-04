using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{
    public class Upload
    {
        public int mtg_id { get; set; }
        public string file_name { get; set; }
        public string upload_type { get; set; }
        public string doc_title { get; set; }
        public string doc_type { get; set; }
        public int sort_order { get; set; }
        public string user_name { get; set; }
    }

    public class UploadGet
    {
        public int meeting_document_id { get; set; }
        public int mtg_id { get; set; }
        public string file_name { get; set; }
        public string upload_type { get; set; }
        public string doc_title { get; set; }
        public string doc_type { get; set; }
        public int sort_order { get; set; }
        public string created_by { get; set; }
        public DateTime date_created { get; set; }
        public string updated_by { get; set; }
        public DateTime date_updated { get; set; }
    }

    public class UploadGetNeeded
    {
        public int meeting_document_id { get; set; }
        public int mtg_id { get; set; }
        public string file_name { get; set; }
        public string upload_type { get; set; }
        public string doc_title { get; set; }
        public string doc_type { get; set; }
        public string updated_by { get; set; }
        public DateTime date_updated { get; set; }
    }

    public class UploadDel
    {
        public int meeting_document_id { get; set; }
        public int mtg_id { get; set; }
        public string file_name { get; set; }
        public string upload_type { get; set; }
        public string doc_title { get; set; }
        public string doc_type { get; set; }
        public int sort_order { get; set; }
        public string created_by { get; set; }
        public DateTime date_created { get; set; }
    }
}
