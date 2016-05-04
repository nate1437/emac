using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Spire;
using doc = Spire.Doc;
using xls = Spire.Xls;
using System.IO;
using System.ComponentModel;
using eMAC.Infra.Common;
using System.Data;
using Spire.Doc;
using Spire.Doc.Documents;
using System.Text.RegularExpressions;
using Spire.Doc.Fields;

namespace eMAC.Infra.Domain.Helpers
{
    public abstract class SpireHelperBase
    {
        private doc.Document loadedDocument;
        public event PropertyChangedEventHandler PropertyChanged;
        private string docPath;
        private string tempPath;
        private DocTypes docType;
        public string DocPath
        {
            get { return docPath; }
            set { docPath = value; onPropertyChanged("DocPath"); }
        }
        public string TempPath
        {
            get { return tempPath; }
            set { tempPath = value; }
        }
        public DocTypes DocType
        {
            get { return docType; }
            set
            {
                docType = value;
                onPropertyChanged("Doctype");
            }
        }

        public enum DocTypes
        {
            Xlsx = xls.FileFormat.Version2010,
            Docx = doc.FileFormat.Docx
        }

        public SpireHelperBase()
        {
            PropertyChanged += SpireHelperBase_PropertyChanged;
        }

        public doc.Document LoadedDocument 
        {
            get
            {
                return this.loadedDocument;
            }
        }
       
