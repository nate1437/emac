using eMAC.Infra.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public class LibraryRepository : RepositoryBase, ILibraryRepository
    {
        public LibraryRepository(IEmacDbContext context)
           : base(context)
        {

        }
    }
}
