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
using System.Linq;
using Telerik.Reporting.Processing;
using System.Web.Hosting;
using System.Xml.Linq;

namespace eMAC.UI.Reports
{
    public partial class PlanningDocument : Telerik.Reporting.Report
    {
        private IEmacDbContext _context;
        private IReportRepository _repository;
        private DataSet _data;
        private int _refId = 0;

        private string xmlLocation = string.Format("{0}end_notes_default.xml", HostingEnvironment.MapPath("~/xml/"));

        public PlanningDocument(int meetingID)
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
                var _pb = _data.Tables[7];

                if (_meeting.Rows.Count > 0)
                {
                    // formulate control number
                    StringBuilder controlNo = new StringBuilder();
                    controlNo.Append("WPR/");
                    controlNo.Append(_meeting.Rows[0]["mtg_no"].ToString()).Append("/");
                    controlNo.Append(_meeting.Rows[0]["org_unit"].ToString()).Append("/");
                    controlNo.Append(Convert.ToDateTime(_meeting.Rows[0]["start_date"]).Year);
                    control_no.Value = controlNo.ToString();
                    print_date.Value = DateTime.Now.ToString("dd MMMM yyyy");//_meeting.Rows[0]["mtg_duration"].ToString();

                    meeting_title.Value = _meeting.Rows[0]["mtg_title"].ToString().ToUpper();


                    proposed_title.Value = "The proposed title is \"" + _meeting.Rows[0]["mtg_title"].ToString() + "\".";

                   /* var meeting_dur = _meeting.Rows[0]["mtg_duration"].ToString().Split('|');
                    if (!meeting_dur[0].Equals(meeting_dur[1]))
                    {
                        if (Convert.ToDateTime(meeting_dur[0]).Year == Convert.ToDateTime(meeting_dur[1]).Year)
                        {
                            if (Convert.ToDateTime(meeting_dur[0]).Month == Convert.ToDateTime(meeting_dur[1]).Month)
                            {
                                meeting_date.Value = string.Format("{0:dd} - {1:dd MMMM yyyy}", Convert.ToDateTime(meeting_dur[0]), Convert.ToDateTime(meeting_dur[1]));
                            }
                            else
                            {
                                meeting_date.Value = string.Format("{0:dd MMMM} - {1:dd MMMM yyyy}", Convert.ToDateTime(meeting_dur[0]), Convert.ToDateTime(meeting_dur[1]));
                            }
                        }
                        else
                        {
                            meeting_date.Value = string.Format("{0:dd MMMM yyyy} - {1:dd MMMM yyyy}", Convert.ToDateTime(meeting_dur[0]), Convert.ToDateTime(meeting_dur[1]));
                        }

                    }
                    else
                    {
                        meeting_date.Value = Convert.ToDateTime(meeting_dur[0]).ToString("dd MMMM yyyy");
                    }*/
                    meeting_date.Value = _meeting.Rows[0]["mtg_duration"].ToString();
                    meeting_venue.Value = _meeting.Rows[0]["venue"].ToString() + ", " + _meeting.Rows[0]["ctry_name"].ToString();

                    working_language.Value = _meeting.Rows[0]["working_language"].ToString();
                
                }

