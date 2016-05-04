using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{
    public class MeetingActionHistory
    {
        public int mtg_id { get; set; }
        public string action { get; set; }
        public string action_by { get; set; }
        public string remarks { get; set; }
        public string status { get; set; }
    }

    public class NewMeetingActionHistory
    {
        public int mtg_id { get; set; }
        public string action { get; set; }
        public string user_name { get; set; }
        public string remarks { get; set; }
        public string status { get; set; }
    }

    public class MeetingActionHistoryInsert
    {
        public int mtg_id { get; set; }
        public string action { get; set; }
        public string action_by { get; set; }
        public string remarks { get; set; }
    }
}
