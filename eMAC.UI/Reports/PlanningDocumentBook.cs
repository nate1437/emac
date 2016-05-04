using System;
using System.ComponentModel;

namespace eMAC.UI.Reports
{
    public class PlanningDocumentBook: Telerik.Reporting.ReportBook
    {
        public PlanningDocumentBook(int meetingID)
        {
            this.Reports.Add(new PlanningDocument(meetingID));
            this.Reports.Add(new PlanningDocument2(meetingID));
        }
    }
}