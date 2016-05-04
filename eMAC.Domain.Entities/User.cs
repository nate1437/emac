using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Domain.Entities
{
    public class User
    {
        public int person_id { get; set; }
        public string name { get; set; }
        public string last_name { get; set; }
        public string first_name { get; set; }
        public string email { get; set; }
        public string org_unit { get; set; }
        public string user_level { get; set; }
    }
}
