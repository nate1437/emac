using eMAC.Infra.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public class MeetingRepository : RepositoryBase, IMeetingRepository
    {
        
        public MeetingRepository(IEmacDbContext context)
            : base(context)
        {

        }

        public void CreateNewMtg(string procName, Dictionary<string, object> parameters)
        {           

            throw new NotImplementedException();
        }
         
    }
}
