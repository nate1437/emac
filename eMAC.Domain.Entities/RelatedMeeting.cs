using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{
    public class RelatedMeeting
    {
        public int mtg_related_meeting_id { get; set; }
        public int mtg_id { get; set; }
        public string related_meeting_title { get; set; }
        public string recommendation_comment { get; set; }
        public DateTime? completion_date { get; set; }
        public string user_name { get; set; }
    }

    public class NewRelatedMeeting
    {
        public int mtg_id { get; set; }
        public string related_mtg_title { get; set; }
        public string recommendation_comment { get; set; }
        public DateTime? completion_date { get; set; }
        public string created_by { get; set; }
    }

    public class ModRelatedMeeting
    {
        public int related_mtg_id { get; set; }
        public int mtg_id { get; set; }
        public string related_mtg_title { get; set; }
        public string recommendation_comment { get; set; }
        public DateTime? completion_date { get; set; }
        public string updated_by { get; set; }
    }
    
}
