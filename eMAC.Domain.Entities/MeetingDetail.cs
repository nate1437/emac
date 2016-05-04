using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{
    public class MeetingDetail
    {
        public int mtg_id { get; set; }
        public DateTime? planning_mtg_date { get; set; }
        public string planning_mtg_time { get; set; }
        public string planning_mtg_room { get; set; }
        public string present { get; set; }
        public string absent { get; set; }
        public string objectives { get; set; }
        public string background_info { get; set; }
        public string summary { get; set; }
        public string comment_on_dates { get; set; }
        public string offsite_reason { get; set; }
        public string other_facilities_reason { get; set; }
        public string criteria_for_invited_participants { get; set; }
        public string temporary_advisers { get; set; }
        public string representatives_observers { get; set; }
        public string secretariat_wpro { get; set; }
        public string secretariat_co { get; set; }
        public string secretariat_hq { get; set; }
        public string secretariat_other_regions { get; set; }
        public string secretariat_other_un_agencies { get; set; }
        public string secretarial_assistance { get; set; }
        public string courtesy_expense { get; set; }
        public string daily_allowance { get; set; }
        public string supplies_and_equipment { get; set; }
        public string cosponsorship { get; set; }
        public string logo_request { get; set; }
        public string mtg_report_delays { get; set; }
        public string mtg_report_cosponsor { get; set; }
        public string monitoring_objective { get; set; }
        public string monitoring_followup_actions { get; set; }
        public string pio_assistance { get; set; }
        public string conflict_of_interest { get; set; }
        public string budgetary_comments { get; set; }
        public string apw { get; set; }
        public string certificates { get; set; }        
        public string end_notes { get; set; }
        public string spmc_notes { get; set; }
        public string user_name { get; set; }
    }

    public class ModMeetingDetail
    {
        public int mtg_id { get; set; }
        public DateTime? planning_mtg_date { get; set; }
        public string planning_mtg_time { get; set; }
        public string planning_mtg_room { get; set; }
        public string present { get; set; }
        public string absent { get; set; }
        public string objectives { get; set; }
        public string background_info { get; set; }
        public string summary { get; set; }
        public string comment_on_dates { get; set; }
        public string offsite_reason { get; set; }
        public string other_facilities_reason { get; set; }
        public string criteria_for_invited_participants { get; set; }
        public string temporary_advisers { get; set; }
        public string representatives_observers { get; set; }
        public string secretariat_wpro { get; set; }
        public string secretariat_co { get; set; }
        public string secretariat_hq { get; set; }
        public string secretariat_other_regions { get; set; }
        public string secretariat_other_un_agencies { get; set; }
        public string secretarial_assistance { get; set; }
        public string courtesy_expense { get; set; }
        public string daily_allowance { get; set; }
        public string supplies_and_equipment { get; set; }
        public string cosponsorship { get; set; }
        public string logo_request { get; set; }
        public string mtg_report_delays { get; set; }
        public string mtg_report_cosponsor { get; set; }
        public string monitoring_objective { get; set; }
        public string monitoring_followup_actions { get; set; }
        public string pio_assistance { get; set; }
        public string conflict_of_interest { get; set; }
        public string budgetary_comments { get; set; }
        public string apw { get; set; }
        public string certificates { get; set; }
        public string updated_by { get; set; }
        public string end_notes { get; set; }
        public string spmc_notes { get; set; }
    }
}
