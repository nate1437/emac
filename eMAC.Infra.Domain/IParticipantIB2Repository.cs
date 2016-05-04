using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public interface IParticipantIB2Repository  : IRepository
    {
        bool ImportEmac(int mtgId, string userName, string password,string domain, string srcPath);
    }
}
