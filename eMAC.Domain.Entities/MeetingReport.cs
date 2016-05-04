using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{

    public class MeetingSummaryReport
    {
        public int mtg_report_id { get; set; }
        public int mtg_id { get; set; }        
        public string summary_report_uploaded_by { get; set; }
        public string summary_report_filename { get; set; }
        public string summary_report_cs_uploaded_by { get; set; }
    }

    public class MeetingFinalReport
    {
        public int mtg_report_id { get; set; }
        public int mtg_id { get; set; }
        public string final_report_uploaded_by { get; set; }
        public string final_report_filename { get; set; }
        public string final_report_cs_uploaded_by { get; set; }
    }    
}