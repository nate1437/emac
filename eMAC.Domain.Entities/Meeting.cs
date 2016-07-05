using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{
    public class Meeting
    {
        public int mtg_id { get; set; }
        public string mtg_title { get; set; }
        public DateTime start_date { get; set; }
        public DateTime end_date { get; set; }       
        //public string div_code { get; set; }
        //public string unit_code { get; set; }
        public string office_code { get; set; }
        public string org_unit { get; set; }
        public string resp_officer { get; set; }
        public string co_resp_officer { get; set; }
        public string mtg_assistant { get; set; }
        public string venue { get; set; }
        public string ctry_code { get; set; }
        public string mtg_type { get; set; }
        public string mtg_classification { get; set; }
        public bool is_spmc_waived { get; set; }
        public bool is_four_mos_waiver_approved { get; set; }
        public bool is_not_wpro_mtg { get; set; }
        public bool incl_in_events_calendar { get; set; }
        public DateTime? spmc_approval_date { get; set; }
        public string working_language { get; set; }
        public bool needs_summary_report { get; set; }
        public bool needs_final_report { get; set; }        
        public string status { get; set; }
        public string user_name { get; set; }
    }

    public class MeetingGet
    {
        public int mtg_id { get; set; }
        public string mtg_no { get; set; }
        public string mtg_title { get; set; }        
        //public DateTime start_date { get; set; }
        //public DateTime end_date { get; set; }
        //public string office_code { get; set; }
        //public string div_code { get; set; }
        //public string unit_code { get; set; }
        //public string org_unit { get; set; }
        public string resp_officer { get; set; }
        //public string co_resp_officer { get; set; }
        public string mtg_assistant { get; set; }
        //public string venue { get; set; }
        //public string ctry_code { get; set; }
        //public string mtg_type { get; set; }
        //public string mtg_classification { get; set; }
        //public bool is_spmc_waived { get; set; }
        //public bool is_four_mos_waiver_approved { get; set; }
        //public bool is_not_wpro_mtg { get; set; }
        //public bool incl_in_events_calendar { get; set; }
        //public DateTime? spmc_approval_date { get; set; }
        //public bool needs_summary_report { get; set; }
        //public bool needs_final_report { get; set; }
        //public string working_language { get; set; }
        public string status { get; set; }
        public string updated_by { get; set; }
        //public string created_by { get; set; }
    }
}
