using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public interface IRepository
    {
        DataSet GetEntity(int entityID, string procName);
        DataSet GetEntity(string procName, Dictionary<string, object> parameters);
        void SaveEntity(string procName, Dictionary<string, object> parameters);
        int InsertEntity(string procName, Dictionary<string, object> parameters);
        void UpdateEntity(string procName, Dictionary<string, object> parameters);
        void DeleteEntity(string procName, Dictionary<string, object> parameters);
    }
}
