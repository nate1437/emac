<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>
<%@ Import Namespace="eMAC.UI.Reports" %>
<%@ Register assembly="Telerik.ReportViewer.WebForms, Version=9.2.15.1126, Culture=neutral, PublicKeyToken=a9d7983dfcc261be" namespace="Telerik.ReportViewer.WebForms" tagprefix="telerik" %>

<!DOCTYPE html>

<html>
<head runat="server">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width" />
    <title>Planning Document</title>
</head>
<body>
    <script runat="server">
    public override void VerifyRenderingInServerForm(Control control)
    {
      // to avoid the server form (<form runat="server"> requirement
    }
    protected override void OnLoad(EventArgs e)
    {
        var instanceReportSource = new Telerik.Reporting.InstanceReportSource();

        if (ViewBag.PlanningDocument != null)
        {
            string emac_id = Request.QueryString["emac_id"];
            instanceReportSource.ReportDocument = new PlanningDocumentBook(Int32.Parse(emac_id));
            instanceReportSource.Parameters.Add(new Telerik.Reporting.Parameter("emac_id", emac_id));
        }
        else
        {
            string mtg_id = Request.QueryString["mtg_id"];
            instanceReportSource.Parameters.Add(new Telerik.Reporting.Parameter("mtg_id", mtg_id));
            instanceReportSource.ReportDocument = new ParticipantsIB2(Convert.ToInt32(mtg_id));
            
        }


        MainViewer.ViewMode = ViewMode.PrintPreview;
        MainViewer.ReportSource = instanceReportSource;
        base.OnLoad(e);
    }
    </script>
    <form id="main" method="post" action="">
        <telerik:ReportViewer ID="MainViewer" Width="100%" Height="800px" runat="server" >
        </telerik:ReportViewer>
    </form>
</body>
</html>
