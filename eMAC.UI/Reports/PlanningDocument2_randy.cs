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
    public partial class PlanningDocument2_randy : Telerik.Reporting.Report
    {
        private IEmacDbContext _context;
        private IReportRepository _repository;
        private DataSet _data;
        private int _refId = 0;

        public PlanningDocument2_randy(int meetingID)
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
                }

                if (_meeting_details.Rows.Count > 0)
                {
                    String secretariatWPRO = _meeting_details.Rows[0]["secretariat_wpro"].ToString();
                    String secretariatCO = _meeting_details.Rows[0]["secretariat_co"].ToString();
                    String secretariatHQ = _meeting_details.Rows[0]["secretariat_hq"].ToString();
                    String secretariatOtherRegions = _meeting_details.Rows[0]["secretariat_other_regions"].ToString();
                    String secretariatOtherUNAgencies = _meeting_details.Rows[0]["secretariat_other_un_agencies"].ToString();

                    who_wpro_roles.Value = secretariatWPRO.ToString();
                    country_office_roles.Value = secretariatCO.ToString();
                    who_hq_roles.Value = secretariatHQ.ToString();
                    other_region_roles.Value = secretariatOtherRegions.ToString();

                    if (secretariatOtherUNAgencies.Length > 0)
                    {
                        other_un_roles.Value = secretariatOtherUNAgencies.ToString();
                    }
                    else
                    {
                        other_un_roles.Visible = false;
                        other_un_roles_label.Visible = false;
                    }

                    secretarial_assistance.Value = _meeting_details.Rows[0]["secretarial_assistance"].ToString();
                    courtesy_expense.Value = _meeting_details.Rows[0]["courtesy_expense"].ToString();
                    daily_allowance.Value = _meeting_details.Rows[0]["daily_allowance"].ToString();
                    supplies_equipment.Value = _meeting_details.Rows[0]["supplies_and_equipment"].ToString();
                    co_sponsored.Value = _meeting_details.Rows[0]["cosponsorship"].ToString();
                    use_who_logo.Value = _meeting_details.Rows[0]["logo_request"].ToString();
                    mtg_report_delays.Value = _meeting_details.Rows[0]["mtg_report_delays"].ToString();
                    mtg_report_cosponsor.Value = _meeting_details.Rows[0]["mtg_report_cosponsor"].ToString();
                    monitoring_objective.Value = _meeting_details.Rows[0]["monitoring_objective"].ToString();
                    monitoring_followup_actions.Value = _meeting_details.Rows[0]["monitoring_followup_actions"].ToString();
                    communication_activities.Value = _meeting_details.Rows[0]["pio_assistance"].ToString();
                    conflict_of_interest.Value = _meeting_details.Rows[0]["conflict_of_interest"].ToString();

                    String apwInfo = _meeting_details.Rows[0]["apw"].ToString();
                    if (apwInfo.Length > 0)
                    {
                        apw.Value = apwInfo;
                    }
                    else
                    {
                        apw_label.Visible = false;
                        apw.Visible = false;
                    }

                    String certificateInfo = _meeting_details.Rows[0]["certificates"].ToString();
                    if (certificateInfo.Length > 0)
                    {
                        certificates.Value = certificateInfo;
                    }
                    else
                    {
                        certificates_label.Visible = false;
                        certificates.Visible = false;
                    }
                }

                if (_meeting_budget.Rows.Count > 0)
                {
                    StringBuilder ptaeoAll = new StringBuilder();
                    StringBuilder fundSource = new StringBuilder();
                    long totalFunds = 0;
                    long totalEstimate = 0;

                    foreach (DataRow row in _meeting_budget.Rows)
                    {
                        if (ptaeoAll.Length > 0)
                        {
                            ptaeoAll.Append("; ");
                        }
                        ptaeoAll.Append(row["ptaeo"].ToString());

                        if (fundSource.Length > 0)
                        {
                            fundSource.Append("; ");
                        }
                        fundSource.Append(row["src_of_fund"].ToString());
                        
                        totalFunds += (int) row["funds_available"];
                        totalEstimate += (int) row["estimated_cost"];
                    }

                    budget_info_estimated_cost.Value = totalEstimate.ToString("");
                    budget_info_funds_available.Value = totalFunds.ToString("");
                    budget_info_source_of_funds.Value = fundSource.ToString();
                    budget_info_ptaeo.Value = ptaeoAll.ToString();
                }

            }
        }

    }
}
