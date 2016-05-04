namespace eMAC.UI.Reports
{
    using eMAC.Infra.Common;
    using eMAC.Infra.Domain;
    using System;
    using System.Collections.Generic;
    using System.ComponentModel;
    using System.Drawing;
    using System.Windows.Forms;
    using Telerik.Reporting;
    using Telerik.Reporting.Drawing;

    /// <summary>
    /// Summary description for ParticipantsIB2.
    /// </summary>
    public partial class ParticipantsIB2 : Telerik.Reporting.Report
    {
        private IEmacDbContext _context;
        private IReportRepository _repository;

        public ParticipantsIB2(int mtg_id)
        {
            //
            // Required for telerik Reporting designer support
            //
            InitializeComponent();

            _context = new eMacDbContext();
            _repository = new ReportRepository(_context);

            var ds = _repository.GetEntity(StoredProcs.ParticipantsIB2View, new Dictionary<string, object>() { { "@mtg_id", mtg_id } });
            table1.DataSource = ds;
            ib2V2.DataSource = ds;
            //
            // TODO: Add any constructor code after InitializeComponent call
            //
        }
    }
}