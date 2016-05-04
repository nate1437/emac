using eMAC.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public interface ITestRepository : IRepository
    {
        User GetUser(int id);
    }
}
