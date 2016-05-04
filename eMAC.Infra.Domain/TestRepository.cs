using eMAC.Domain.Entities;
using eMAC.Infra.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public class TestRepository : RepositoryBase, ITestRepository
    {
        public TestRepository(IEmacDbContext context)
            :base(context)
        {

        }
        public User GetUser(int id)
        {
            //throw new NotImplementedException();


            return null;
        }

        
    }
}
