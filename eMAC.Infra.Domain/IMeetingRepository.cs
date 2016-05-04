using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public interface IMeetingRepository : IRepository
    {
        void CreateNewMtg(string procName, Dictionary<string, object> parameters);
    }
}
