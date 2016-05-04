namespace eMAC.UI.Reports
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel;
    using System.Drawing;
    using System.Text;
    using System.Windows.Forms;
    using Telerik.Reporting;
    using Telerik.Reporting.Drawing;
    using System.Linq;
using eMAC.Domain.Entities;
    /// <summary>
    /// Summary description for PBOutcomeDocument.
    /// </summary>
    public partial class PBOutcomeDocument : Telerik.Reporting.Report
    {
        //public Dictionary<string, List<string>> outcomes { get; set; }

        //public string category { get; set; }

        public PBOutcomeDocument()
        {
            InitializeComponent();
        }

        public PBOutcomeDocument(Dictionary<string, Dictionary<string, List<string>>> categories)
        {
            InitializeComponent();

            var template = category1.Value;

            var item = new StringBuilder();
            foreach (var i in categories)
            {
                var container = new Dictionary<string, string>();
                container.Add(GetCategory(i.Key), i.Key);

                var outCome = new StringBuilder();
                foreach (var j in i.Value)
                {
                    outCome.Append(string.Format("{0}<br /><br />", j.Key));
                    if (j.Value.Count() > 0)
                    {
                        outCome.Append(string.Join("<br />", j.Value));
                        if (i.Value.Count > 1)
                        {
                            outCome.Append("<br/><br/>");
                        }
                    }
                }
                container.Add(GetOutcome(i.Key), outCome.ToString());
                SetString(container, ref template);
            }
            cleanTemplate(ref template);
            category1.Value = template;
        }

        public PBOutcomeDocument(Dictionary<string, List<PBOutcome>> categories)
        {
            InitializeComponent();

            var template = category1.Value;

            var item = new StringBuilder();
            foreach (var i in categories)
            {
                var container = new Dictionary<string, string>();
                container.Add(GetCategory(i.Key), i.Key);

                var outCome = new StringBuilder();
                foreach (var j in i.Value)
                {

                    outCome.Append(string.Format("{0}<br /><br />", j.Outcome));
                    if (j.Outputs.Count() > 0)
                    {
                        outCome.Append(string.Join("<br />", j.Outputs.ToArray()));
                    }
                }
                container.Add(GetOutcome(i.Key), outCome.ToString());
                SetString(container, ref template);
            }
            cleanTemplate(ref template);
            category1.Value = template;
        }

        public void cleanTemplate(ref string template)
        {
            var templateContent = template.Split('~');
            var result = new StringBuilder();
            foreach (string s in templateContent)
            {
                if (!(s.IndexOf("categoryOne") > -1 || s.IndexOf("categoryTwo") > -1 || s.IndexOf("categoryThree") > -1 || s.IndexOf("categoryFour") > -1 ||
                    s.IndexOf("categoryFive") > -1 || s.IndexOf("categorySix") > -1))
                {
                    result.Append(s);
                }
            }
            template = result.ToString();
        }


        public void SetString(Dictionary<string, string> values, ref string template)
        {
            foreach (var i in values)
            {
                template = template.Replace(i.Key.ToString(), i.Value);
            }
        }

        public string GetCategory(string s)
        {
            if (s.IndexOf("Category 1") > -1)
            {
                return "@categoryOne";
            }
            if (s.IndexOf("Category 2") > -1)
            {
                return "@categoryTwo";
            }
            if (s.IndexOf("Category 3") > -1)
            {
                return "@categoryThree";
            }
            if (s.IndexOf("Category 4") > -1)
            {
                return "@categoryFour";
            }
            if (s.IndexOf("Category 5") > -1)
            {
                return "@categoryFive";
            }
            if (s.IndexOf("Category 6") > -1)
            {
                return "@categorySix";
            }
            return string.Empty;
        }

        public string GetOutcome(string s)
        {
            if (s.IndexOf("Category 1") > -1)
            {
                return "@categoryOutcomeOne";
            }
            if (s.IndexOf("Category 2") > -1)
            {
                return "@categoryOutcomeTwo";
            }
            if (s.IndexOf("Category 3") > -1)
            {
                return "@categoryOutcomeThree";
            }
            if (s.IndexOf("Category 4") > -1)
            {
                return "@categoryOutcomeFour";
            }
            if (s.IndexOf("Category 5") > -1)
            {
                return "@categoryOutcomeFive";
            }
            if (s.IndexOf("Category 6") > -1)
            {
                return "@categoryOutcomeSix";
            }
            return string.Empty;
        }

        

        /*
        public PBOutcomeDocument(Dictionary<string, List<string>> _outcomes, string _category)
        {
            outcomes = _outcomes;
            category = _category;
            //
            // Required for telerik Reporting designer support
            //
            InitializeComponent();

            //
            // TODO: Add any constructor code after InitializeComponent call
            //
            category1.Value = category;

            foreach (var i in outcomes)
            {
                outcome.Value = (outcome.Value.Length > 0) ? outcome.Value + "<br /><br />" + i.Key : i.Key;

                output.Value = string.Join("<br /><br />", i.Value);
            }

        }*/
    }
}