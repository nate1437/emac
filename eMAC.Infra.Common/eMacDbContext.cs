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

        private SqlCommand parseParameter(SqlConnection conn, string procName, List<SqlParameter> parameters)
        {
            SqlCommand command = new SqlCommand(procName, conn);
            command.CommandType = CommandType.StoredProcedure;
            if (command.Connection.State != ConnectionState.Open)
            {
                command.Connection.Open();
            }

            SqlCommandBuilder.DeriveParameters(command);

            foreach (SqlParameter param in command.Parameters)
            {
                if (parameters.Where(x=> x.ParameterName == param.ParameterName).ToList().Count > 0)
                {
                    param.Value = parameters.Where(x => x.ParameterName == param.ParameterName).SingleOrDefault().Value;
                }

                if (param.Direction == ParameterDirection.InputOutput)
                {
                    param.Value = 0;
                }
            }
            return command;
        }

        private void closeSqlConnection(ref SqlCommand command)
        {
            if (command.Connection.State == ConnectionState.Open)
            {
                command.Connection.Close();
            }
        }

        public DataSet ExecuteStoredProcedure(string procName, List<SqlParameter> parameters)
        {
            string connectionString = Database.Connection.ConnectionString;
            SqlConnection conn = new SqlConnection(Database.Connection.ConnectionString);
            SqlCommand cmd = parseParameter(conn, procName, parameters);
            DataSet ds = null;

            using (SqlDataAdapter adapter = new SqlDataAdapter(cmd))
            {
                ds = new DataSet();
                adapter.Fill(ds);
                closeSqlConnection(ref cmd);
            }
            return ds;
        }

        // save
        public int ExecuteSaveProcedure(string procName, List<SqlParameter> parameters)
        {
            string connectionString = Database.Connection.ConnectionString;
            SqlConnection conn = new SqlConnection(Database.Connection.ConnectionString);
            SqlCommand cmd = parseParameter(conn, procName, parameters);

            cmd.ExecuteNonQuery();
            closeSqlConnection(ref cmd);
            return Convert.ToInt32(cmd.Parameters["@new_id"].Value);

            //var connectionString = Database.Connection.ConnectionString;
            //using (var conn = new SqlConnection(connectionString))
            //{
            //    var cmd = new SqlCommand(procName, conn);
            //    cmd.CommandType = CommandType.StoredProcedure;
            //    foreach (var param in parameters)
            //    {
            //        cmd.Parameters.Add(param);
            //    }
            //    cmd.Parameters.Add("@new_id", SqlDbType.Int);
            //    cmd.Parameters["@new_id"].Direction = ParameterDirection.Output;
            //    conn.Open();


            //    cmd.ExecuteNonQuery();
            //    var id = Convert.ToInt32(cmd.Parameters["@new_id"].Value);
            //    conn.Close();
            //    return id;
            //}
        }
        // update
        public void ExecuteUpdateProcedure(string procName, List<SqlParameter> parameters)
        {
            string connectionString = Database.Connection.ConnectionString;
            SqlConnection conn = new SqlConnection(Database.Connection.ConnectionString);
            SqlCommand cmd = parseParameter(conn, procName, parameters);

            cmd.ExecuteNonQuery();
            closeSqlConnection(ref cmd);

            //var connectionString = Database.Connection.ConnectionString;
            //using (var conn = new SqlConnection(connectionString))
            //{
            //    var cmd = new SqlCommand(procName, conn);
            //    cmd.CommandType = CommandType.StoredProcedure;
            //    foreach (var param in parameters)
            //    {
            //        cmd.Parameters.Add(param);
            //    }
               
            //    conn.Open();

            //    cmd.ExecuteNonQuery();

            //    conn.Close();               
            //}
        }
        //delete
        public void ExecuteDeleteProcedure(string procName, List<SqlParameter> parameters)
        {
            string connectionString = Database.Connection.ConnectionString;
            SqlConnection conn = new SqlConnection(Database.Connection.ConnectionString);
            SqlCommand cmd = parseParameter(conn, procName, parameters);

            cmd.ExecuteNonQuery();
            closeSqlConnection(ref cmd);
            //var connectionString = Database.Connection.ConnectionString;
            //using (var conn = new SqlConnection(connectionString))
            //{
            //    var cmd = new SqlCommand(procName, conn);
            //    cmd.CommandType = CommandType.StoredProcedure;
            //    foreach (var param in parameters)
            //    {
            //        cmd.Parameters.Add(param);
            //    }

            //    conn.Open();

            //    cmd.ExecuteNonQuery();

            //    conn.Close();
            //}
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
