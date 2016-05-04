using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{
    public class ParticipantObject
    {
        public int mtg_participant_ctry_id { get; set; }
        public int mtg_id { get; set; }
        public string ctry_code { get; set; }
        public int no_of_participants { get; set; }
        public string fund_source { get; set; }
        public string user_name { get; set; }
    }

    public class NewParticipantObject
    {
        public int mtg_id { get; set; }
        public string ctry_code { get; set; }
        public int no_of_participants { get; set; }
        public string fund_source { get; set; }
        public string created_by { get; set; }
    }

    public class ModParticipantsObject
    {
        public int mtg_participant_ctry_id { get; set; }
        public int mtg_id { get; set; }
        public string ctry_code { get; set; }
        public int no_of_participants { get; set; }
        public string fund_source { get; set; }
        public string updated_by { get; set; }
    }
}