        private void SpireHelperBase_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            try
            {
                if (e.PropertyName.Equals("DocPath") || e.PropertyName.Equals("Doctype"))
                {
                    if (!string.IsNullOrEmpty(this.docPath) && (Enum.IsDefined(typeof(DocTypes), this.docType)))
                    {
                        switch (this.docType)
                        {
                            case DocTypes.Docx:
                                loadedDocument = new doc.Document(this.docPath, doc.FileFormat.Docx);
                                break;
                            case DocTypes.Xlsx:
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }

            finally
            {
                if (!string.IsNullOrEmpty(this.docPath) && (Enum.IsDefined(typeof(DocTypes), this.docType)))
                {
                    var titleStyle = new ParagraphStyle(loadedDocument);
                    titleStyle.Name = "TitleStyle";
                    titleStyle.CharacterFormat.FontName = "Times New Roman";
                    titleStyle.CharacterFormat.FontSize = 11;
                    titleStyle.CharacterFormat.Bold = true;

                    var detailStyle = new ParagraphStyle(loadedDocument);
                    detailStyle.Name = "DetailStyle";
                    detailStyle.CharacterFormat.FontName = "Times New Roman";
                    detailStyle.CharacterFormat.FontSize = 11;
                    detailStyle.CharacterFormat.Bold = false;


                    var detailStyleUnderline = new ParagraphStyle(loadedDocument);
                    detailStyleUnderline.Name = "DetailStyleUnderline";
                    detailStyleUnderline.CharacterFormat.FontName = "Times New Roman";
                    detailStyleUnderline.CharacterFormat.FontSize = 11;
                    detailStyleUnderline.CharacterFormat.Bold = false;
                    detailStyleUnderline.CharacterFormat.UnderlineStyle = UnderlineStyle.Single;

                    loadedDocument.Styles.Add(detailStyleUnderline);
                    loadedDocument.Styles.Add(detailStyle);
                    loadedDocument.Styles.Add(titleStyle);
                }
            }
            
        }
        
        private void onPropertyChanged(string name)
        {
            var handler = PropertyChanged;
            if (handler != null)
            {
                handler(this, new PropertyChangedEventArgs(name));
            }
        }

        public SpireHelperBase(string docPath, DocTypes docType)
        {
            DocType = docType;
            DocPath = docPath;
        }

        protected void LoadData(DataSet ds)
        {
            var meetingDetails = ds.Tables[1].ToDictionary().Select(x =>
                new
                {
                    suffix = "WPR",
                    mtg_no = x["mtg_no"].ToString(),
                    org_unit = x["org_unit"].ToString(),
                    start_date = System.Convert.ToDateTime(x["start_date"]).Year.ToString(),
                    mtg_title = x["mtg_title"].ToString(),
                    venue = string.Format("{0}, {1}", x["venue"].ToString(), x["ctry_name"].ToString()),
                    language = x["working_language"].ToString(),
                    mtg_duration = x["mtg_duration"].ToString()
                }).SingleOrDefault();

            var dataCollection = ds.Tables[0].ToDictionary().Select(x =>
                new
                {
                    capacity = x["capacity"].ToString().Replace("_", " ").Replace("STAFF", "SECRETARIAT").Replace("PARTICIPANT", "PARTICIPANTS").Replace("ADVISER", "ADVISERS"),
                    ctry_name = x["ctry_name"].ToString(),
                    title = x["title"].ToString(),
                    participant_name = x["participant_name"].ToString(),
                    position = x["position"].ToString(),
                    department = x["department"].ToString(),
                    institution = x["institution"].ToString(),
                    supplier_address = string.Format(
                        "{0}{1}{2}{3}",
                        string.IsNullOrEmpty(x["supplier_address_line1"].ToString()) ? " " : x["supplier_address_line1"].ToString().Replace("NULL", "") + " ",
                        string.IsNullOrEmpty(x["supplier_address_line2"].ToString()) ? " " : x["supplier_address_line2"].ToString().Replace("NULL", "") + " ",
                        string.IsNullOrEmpty(x["supplier_address_line3"].ToString()) ? " " : x["supplier_address_line3"].ToString().Replace("NULL", "") + " ",
                        string.IsNullOrEmpty(x["supplier_address_line4"].ToString()) ? " " : x["supplier_address_line4"].ToString().Replace("NULL", "") + " ").Trim(
                         ' '),
                    supplier_city_name = x["supplier_city_name"].ToString().Replace("NULL", ""),
                    supplier_phone_no = x["supplier_phone_no"].ToString().Replace("NULL", ""),
                    supplier_mobile_no = x["supplier_mobile_no"].ToString().Replace("NULL", ""),
                    supplier_email_address = x["supplier_email_address"].ToString().Replace("NULL", "")
                }).ToList();

            foreach (Section a in loadedDocument.Sections)
            {
                foreach (Table t in a.Tables)
                {
                    foreach (TableRow tr in t.Rows)
                    {
                        foreach (TableCell tc in tr.Cells)
                        {
                            if (tc.Paragraphs.Count > 0)
                            {
                                if (tc.Paragraphs[0].Text.Equals("@MeetingTitle"))
                                {
                                    tc.Paragraphs[0].Text = meetingDetails.mtg_title;
                                }
                                if (tc.Paragraphs[0].Text.Equals("@Venue_MeetingDate"))
                                {
                                    tc.Paragraphs[0].Text = string.Format("{0}\n{1}", meetingDetails.venue, meetingDetails.mtg_duration);
                                }
                                if (tc.Paragraphs[0].Text.Equals("@MeetingNo_@DateToday"))
                                {
                                    tc.Paragraphs[0].Text =
                                        string.Format("{0}\n{1}",
                                        string.Join("/", new object[] { meetingDetails.suffix, meetingDetails.org_unit + "(#)", meetingDetails.start_date, "IB", "2" }), DateTime.Now.ToString("dd MMMM yyyy"));
                                }
                                if (tc.Paragraphs[0].Text.Equals("@Language"))
                                {
                                    tc.Paragraphs[0].Text = meetingDetails.language + ".";
                                }
                            }
                        }
                    }
                }
            }

            var outerGroup = dataCollection.Select(x => new { capacity = x.capacity }).Distinct().ToList();
            var itemCount = 1;
            foreach (var i in outerGroup)
            {
                var lastSecion = loadedDocument.LastSection;
                var groupTable = lastSecion.AddTable();
                var outerGroupedData = dataCollection.Where(x => x.capacity == i.capacity).ToList();
                var currentRow = 1;
                groupTable.ResetCells(outerGroupedData.Count() + 1, 2);
                groupTable.ApplyHorizontalMerge(0, 0, 1);
                var groupTitle = groupTable.Rows[0].Cells[0].AddParagraph();
                groupTitle.Format.HorizontalAlignment = HorizontalAlignment.Center;
                groupTitle.ApplyStyle("TitleStyle");
                groupTitle.AppendText(string.Format("{0}. {1}\n", itemCount, i.capacity.ToUpper()));
                var totalWidth = groupTable.Rows[0].Cells[0].Width + groupTable.Rows[0].Cells[1].Width;

                var innerGroup = dataCollection.Where(f => f.capacity == i.capacity).Select(e => new { ctry_name = e.ctry_name }).Distinct().ToList();
                foreach (var j in innerGroup)
                {
                    var innerGroupTitle = groupTable.Rows[currentRow].Cells[0].AddParagraph();
                        innerGroupTitle.Format.HorizontalAlignment = HorizontalAlignment.Left;
                        innerGroupTitle.ApplyStyle("TitleStyle");
                        if (i.capacity.Equals("STAFF") || i.capacity.Equals("SECRETARIAT"))
                        {
                            innerGroupTitle.AppendText(string.Format("WHO {0}", j.ctry_name));
                        }
                        else
                        {
                            innerGroupTitle.AppendText(j.ctry_name.ToUpper());
                        }

                    var data = outerGroupedData.Where(x => x.capacity == i.capacity && x.ctry_name == j.ctry_name).OrderBy(x=> x.ctry_name).ToList();
                    foreach (var k in data)
                    {
                        groupTable.Rows[currentRow].Cells[0].Width = (float)(totalWidth * .4);
                        groupTable.Rows[currentRow].Cells[1].Width = (float)(totalWidth * .6);
                        var cell = groupTable.Rows[currentRow].Cells[1];
                        cell.CellFormat.Paddings.Bottom = 15;

                        if (!string.IsNullOrEmpty(k.participant_name) && !k.participant_name.Equals("NULL"))
                        {
                            var p = cell.AddParagraph();
                            p.AppendText(k.participant_name);
                            p.ApplyStyle("DetailStyle");
                        }
                        if (!string.IsNullOrEmpty(k.position) && 
                            !k.position.Equals("NULL"))
                        {
                            var p = cell.AddParagraph();
                            p.AppendText(new Regex(@"(WP.+\d[0-9].|.WP_+\w.|[0-9]|)").Replace(k.position, ""));
                            p.ApplyStyle("DetailStyle");
                        }
                        if (!string.IsNullOrEmpty(k.department) && !k.department.Equals("NULL"))
                        {
                            var p = cell.AddParagraph();
                            p.AppendText(k.department);
                            p.ApplyStyle("DetailStyle");
                        }
                        if (!string.IsNullOrEmpty(k.institution) && !k.institution.Equals("NULL"))
                        {
                            var p = cell.AddParagraph();
                            p.AppendText(k.institution);
                            p.ApplyStyle("DetailStyle");
                        }
                        if (!string.IsNullOrEmpty(k.supplier_address) || !string.IsNullOrWhiteSpace(k.supplier_address))
                        {
                            var p = cell.AddParagraph();
                            var newText = "";
                            foreach (var text in k.supplier_address.Split(' '))
                            {
                                var o = 0;
                                if (new Regex("th+").IsMatch(text))
                                {
                                    Int32.TryParse(text.Replace("th", ""), out o);
                                    if (o > 0)
                                    {
                                        if (string.IsNullOrEmpty(newText))
                                        {
                                            newText = k.supplier_address.Replace(text, text.Replace("th", "<sup>th</sup>"));
                                        }
                                        else
                                        {
                                            newText = newText.Replace(text, text.Replace("th", "<sup>th</sup>"));
                                        }
                                    }
                                } 
                                if (new Regex("nd+").IsMatch(text))
                                {
                                    Int32.TryParse(text.Replace("nd", ""), out o);
                                    if (o > 0)
                                    {
                                        if (string.IsNullOrEmpty(newText))
                                        {
                                            newText = k.supplier_address.Replace(text, text.Replace("nd", "<sup>nd</sup>"));
                                        }
                                        else
                                        {
                                            newText = newText.Replace(text, text.Replace("nd", "<sup>nd</sup>"));
                                        }
                                    }
                                } 
                                if (new Regex("st+").IsMatch(text))
                                {
                                    Int32.TryParse(text.Replace("st", ""), out o);
                                    if (o > 0)
                                    {
                                        if (string.IsNullOrEmpty(newText))
                                        {
                                            newText = k.supplier_address.Replace(text, text.Replace("st", "<sup>st</sup>"));
                                        }
                                        else
                                        {
                                            newText = newText.Replace(text, text.Replace("st", "<sup>st</sup>"));
                                        }
                                    }
                                }
                            }


                            p.AppendHTML(string.IsNullOrEmpty(newText) ? "<p>" + k.supplier_address + "</p>" : "<p>" + newText + "</p>");
                            foreach(TextRange tr in p.Items)
                            {
                                if (tr.Text.Equals("st") || tr.Text.Equals("nd") || tr.Text.Equals("th"))
                                {
                                    tr.CharacterFormat.SubSuperScript = SubSuperScript.SuperScript;
                                }
                            }
                            p.ApplyStyle("DetailStyle");
                        }
                        if (!string.IsNullOrEmpty(k.supplier_city_name) && !k.supplier_city_name.Equals("NULL"))
                        {
                            var p = cell.AddParagraph();
                            p.AppendText(k.supplier_city_name);
                            p.ApplyStyle("DetailStyleUnderline");
                        }

                        var p1 = cell.AddParagraph();
                        var p2 = cell.AddParagraph();
                        var p3 = cell.AddParagraph();
                        p1.AppendText(string.Format("Tel. No.: {0}", k.supplier_phone_no));
                        p2.AppendText(string.Format("Mobile No.: {0}", k.supplier_mobile_no));
                        p3.AppendText(string.Format("Email: {0}\n", k.supplier_mobile_no));
                        p1.ApplyStyle("DetailStyle");
                        p2.ApplyStyle("DetailStyle");
                        p3.ApplyStyle("DetailStyle");
                        currentRow++;
                    }
                }
                itemCount++;
                lastSecion.AddParagraph().AppendText("\n");
            }
            loadedDocument.SaveToFile(TempPath + @"\temp_ib2.docx", FileFormat.Docx);
        }

        protected byte[] GetFileBytes()
        {
            Stream loadedStream = new FileStream(TempPath + @"\temp_ib2.docx", FileMode.Open, FileAccess.Read);
            //switch (this.docType)
            //{
            //    case DocTypes.Docx:
            //        loadedDocument.SaveToStream(loadedStream, doc.FileFormat.Docx);
            //        break;
            //    case DocTypes.Xlsx:

            //        break;
            //    default:
            //        break;
            //}
            if (loadedStream.Length > 0)
            {
                var bytes = loadedStream.ReadStream();
                File.Delete(TempPath + @"\temp_ib2.docx");
                return bytes;
            }
            return null;
        }


        protected byte[] GetFileBytes(doc.Document docu)
        {
            Stream loadedStream = new FileStream(TempPath + @"\temp_ib2.docx", FileMode.Open, FileAccess.Read); 
            //switch (this.docType)
            //{
            //    case DocTypes.Docx:
            //        docu.SaveToStream(loadedStream, doc.FileFormat.Docx);
            //        break;
            //    case DocTypes.Xlsx:

            //        break;
            //    default:
            //        break;
            //}
            if (loadedStream.Length > 0)
            {
                var bytes = loadedStream.ReadStream();
                File.Delete(TempPath + @"\temp_ib2.docx");
                return bytes;
            }
            return null;
        }

    }
}
