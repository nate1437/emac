using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Common
{
    public interface IEmacDbContext : IDisposable
    {
        int ExecuteSaveProcedure(string procName, List<SqlParameter> parameters);
        void ExecuteUpdateProcedure(string procName, List<SqlParameter> parameters);
        DataSet GetTable(string storedProcedure, Dictionary<string, object> parameters);
        DataSet ExecuteStoredProcedure(string procName, List<SqlParameter> parameters);
        void ExecuteDeleteProcedure(string procName, List<SqlParameter> parameters);
        string ConnString { get; }
    }
}
