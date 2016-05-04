namespace eMAC.UI.Reports
{
    partial class ParticipantsIB2
    {
        #region Component Designer generated code
        /// <summary>
        /// Required method for telerik Reporting designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            Telerik.Reporting.TableGroup tableGroup1 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup2 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup3 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup4 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup5 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup6 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup7 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup8 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup9 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup10 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup11 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup12 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup13 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.TableGroup tableGroup14 = new Telerik.Reporting.TableGroup();
            Telerik.Reporting.ReportParameter reportParameter1 = new Telerik.Reporting.ReportParameter();
            Telerik.Reporting.Drawing.StyleRule styleRule1 = new Telerik.Reporting.Drawing.StyleRule();
            this.pageHeaderSection1 = new Telerik.Reporting.PageHeaderSection();
            this.detail = new Telerik.Reporting.DetailSection();
            this.pageFooterSection1 = new Telerik.Reporting.PageFooterSection();
            this.table1 = new Telerik.Reporting.Table();
            this.textBox3 = new Telerik.Reporting.TextBox();
            this.textBox13 = new Telerik.Reporting.TextBox();
            this.htmlTextBox1 = new Telerik.Reporting.HtmlTextBox();
            this.table2 = new Telerik.Reporting.Table();
            this.textBox6 = new Telerik.Reporting.TextBox();
            this.textBox14 = new Telerik.Reporting.TextBox();
            this.ib2V2 = new Telerik.Reporting.Table();
            this.textBox2 = new Telerik.Reporting.TextBox();
            this.textBox1 = new Telerik.Reporting.TextBox();
            this.textBox4 = new Telerik.Reporting.TextBox();
            this.textBox5 = new Telerik.Reporting.TextBox();
            ((System.ComponentModel.ISupportInitialize)(this)).BeginInit();
            // 
            // pageHeaderSection1
            // 
            this.pageHeaderSection1.Height = Telerik.Reporting.Drawing.Unit.Cm(0.13229167461395264D);
            this.pageHeaderSection1.Name = "pageHeaderSection1";
            // 
            // detail
            // 
            this.detail.Height = Telerik.Reporting.Drawing.Unit.Cm(6.7677083015441895D);
            this.detail.Items.AddRange(new Telerik.Reporting.ReportItemBase[] {
            this.table1,
            this.htmlTextBox1,
            this.table2,
            this.ib2V2});
            this.detail.Name = "detail";
            // 
            // pageFooterSection1
            // 
            this.pageFooterSection1.Height = Telerik.Reporting.Drawing.Unit.Cm(0.13229164481163025D);
            this.pageFooterSection1.Name = "pageFooterSection1";
            // 
            // table1
            // 
            this.table1.Body.Columns.Add(new Telerik.Reporting.TableBodyColumn(Telerik.Reporting.Drawing.Unit.Cm(4.8243412971496582D)));
            this.table1.Body.Rows.Add(new Telerik.Reporting.TableBodyRow(Telerik.Reporting.Drawing.Unit.Cm(1.2761112451553345D)));
            this.table1.Body.SetCellContent(0, 0, this.textBox3);
            tableGroup1.Name = "tableGroup";
            this.table1.ColumnGroups.Add(tableGroup1);
            this.table1.Items.AddRange(new Telerik.Reporting.ReportItemBase[] {
            this.textBox3,
            this.textBox13});
            this.table1.Location = new Telerik.Reporting.Drawing.PointU(Telerik.Reporting.Drawing.Unit.Cm(0.15874999761581421D), Telerik.Reporting.Drawing.Unit.Cm(1.7677083015441895D));
            this.table1.Name = "table1";
            tableGroup5.Name = "group";
            tableGroup4.ChildGroups.Add(tableGroup5);
            tableGroup4.Name = "rowGroup1";
            tableGroup3.ChildGroups.Add(tableGroup4);
            tableGroup3.Name = "group8";
            tableGroup3.ReportItem = this.textBox13;
            tableGroup2.ChildGroups.Add(tableGroup3);
            tableGroup2.Groupings.Add(new Telerik.Reporting.Grouping("= Fields.capacity"));
            tableGroup2.Name = "rowGroup";
            tableGroup2.Sortings.Add(new Telerik.Reporting.Sorting("= Fields.capacity", Telerik.Reporting.SortDirection.Asc));
            this.table1.RowGroups.Add(tableGroup2);
            this.table1.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(9.7615299224853516D), Telerik.Reporting.Drawing.Unit.Cm(1.2761112451553345D));
            // 
            // textBox3
            // 
            this.textBox3.Name = "textBox3";
            this.textBox3.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(4.8243417739868164D), Telerik.Reporting.Drawing.Unit.Cm(1.2761112451553345D));
            this.textBox3.Style.BorderStyle.Default = Telerik.Reporting.Drawing.BorderType.Solid;
            this.textBox3.Style.LineWidth = Telerik.Reporting.Drawing.Unit.Pixel(1D);
            this.textBox3.Style.Padding.Bottom = Telerik.Reporting.Drawing.Unit.Point(5D);
            this.textBox3.Style.Padding.Top = Telerik.Reporting.Drawing.Unit.Point(5D);
            this.textBox3.Style.TextAlign = Telerik.Reporting.Drawing.HorizontalAlign.Center;
            this.textBox3.StyleName = "";
            // 
            // textBox13
            // 
            this.textBox13.Name = "textBox13";
            this.textBox13.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(4.9371891021728516D), Telerik.Reporting.Drawing.Unit.Cm(1.2761112451553345D));
            this.textBox13.Style.BorderStyle.Default = Telerik.Reporting.Drawing.BorderType.Solid;
            this.textBox13.Style.BorderStyle.Left = Telerik.Reporting.Drawing.BorderType.Solid;
            this.textBox13.Style.Padding.Bottom = Telerik.Reporting.Drawing.Unit.Point(5D);
            this.textBox13.Style.Padding.Top = Telerik.Reporting.Drawing.Unit.Point(5D);
            this.textBox13.Style.TextAlign = Telerik.Reporting.Drawing.HorizontalAlign.Center;
            this.textBox13.StyleName = "";
            this.textBox13.Value = "=Fields.capacity";
            // 
            // htmlTextBox1
            // 
            this.htmlTextBox1.Location = new Telerik.Reporting.Drawing.PointU(Telerik.Reporting.Drawing.Unit.Cm(0.15874999761581421D), Telerik.Reporting.Drawing.Unit.Cm(0.099999979138374329D));
            this.htmlTextBox1.Name = "htmlTextBox1";
            this.htmlTextBox1.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(12.841251373291016D), Telerik.Reporting.Drawing.Unit.Cm(0.66770833730697632D));
            this.htmlTextBox1.Style.TextAlign = Telerik.Reporting.Drawing.HorizontalAlign.Center;
            this.htmlTextBox1.Style.VerticalAlign = Telerik.Reporting.Drawing.VerticalAlign.Middle;
            this.htmlTextBox1.Value = "Participants IB2";
            // 
            // table2
            // 
            this.table2.Body.Columns.Add(new Telerik.Reporting.TableBodyColumn(Telerik.Reporting.Drawing.Unit.Cm(4.941734790802002D)));
            this.table2.Body.Columns.Add(new Telerik.Reporting.TableBodyColumn(Telerik.Reporting.Drawing.Unit.Cm(4.8180317878723145D)));
            this.table2.Body.Rows.Add(new Telerik.Reporting.TableBodyRow(Telerik.Reporting.Drawing.Unit.Cm(0.83784717321395874D)));
            this.table2.Body.SetCellContent(0, 0, this.textBox6);
            this.table2.Body.SetCellContent(0, 1, this.textBox14);
            tableGroup6.Name = "tableGroup1";
            tableGroup7.Name = "tableGroup2";
            this.table2.ColumnGroups.Add(tableGroup6);
            this.table2.ColumnGroups.Add(tableGroup7);
            this.table2.Items.AddRange(new Telerik.Reporting.ReportItemBase[] {
            this.textBox6,
            this.textBox14});
            this.table2.Location = new Telerik.Reporting.Drawing.PointU(Telerik.Reporting.Drawing.Unit.Cm(0.15874999761581421D), Telerik.Reporting.Drawing.Unit.Cm(0.9002000093460083D));
            this.table2.Name = "table2";
            tableGroup8.Groupings.Add(new Telerik.Reporting.Grouping(null));
            tableGroup8.Name = "detailTableGroup";
            this.table2.RowGroups.Add(tableGroup8);
            this.table2.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(9.7597665786743164D), Telerik.Reporting.Drawing.Unit.Cm(0.83784717321395874D));
            // 
            // textBox6
            // 
            this.textBox6.Name = "textBox6";
            this.textBox6.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(4.941734790802002D), Telerik.Reporting.Drawing.Unit.Cm(0.83784717321395874D));
            this.textBox6.Style.BorderStyle.Default = Telerik.Reporting.Drawing.BorderType.Solid;
            this.textBox6.Style.Padding.Bottom = Telerik.Reporting.Drawing.Unit.Point(5D);
            this.textBox6.Style.Padding.Top = Telerik.Reporting.Drawing.Unit.Point(5D);
            this.textBox6.Style.TextAlign = Telerik.Reporting.Drawing.HorizontalAlign.Center;
            this.textBox6.Style.VerticalAlign = Telerik.Reporting.Drawing.VerticalAlign.Middle;
            this.textBox6.StyleName = "";
            this.textBox6.Value = "Capacity";
            // 
            // textBox14
            // 
            this.textBox14.Name = "textBox14";
            this.textBox14.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(4.8180317878723145D), Telerik.Reporting.Drawing.Unit.Cm(0.83784717321395874D));
            this.textBox14.Style.BorderStyle.Default = Telerik.Reporting.Drawing.BorderType.Solid;
            this.textBox14.Style.LineWidth = Telerik.Reporting.Drawing.Unit.Pixel(1D);
            this.textBox14.Style.Padding.Bottom = Telerik.Reporting.Drawing.Unit.Point(5D);
            this.textBox14.Style.Padding.Top = Telerik.Reporting.Drawing.Unit.Point(5D);
            this.textBox14.Style.TextAlign = Telerik.Reporting.Drawing.HorizontalAlign.Center;
            this.textBox14.StyleName = "";
            this.textBox14.Value = "Participant name";
            // 
            // ib2V2
            // 
            this.ib2V2.Body.Columns.Add(new Telerik.Reporting.TableBodyColumn(Telerik.Reporting.Drawing.Unit.Cm(5.7679123878479D)));
            this.ib2V2.Body.Rows.Add(new Telerik.Reporting.TableBodyRow(Telerik.Reporting.Drawing.Unit.Cm(0.60854178667068481D)));
            this.ib2V2.Body.Rows.Add(new Telerik.Reporting.TableBodyRow(Telerik.Reporting.Drawing.Unit.Cm(1.7052391767501831D)));
            this.ib2V2.Body.SetCellContent(0, 0, this.textBox2);
            this.ib2V2.Body.SetCellContent(1, 0, this.textBox4);
            tableGroup9.Name = "tableGroup3";
            this.ib2V2.ColumnGroups.Add(tableGroup9);
            this.ib2V2.Items.AddRange(new Telerik.Reporting.ReportItemBase[] {
            this.textBox2,
            this.textBox4,
            this.textBox1,
            this.textBox5});
            this.ib2V2.Location = new Telerik.Reporting.Drawing.PointU(Telerik.Reporting.Drawing.Unit.Cm(0.15874999761581421D), Telerik.Reporting.Drawing.Unit.Cm(3.6677083969116211D));
            this.ib2V2.Name = "ib2V2";
            tableGroup12.Name = "detailTableGroup1";
            tableGroup11.ChildGroups.Add(tableGroup12);
            tableGroup11.Name = "group2";
            tableGroup11.ReportItem = this.textBox1;
            tableGroup14.Name = "group1";
            tableGroup13.ChildGroups.Add(tableGroup14);
            tableGroup13.Name = "group3";
            tableGroup13.ReportItem = this.textBox5;
            tableGroup10.ChildGroups.Add(tableGroup11);
            tableGroup10.ChildGroups.Add(tableGroup13);
            tableGroup10.Groupings.Add(new Telerik.Reporting.Grouping("= Fields.capacity"));
            tableGroup10.Name = "rowGroup2";
            tableGroup10.Sortings.Add(new Telerik.Reporting.Sorting("= Fields.capacity", Telerik.Reporting.SortDirection.Asc));
            this.ib2V2.RowGroups.Add(tableGroup10);
            this.ib2V2.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(12.68916130065918D), Telerik.Reporting.Drawing.Unit.Cm(2.3137810230255127D));
            // 
            // textBox2
            // 
            this.textBox2.Name = "textBox2";
            this.textBox2.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(5.7679166793823242D), Telerik.Reporting.Drawing.Unit.Cm(0.60854166746139526D));
            // 
            // textBox1
            // 
            this.textBox1.Name = "textBox1";
            this.textBox1.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(6.9212493896484375D), Telerik.Reporting.Drawing.Unit.Cm(0.60854172706604D));
            this.textBox1.StyleName = "";
            this.textBox1.Value = "= Fields.capacity";
            // 
            // textBox4
            // 
            this.textBox4.Name = "textBox4";
            this.textBox4.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(5.7679123878479D), Telerik.Reporting.Drawing.Unit.Cm(1.7052391767501831D));
            this.textBox4.StyleName = "";
            // 
            // textBox5
            // 
            this.textBox5.Location = new Telerik.Reporting.Drawing.PointU(Telerik.Reporting.Drawing.Unit.Cm(-1.4587498903274536D), Telerik.Reporting.Drawing.Unit.Cm(-5.1000003814697266D));
            this.textBox5.Name = "textBox5";
            this.textBox5.Size = new Telerik.Reporting.Drawing.SizeU(Telerik.Reporting.Drawing.Unit.Cm(6.9212493896484375D), Telerik.Reporting.Drawing.Unit.Cm(1.7052391767501831D));
            this.textBox5.StyleName = "";
            // 
            // ParticipantsIB2
            // 
            this.Items.AddRange(new Telerik.Reporting.ReportItemBase[] {
            this.pageHeaderSection1,
            this.detail,
            this.pageFooterSection1});
            this.Name = "ParticipantsIB2";
            this.PageSettings.Landscape = false;
            this.PageSettings.Margins = new Telerik.Reporting.Drawing.MarginsU(Telerik.Reporting.Drawing.Unit.Mm(25.399999618530273D), Telerik.Reporting.Drawing.Unit.Mm(25.399999618530273D), Telerik.Reporting.Drawing.Unit.Mm(25.399999618530273D), Telerik.Reporting.Drawing.Unit.Mm(25.399999618530273D));
            this.PageSettings.PaperKind = System.Drawing.Printing.PaperKind.A4;
            reportParameter1.Name = "mtg_id";
            reportParameter1.Type = Telerik.Reporting.ReportParameterType.Integer;
            this.ReportParameters.Add(reportParameter1);
            styleRule1.Selectors.AddRange(new Telerik.Reporting.Drawing.ISelector[] {
            new Telerik.Reporting.Drawing.TypeSelector(typeof(Telerik.Reporting.TextItemBase)),
            new Telerik.Reporting.Drawing.TypeSelector(typeof(Telerik.Reporting.HtmlTextBox))});
            styleRule1.Style.Padding.Left = Telerik.Reporting.Drawing.Unit.Point(2D);
            styleRule1.Style.Padding.Right = Telerik.Reporting.Drawing.Unit.Point(2D);
            this.StyleSheet.AddRange(new Telerik.Reporting.Drawing.StyleRule[] {
            styleRule1});
            this.Width = Telerik.Reporting.Drawing.Unit.Cm(15.260417938232422D);
            ((System.ComponentModel.ISupportInitialize)(this)).EndInit();

        }
        #endregion

        private Telerik.Reporting.PageHeaderSection pageHeaderSection1;
        private Telerik.Reporting.DetailSection detail;
        private Telerik.Reporting.PageFooterSection pageFooterSection1;
        private Telerik.Reporting.Table table1;
        private Telerik.Reporting.TextBox textBox3;
        private Telerik.Reporting.TextBox textBox13;
        private Telerik.Reporting.HtmlTextBox htmlTextBox1;
        private Telerik.Reporting.Table table2;
        private Telerik.Reporting.TextBox textBox6;
        private Telerik.Reporting.TextBox textBox14;
        private Telerik.Reporting.Table ib2V2;
        private Telerik.Reporting.TextBox textBox2;
        private Telerik.Reporting.TextBox textBox1;
        private Telerik.Reporting.TextBox textBox4;
        private Telerik.Reporting.TextBox textBox5;
    }
}