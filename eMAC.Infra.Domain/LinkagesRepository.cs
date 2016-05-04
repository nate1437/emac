using eMAC.Infra.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public class LinkagesRepository : RepositoryBase, ILinkagesRepository
    {
        public LinkagesRepository(IEmacDbContext context):
            base(context)
        {

        }
    }
}