                if (_meeting_details.Rows.Count > 0)
                {
                    var meeting_planning = string.IsNullOrEmpty(_meeting_details.Rows[0]["planning_mtg_date"].ToString());
                    var planning_time = string.IsNullOrEmpty(_meeting_details.Rows[0]["planning_mtg_time"].ToString());
                    var meeting_room = string.IsNullOrEmpty(_meeting_details.Rows[0]["planning_mtg_room"].ToString());

                    StringBuilder planningInfo = new StringBuilder(internal_planning_label.Value);
                    planningInfo.Replace("@DATE", meeting_planning ? "": Convert.ToDateTime(_meeting_details.Rows[0]["planning_mtg_date"]).ToString("dd MMMM yyyy"));
                    planningInfo.Replace("@TIME",  planning_time ? "": _meeting_details.Rows[0]["planning_mtg_time"].ToString());
                    planningInfo.Replace("@ROOM",  meeting_room ? "" : _meeting_details.Rows[0]["planning_mtg_room"].ToString());
                    internal_planning_label.Value = planningInfo.ToString();

                    var presentlist = "{0}: <br /> <br />" + _meeting_details.Rows[0]["present"].ToString()
                        .Replace("<p>", "")
                        .Replace("</p>", "<br />");

                    if (_meeting_details.Rows[0]["absent"].ToString().Length > 0)
                    {
                        absent_list.Value = "Invited-unable to attend: <br /><br />" + _meeting_details.Rows[0]["absent"].ToString()
                            .Replace("<p>", "")
                            .Replace("</p>", "<br />");
                    }
                    else
                    {
                        absent_list.Visible = false;
                    }

                    present_list.Value = string.Format(presentlist, (absent_list.Visible) ? "Present" : "Attendees");


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

                var endNotesValue = _meeting_details.Rows[0]["end_notes"].ToString();
                if (string.IsNullOrEmpty(endNotesValue))
                    endNotesValue = XElement.Load(xmlLocation).ReadEndNotesFromXml("end_note");
                foreach (string s in endNotesValue.Split('$'))
                {
                    if (!string.IsNullOrEmpty(s))
                    {
                        //string[] sVal = s.Split(';');
                        foreach (string innerS in s.Split(';'))
                        {
                            
                            if (innerS.Split('=')[0].ToString().ToUpper().Equals("PARAM"))
                            {
                                if (innerS.Split('=')[1].ToString().ToUpper().Equals("@SUBSCRIPTTWO"))
                                {
                                    var newLabel = representative_observer_label.Value.Replace("@subScriptTwo", s.Split(';')[0].Split('=')[1].ToString());
                                    representative_observer_label.Value = newLabel;
                                } 
                                if (innerS.Split('=')[1].ToString().ToUpper().Equals("@SUBSCRIPTONE"))
                                {
                                    var newLabel = internal_planning_label.Value.Replace("@subScriptOne", s.Split(';')[0].Split('=')[1].ToString());
                                    internal_planning_label.Value = newLabel;
                                }
                            }
                        }
                    }
                }

                var newCategory = new Dictionary<string, Dictionary<string, List<string>>>();
                foreach (DataRow dr in _pb.Rows)
                {
                    // ADD CATEGORY
                    if (newCategory.Where(x => x.Key == dr["pb_category"].ToString()).Count() == 0)
                    {
                        var filteredOutcome = _pb.Select(string.Format("pb_category='{0}'", dr["pb_category"].ToString())).Distinct();
                        var newOutcome = new Dictionary<string, List<string>>();
                        foreach (DataRow fDR in filteredOutcome)
                        {
                            if (newOutcome.Where(x => x.Key == fDR["pb_outcome"].ToString()).Count() == 0)
                            {
                                var filteredOutput = _pb.Select(string.Format("pb_category='{0}'", dr["pb_category"].ToString())).Distinct();
                                var newOutput = new List<string>();
                                foreach (DataRow drOutput in filteredOutput)
                                {
                                    if (newOutput.Where(x => x.ToString() == drOutput["pb_output"].ToString()).Count() == 0)
                                    {
                                        newOutput.Add(drOutput["pb_output"].ToString());
                                    }
                                }
                                newOutcome.Add(dr["pb_outcome"].ToString(), newOutput);
                            }
                        }
                        newCategory.Add(dr["pb_category"].ToString(), newOutcome);
                    }
                }

                
                var rptDoc = new PBOutcomeDocument(newCategory);
                var subReport = new Telerik.Reporting.SubReport()
                {
                    ReportSource = new Telerik.Reporting.InstanceReportSource()
                    {
                        ReportDocument = rptDoc
                    }
                };
                programme_budget_panel.Items.Add(subReport);
                //if (newCategory.Count > 0)
                //{
                //    var x = 0;
                //    foreach (var i in newCategory)
                //    {
                //        if (x == 0)
                //        {

                //           // ((Telerik.Reporting.Processing.HtmlTextBox)((Telerik.Reporting.Table)(programme_budget)).Rows[0].GetCell(0).Item).Value = i.Key;
                //        }
                //    }
                //}
                //foreach (var i in newCategory)
                //{

                //    foreach (var j in i.Value)
                //    {
                //        foreach (string s in j.Value)
                //        {
                //        }
                //    }
                //}
                /*
                foreach (var i in newCategory)
                {
                    
                }

                foreach (var i in newCategory)
                {
                    foreach (var j in i.Value)
                    {
                        var filtered = _pb.Select(string.Format("pb_category='{0}' and pb_outcome='{1}'", i.Key, j.Key)).Distinct();
                        var newOutput = new List<string>();
                        foreach (DataRow dr in filtered)
                        {
                            if (newOutput.Where(x => x.ToString() == dr["pb_output"].ToString()).Count() == 0)
                            {
                                newOutput.Add(dr["pb_output"].ToString());
                            }
                        }
                    }
                }*/
            }
        }

    }
}
