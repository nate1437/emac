using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;

namespace eMAC.Infra.Domain.Helpers.ExcelReader
{
    public class ExcelHelper : baseExcelHelper
    {

        public ExcelHelper(string excelfile)
        {
            base.ExcelFile = excelfile;
        }

        public ExcelHelper(string excelfile, int headerindex)
            : base(headerindex)
        {
            base.ExcelFile = excelfile;
        }

        public ExcelHelper()
        {

        }

        public override DataTable ReadExcel()
        {
            return base.ExcelDataTable;

        }

        public override DataTable ReadExcel(string excelfile)
        {
            base.ExcelFile = excelfile;
            return base.ExcelDataTable;
        }

        public List<string> TableColumns
        {
            set
            {
                base.tableColumns = value;
            }
        }

        public int HeaderIndex
        {
            set
            {
                base.headerIndex = value;
            }
        }
    }
}
