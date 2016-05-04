using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public interface ISender
    {
        void SendEmail(string sendTo, string sendCC, string sendBCC, string subject, string body);
    }
}
