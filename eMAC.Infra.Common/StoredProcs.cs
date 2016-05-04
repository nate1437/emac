using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Common
{
    public sealed class StoredProcs
    {
        // usp_lib_user_level_get
        public static readonly string LibUserLevelGet = "[eMAC].[dbo].[usp_lib_user_level_get]";
        // usp_lib_user_get
        public static readonly string LibUserGet = "[eMAC].[dbo].[usp_lib_user_get]";
        // usp_lib_user_data_get
        public static readonly string LibUserDataGet = "[eMAC].[dbo].[usp_lib_user_get]";
        // usp_get_mtg_list
        public static readonly string MtgList = "[eMAC].[dbo].[usp_meeting_list]";        
        //usp_mtg_save
        public static readonly string MtgSave = "[eMAC].[dbo].[usp_meeting_ins]";
        //usp_mtg_update
        public static readonly string MtgUpdate = "[eMAC].[dbo].[usp_meeting_upd]";
        //usp_meeting_get
        public static readonly string MtgGet = "[eMAC].[dbo].[usp_meeting_get]";
        // usp_meeting_get_header
        public static readonly string MtgGetHeader = "[eMAC].[dbo].[usp_meeting_get_header]";
        // usp_next_mtg_no_get
        public static readonly string MtgNumberGet = "[eMAC].[dbo].[usp_next_mtg_no_get]";
        // usp_lib_data_get
        public static readonly string LibraryDataGet = "[eMAC].[dbo].[usp_lib_data_get]";
        // usp_mtg_detail_save
        public static readonly string MtgDetailUpdate = "[eMAC].[dbo].[usp_meeting_detail_upd]";
        // usp_participants_ins
        public static readonly string ParticipantSave = "[eMAC].[dbo].[usp_meeting_participant_country_save]";
        // usp_participants_save
        public static readonly string ParticipantUpdate = "[eMAC].[dbo].[usp_meeting_participant_country_save]";
        // usp_participants_del
        public static readonly string ParticipantDelete = "[eMAC].[dbo].[usp_meeting_participant_country_del]";
        // usp_core_function_ins
        public static readonly string CoreFunctionSave = "[eMAC].[dbo].[usp_core_function_ins]";
        // usp_core_function_del
        public static readonly string CoreFunctionDelete = "[eMAC].[dbo].[usp_core_function_del]";
        // usp_core_function_ins
        public static readonly string CoreFunctionUpdate = "[eMAC].[dbo].[usp_meeting_core_function_upd]";
        // usp_linkages_insert
        public static readonly string LinkagesSave = "[eMAC].[dbo].[usp_meeting_resolution_linkage_save]";
        //usp_linkages_save
        public static readonly string LinkagesUpdate = "[eMAC].[dbo].[usp_meeting_resolution_linkage_save]";
        // usp_linkages_del
        public static readonly string LinkagesDelete = "[eMAC].[dbo].[usp_meeting_resolution_linkage_del]";
        // usp_related_mtg_ins
        public static readonly string RelatedMtgSave = "[eMAC].[dbo].[usp_meeting_related_meeting_save]";
        // usp_related_mtg_save
        public static readonly string RelatedMtgUpdate = "[eMAC].[dbo].[usp_meeting_related_meeting_save]";
        // usp_related_mtg_del
        public static readonly string RelatedMtgDelete = "[eMAC].[dbo].[usp_meeting_related_meeting_del]";
        // usp_mtg_budget_ins
        public static readonly string MtgBudgetSave = "[eMAC].[dbo].[usp_meeting_budget_save]";
        // usp_mtg_budget_save
        public static readonly string MtgBudgetUpdate = "[eMAC].[dbo].[usp_meeting_budget_save]";
        // usp_mtg_budget_del
        public static readonly string MtgBudgetDelete = "[eMAC].[dbo].[usp_meeting_budget_del]";
        // usp_mtg_pb_category_ins
        public static readonly string MtgPbCategorySave = "[eMAC].[dbo].[usp_mtg_pb_category_ins]";
        // usp_mtg_pb_category_del
        public static readonly string MtgPbCategoryDelete = "[eMAC].[dbo].[usp_mtg_pb_category_del]";
        // usp_mtg_pb_outcome_ins
        public static readonly string MtgPbOutcomeSave = "[eMAC].[dbo].[usp_mtg_pb_outcome_ins]";
        // usp_mtg_pb_outcome_del
        public static readonly string MtgPbOutcomeDelete = "[eMAC].[dbo].[usp_mtg_pb_outcome_del]";
        // usp_mtg_pb_output_ins
        public static readonly string MtgPbOutputSave = "[eMAC].[dbo].[usp_mtg_pb_output_ins]";
        // usp_mtg_pb_output_del
        public static readonly string MtgPbOutputDelete = "[eMAC].[dbo].[usp_mtg_pb_output_del]";
        // usp_mtg_action_history_ins
        //public static readonly string MtgActionSave = "[eMAC].[dbo].[usp_meeting_upd_status]";
        // usp_meeting_report_get_report
        public static readonly string MtgReportGet = "[eMAC].[dbo].[usp_meeting_report_get]";
        // usp_meeting_report_upd_report
        public static readonly string MtgReportUpdate = "[eMAC].[dbo].[usp_meeting_report_upload]";
        // usp_meeting_report_upload
        public static readonly string MtgReportCsUpdate = "[eMAC].[dbo].[usp_meeting_report_upload]";
        // usp_meeting_report_del
        public static readonly string MtgReportDelete = "[eMAC].[dbo].[usp_meeting_report_del]";
        // usp_mtg_report_obj_get
        public static readonly string MtgReportObjectGet = "[eMAC].[dbo].[usp_meeting_report_get]";
        // mtg_report_resp_officer_save
        public static readonly string MtgReportRespOfcrUpdate = "[eMAC].[dbo].[usp_meeting_report_upd_resp_officer]";
        // usp_meeting_participant_import_get
        public static readonly string MtgParticipantsIB2ObjectGet = "[eMAC].[dbo].[usp_meeting_participant_list]";
        // usp_meeting_document_ins
        public static readonly string MtgDocumentsObjectSave = "[eMAC].[dbo].[usp_meeting_document_ins]";
        // usp_meeting_document_get
        public static readonly string MtgDocumentsObjectGet = "[eMAC].[dbo].[usp_meeting_document_list]";
        // usp_meeting_document_del
        public static readonly string MtgDocumentDelete = "[eMAC].[dbo].[usp_meeting_document_del]";
        // usp_meeting_document_save
        public static readonly string MtgDocumentUpdate = "[eMAC].[dbo].[usp_meeting_document_save]";
        // usp_meeting_action_history_get
        public static readonly string MtgActionsGet = "[eMAC].[dbo].[usp_action_history_list]";

        public static readonly string PlanningDocumentView = "[eMAC].[dbo].[usp_rpt_planning_document]";

        public static readonly string MtgUpdateStatus = "[eMAC].[dbo].[usp_meeting_upd_status]";

        public static readonly string MtgActionInsert = "[eMAC].[dbo].[usp_action_history_ins]";

        public static readonly string ParticipantsIB2View = "[eMac].[dbo].[usp_rpt_ib2]";

        public static readonly string MtgDelete = "[eMac].[dbo].[usp_meeting_del]";
    }
}
