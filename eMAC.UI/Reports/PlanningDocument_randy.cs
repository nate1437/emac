using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using System;
using System.ComponentModel;
using System.Drawing;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using Telerik.Reporting;
using Telerik.Reporting.Drawing;

namespace eMAC.UI.Reports
{
    public partial class PlanningDocument_randy : Telerik.Reporting.Report
    {
        private IEmacDbContext _context;
        private IReportRepository _repository;
        private DataSet _data;
        private int _refId = 0;

        public PlanningDocument_randy(int meetingID)
        {
            var parameters = new Dictionary<string, object>();

            _refId = meetingID;
            InitializeComponent();

            _context = new eMacDbContext();
            _repository = new ReportRepository(_context);

            parameters.Add("@mtg_id", meetingID);
            _data = _repository.GetEntity(StoredProcs.PlanningDocumentView, parameters);

            if (_data.Tables.Count > 0)
            {
                DataTable _meeting = _data.Tables[0];
                DataTable _meeting_details = _data.Tables[1];
                DataTable _core_function = _data.Tables[2];
                DataTable _meeting_budget = _data.Tables[3];
                DataTable _participant_country = _data.Tables[4];
                DataTable _resolution_linkages = _data.Tables[5];
                DataTable _related_meetings = _data.Tables[6];

                if (_meeting.Rows.Count > 0)
                {
                    // formulate control number
                    StringBuilder controlNo = new StringBuilder();
                    controlNo.Append("WPR/");
                    controlNo.Append(_meeting.Rows[0]["mtg_no"].ToString()).Append("/");
                    controlNo.Append(_meeting.Rows[0]["unit_code"].ToString()).Append("/");
                    controlNo.Append(Convert.ToDateTime(_meeting.Rows[0]["start_date"]).Year);
                    control_no.Value = controlNo.ToString();
                    print_date.Value = _meeting.Rows[0]["mtg_duration"].ToString();

                    meeting_title.Value = "(" + _meeting.Rows[0]["mtg_title"].ToString().ToUpper() + ")";

                    proposed_title.Value = "The proposed title is " + _meeting.Rows[0]["mtg_title"].ToString();

                    meeting_date.Value = _meeting.Rows[0]["mtg_duration"].ToString();
                    meeting_venue.Value = _meeting.Rows[0]["venue"].ToString() + ", " + _meeting.Rows[0]["ctry_name"].ToString();

                    working_language.Value = _meeting.Rows[0]["working_language"].ToString();

                }

                if (_meeting_details.Rows.Count > 0)
                {
                    StringBuilder planningInfo = new StringBuilder(internal_planning_label.Value);
                    planningInfo.Replace("@DATE", _meeting_details.Rows[0]["planning_date"].ToString());
                    planningInfo.Replace("@TIME", _meeting_details.Rows[0]["planning_mtg_time"].ToString());
                    planningInfo.Replace("@ROOM", _meeting_details.Rows[0]["planning_mtg_room"].ToString());
                    internal_planning_label.Value = planningInfo.ToString();

                    present_list.Value = _meeting_details.Rows[0]["present"].ToString();

                    String absent = _meeting_details.Rows[0]["absent"].ToString();
                    if (absent.Length > 0) {
                        absent_list.Value = absent;
                    } else {
                        absent_label.Visible = false;
                        absent_list.Visible = false;
                    }

                    background_info.Value = _meeting_details.Rows[0]["background_info"].ToString();
                    summary_info.Value = _meeting_details.Rows[0]["summary"].ToString();

                    objectives.Value = _meeting_details.Rows[0]["objectives"].ToString();

                    String offsiteReason = _meeting_details.Rows[0]["offsite_reason"].ToString();
                    if (offsiteReason.Length > 0)
                    {
                        offsite_reason.Value = offsiteReason;
                    }
                    else
                    {
                        offsite_reason_label.Visible = false;
                        offsite_reason.Visible = false;
                    }

                    String otherFacilities = _meeting_details.Rows[0]["other_facilities_reason"].ToString();
                    if (otherFacilities.Length > 0)
                    {
                        avail_webex.Value = otherFacilities;
                    }
                    else
                    {
                        avail_webex.Visible = false;
                        avail_webex_label.Visible = false;
                    }

                    participants_criteria.Value = _meeting_details.Rows[0]["criteria_for_invited_participants"].ToString();
                    temporary_advisers.Value = _meeting_details.Rows[0]["temporary_advisers"].ToString();
                    representative_observer.Value = _meeting_details.Rows[0]["representatives_observers"].ToString();
                }

                if (_core_function.Rows.Count > 0)
                {
                    StringBuilder coreFunctions = new StringBuilder();
                    coreFunctions.Append("<ul style='padding:5px;'>");
                    foreach (DataRow row in _core_function.Rows)
                    {
                        coreFunctions.Append("<li style='padding:2px;'>");
                        coreFunctions.Append(row["core_function_name"].ToString());
                        coreFunctions.Append("</li>");
                    }
                    coreFunctions.Append("</ul>");
                    core_functions.Value = coreFunctions.ToString();
                }

                if (_participant_country.Rows.Count > 0)
                {
                    participants.DataSource = _participant_country;
                }

                if (_resolution_linkages.Rows.Count > 0)
                {
                    linkage_resolution.DataSource = _resolution_linkages;
                }

                if (_related_meetings.Rows.Count > 0)
                {
                    related_meetings.DataSource = _related_meetings;
                }
            }
        }

    }
}
