using eMAC.Infra.Common;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public class RepositoryBase : IRepository
    {
        private IEmacDbContext _context;
        public IEmacDbContext Context
        {
            get { return _context; }
            set { _context = value; }
        }

        public RepositoryBase(IEmacDbContext context)
        {
            this.Context = context;
        }

        public DataSet GetEntity(int entityID, string procName)
        {            
            var parameters = new Dictionary<string, object>();
            //throw new NotImplementedException();
            return _context.GetTable(procName, parameters);
        }

        public DataSet GetEntity(string procName, Dictionary<string, object> parameters)
        {
            var param = new List<SqlParameter>();
            foreach (var p in parameters)
            {
                param.Add(new SqlParameter(p.Key, p.Value));
            }

            return _context.ExecuteStoredProcedure(procName, param);
        }

        // insert
        public void SaveEntity(string procName, Dictionary<string, object> parameters)
        {
            var param = new List<SqlParameter>();
            int result = 0;
            foreach (var p in parameters)
            {
                param.Add(new SqlParameter(p.Key, p.Value));
            }
            try
            {

                result = _context.ExecuteSaveProcedure(procName, param);

            }
            catch (Exception e)
            {
                throw e;
            }
        }
        
        // insert
        public int InsertEntity(string procName, Dictionary<string, object> parameters)
        {
            var param = new List<SqlParameter>();
            int result = 0;
            foreach (var p in parameters)
            {
                param.Add(new SqlParameter(p.Key, p.Value));
            }
            try
            {

                result = _context.ExecuteSaveProcedure(procName, param);

                return result;

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        // update
        public void UpdateEntity(string procName, Dictionary<string, object> parameters)
        {
            var param = new List<SqlParameter>();
            foreach (var p in parameters)
            {
                param.Add(new SqlParameter(p.Key, p.Value));
            }
            try
            {

                _context.ExecuteUpdateProcedure(procName, param);

            }
            catch (Exception e)
            {
                throw e;
            }
        }

        // delete
        public void DeleteEntity(string procName, Dictionary<string, object> parameters)
        {
            var param = new List<SqlParameter>();
            foreach (var p in parameters)
            {
                param.Add(new SqlParameter(p.Key, p.Value));
            }
            try
            {

                _context.ExecuteDeleteProcedure(procName, param);

            }
            catch (Exception e)
            {
                throw e;
            }
        }
    }
}
