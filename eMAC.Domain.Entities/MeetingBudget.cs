using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{
    public class MeetingBudget
    {
        public int mtg_budget_id { get; set; }
        public int mtg_id { get; set; }
        public string ptaeo { get; set; }
        public string src_of_fund { get; set; }
        public int funds_available { get; set; }
        public int estimated_cost { get; set; }
        public string user_name { get; set; }
    }

    public class NewMeetingBudget
    {
        public int mtg_id { get; set; }
        public string ptaeo { get; set; }
        public string src_of_fund { get; set; }
        public int funds_available { get; set; }
        public int estimated_cost { get; set; }
        public string created_by { get; set; }
    }

    public class ModMeetingBudget
    {
        public int mtg_budget_id { get; set; }
        public int mtg_id { get; set; }
        public string ptaeo { get; set; }
        public string src_of_fund { get; set; }
        public int funds_available { get; set; }
        public int estimated_cost { get; set; }
        public string updated_by { get; set; }
    }
}
