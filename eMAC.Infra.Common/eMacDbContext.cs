using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Common
{
    public class eMacDbContext : DbContext, IEmacDbContext
    {
        private string _connString;
        public string ConnString
        {
            get { return _connString; }
            set { _connString = value; }
        }

        public eMacDbContext()
        {
            Database.SetInitializer<eMacDbContext>(null);
            SqlConnectionStringBuilder connStringBuilder =new SqlConnectionStringBuilder( new CryptLib.CryptLib().Decrypt3DES(ConfigurationManager.ConnectionStrings["EmacConnection"].ConnectionString));
            Database.Connection.ConnectionString = connStringBuilder.ConnectionString;
            ConnString = connStringBuilder.ConnectionString;
        }

        public DataSet ExecuteStoredProcedure(string procName, List<SqlParameter> parameters)
        {
            var connectionString = Database.Connection.ConnectionString;
            var ds = new DataSet();

            using (var conn = new SqlConnection(connectionString))
            {
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = procName;
                    cmd.CommandType = CommandType.StoredProcedure;
                    foreach (var parameter in parameters)
                    {
                        cmd.Parameters.Add(parameter);
                    }

                    using (var adapter = new SqlDataAdapter(cmd))
                    {
                        adapter.Fill(ds);
                    }
                }
            }

            return ds;
        }

        // save
        public int ExecuteSaveProcedure(string procName, List<SqlParameter> parameters)
        {
            var connectionString = Database.Connection.ConnectionString;
            using (var conn = new SqlConnection(connectionString))
            {
                var cmd = new SqlCommand(procName, conn);
                cmd.CommandType = CommandType.StoredProcedure;
                foreach (var param in parameters)
                {
                    cmd.Parameters.Add(param);
                }
                cmd.Parameters.Add("@new_id", SqlDbType.Int);
                cmd.Parameters["@new_id"].Direction = ParameterDirection.Output;
                conn.Open();


                cmd.ExecuteNonQuery();
                var id = Convert.ToInt32(cmd.Parameters["@new_id"].Value);
                conn.Close();
                return id;
            }
        }
        // update
        public void ExecuteUpdateProcedure(string procName, List<SqlParameter> parameters)
        {
            var connectionString = Database.Connection.ConnectionString;
            using (var conn = new SqlConnection(connectionString))
            {
                var cmd = new SqlCommand(procName, conn);
                cmd.CommandType = CommandType.StoredProcedure;
                foreach (var param in parameters)
                {
                    cmd.Parameters.Add(param);
                }
               
                conn.Open();

                cmd.ExecuteNonQuery();

                conn.Close();               
            }
        }
        //delete
        public void ExecuteDeleteProcedure(string procName, List<SqlParameter> parameters)
        {
            var connectionString = Database.Connection.ConnectionString;
            using (var conn = new SqlConnection(connectionString))
            {
                var cmd = new SqlCommand(procName, conn);
                cmd.CommandType = CommandType.StoredProcedure;
                foreach (var param in parameters)
                {
                    cmd.Parameters.Add(param);
                }

                conn.Open();

                cmd.ExecuteNonQuery();

                conn.Close();
            }
        }

        public DataSet GetTable(string storedProcedure, Dictionary<string, object> parameters)
        {
            var connectionString = Database.Connection.ConnectionString;
            var ds = new DataSet();

            using (var conn = new SqlConnection(connectionString))
            {
                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = storedProcedure;
                    cmd.CommandType = CommandType.StoredProcedure;
                    foreach (var parameter in parameters)
                    {
                        cmd.Parameters.Add(parameter);
                    }

                    using (var adapter = new SqlDataAdapter(cmd))
                    {
                        adapter.Fill(ds);
                    }
                }
            }

            return ds;
        }
    }
}
