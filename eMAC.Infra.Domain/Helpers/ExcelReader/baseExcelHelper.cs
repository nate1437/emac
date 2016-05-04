using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Spreadsheet;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain.Helpers.ExcelReader
{
    public abstract class baseExcelHelper : INotifyPropertyChanged
    {
        private string excelFile, excelType, exception;
        protected SpreadsheetDocument spreadSheetXLXS;
        private ExcelLibrary.SpreadSheet.Workbook spreadSheetXLS;

        public abstract DataTable ReadExcel();
        public abstract DataTable ReadExcel(string excelfile);
        public event PropertyChangedEventHandler PropertyChanged;
        protected int headerIndex = 0, startRowIndex;
        public List<string> tableColumns;

        public baseExcelHelper()
        {
            PropertyChanged += ExcelHelper_PropertyChanged;
            ExcelDataTable = new DataTable();
            startRowIndex = headerIndex + 1;
        }

        public baseExcelHelper(int headerindex)
        {
            PropertyChanged += ExcelHelper_PropertyChanged;
            ExcelDataTable = new DataTable();
            headerIndex = headerindex;
            startRowIndex = headerindex + 1;
        }
        
        private void ExcelHelper_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName.Equals("ExcelFile"))
            {
                excelType = Path.GetExtension(excelFile);
                spreadSheetXLXS = excelType.Equals(".xlsx") ? SpreadsheetDocument.Open(excelFile, false) : null;
                spreadSheetXLS = excelType.Equals(".xls") ? ExcelLibrary.SpreadSheet.Workbook.Load(excelFile) : null;

                if (spreadSheetXLXS != null)
                {
                    ReadOpenXml(spreadSheetXLXS);
                }
                else if (spreadSheetXLS != null)
                {
                    ReadExcelLibrary(spreadSheetXLS);
                }
            }
        }

        private void ReadOpenXml(SpreadsheetDocument xlsx)
        {
            try
            {
                if (xlsx.WorkbookPart.Workbook.Sheets.Count() > 0)
                {
                    var sheet = xlsx.WorkbookPart.Workbook.Sheets.GetFirstChild<Sheet>();
                    var worksheet = (xlsx.WorkbookPart.GetPartById(sheet.Id.Value) as WorksheetPart).Worksheet;
                    var rows = worksheet.GetFirstChild<SheetData>().Descendants<Row>();
                    if (rows.Count() > 0)
                    {
                        foreach (Row r in rows)
                        {
                            if (r.RowIndex.Value == headerIndex)
                            {
                                foreach (Cell c in r.Descendants<Cell>())
                                {

                                    ExcelDataTable.Columns.Add(getValue(xlsx, c));
                                }
                            }
                            else if (r.RowIndex.Value >= startRowIndex)
                            {
                                ExcelDataTable.Rows.Add();
                                int i = 0;
                                foreach (Cell c in r.Descendants<Cell>())
                                {
                                    ExcelDataTable.Rows[ExcelDataTable.Rows.Count - 1][i] = getValue(xlsx, c);
                                    i++;
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                this.exception = ex.Message;
            }
            finally
            {
                spreadSheetXLXS.Close();
            }
        }

        private void ReadExcelLibrary(ExcelLibrary.SpreadSheet.Workbook xls)
        {
            try
            {
                if (xls.Worksheets.Count() > 0)
                {
                    var sheet = xls.Worksheets[0];
                    var cols = sheet.Cells.LastColIndex;
                    for (var i = 2; i <= sheet.Cells.LastRowIndex; i++)
                    {
                        if (i >= 3)
                            ExcelDataTable.Rows.Add();

                        for (var col = 0; col <= sheet.Cells.LastColIndex; col++)
                        {
                            if (i == headerIndex - 1)
                            {
                                ExcelDataTable.Columns.Add(sheet.Cells[i, col].StringValue);
                            }
                            else if (i >= startRowIndex - 1)
                            {
                                ExcelDataTable.Rows[ExcelDataTable.Rows.Count - 1][col] = sheet.Cells[i, col].StringValue;
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                this.exception = ex.Message;
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

        private string getValue(SpreadsheetDocument excel, Cell c)
        {
            string value = c.CellValue.InnerText;
            if (c.DataType != null && c.DataType.Value == CellValues.SharedString)
            {
                return excel.WorkbookPart.SharedStringTablePart.SharedStringTable.ChildElements.GetItem(int.Parse(value)).InnerText;
            }
            return value;
        }

        public string ExcelFile
        {
            set
            {
                excelFile = value;
                onPropertyChanged("ExcelFile");
            }
        }

        public DataTable ExcelDataTable { get; set; }
        public string Exception { get { return exception; } }
    }

}
