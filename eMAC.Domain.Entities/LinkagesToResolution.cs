using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{
    public class LinkagesToResolution
    {
        public int mtg_resolution_linkage_id { get; set; }
        public int mtg_id { get; set; }
        public string resolution_title { get; set; }
        public string type { get; set; }
        public string user_name { get; set; }
    }

    public class NewLinkagesToResolution
    {
        public int mtg_id { get; set; }
        public string resolution_title { get; set; }
        public string type { get; set; }
        public string created_by { get; set; }
    }

    public class ModLinkagesToResolution
    {
        public int mtg_resolution_linkage_id { get; set; }
        public int mtg_id { get; set; }
        public string resolution_title { get; set; }
        public string type { get; set; }
        public string updated_by { get; set; }
    }
}
