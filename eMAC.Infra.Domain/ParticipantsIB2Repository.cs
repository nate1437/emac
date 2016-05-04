using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Configuration;
using eMAC.Infra.Common;
using System.Linq;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Packaging;
using System.IO;
using eMAC.Infra.Domain.Helpers.ExcelReader;

namespace eMAC.Infra.Domain
{
    public class ParticipantsIB2Repository : RepositoryBase, IParticipantIB2Repository
    {

        public ParticipantsIB2Repository(IEmacDbContext context)
            : base(context)
        {

        }

        public bool ImportEmac(int mtgId, string userName, string password, string domain, string srcPath)
        {
            // prepare database connection
            //var trippleDes = new CryptLib.CryptLib();
            //var encryptConn = connStr;
            //var connString = trippleDes.Decrypt3DES(encryptConn);

            var connStr = base.Context.ConnString;

            var cn = new SqlConnection(connStr);

            try
            {
                // emac configurations
                var sourcePath = srcPath;

                
                var hasImport = false;
                // create the temporary table

                var query = @"create table #tmp_mac
                (
                [Participant Name] Varchar(255),
                [Title] Varchar(255),
                [Last Name] Varchar(255),
                [First Name] Varchar(255),
                [Middle Name] Varchar(255),
                [Gender] Varchar(255),
                [Person Type] Varchar(255),
                [Capacity] Varchar(255),
                [Expertise] Varchar(255),
                [Other Expertise] Varchar(255),
                [Language of Correspondence] Varchar(255),
                [Required to be Paid] Varchar(255),
                [Nominating Country] Varchar(255),
                [Nominating Country Name] Varchar(255),
                [Country] Varchar(255),
                [Country Name] Varchar(255),
                [Minister Flag] Varchar(255),
                [Vip] Varchar(255),
                [Representing Pool] Varchar(255),
                [Org Represented] Varchar(255),
                [Institution] Varchar(255),
                [Position] Varchar(255),
                [Department] Varchar(255),
                [Supplier Number] Varchar(255),
                [Supplier Name] Varchar(255),
                [Address Line1] Varchar(255),
                [Address Line2] Varchar(255),
                [Address Line3] Varchar(255),
                [Address Line4] Varchar(255),
                [Site Postal Code] Varchar(255),
                [Site Phone] Varchar(255),
                [Mobile Phone Number] Varchar(255),
                [Home Phone Number] Varchar(255),
                [Primary Email Address] Varchar(255),
                [Alternate Email Address] Varchar(255),
                [Site City] Varchar(255),
                [Site State] Varchar(255),
                [Site Country] Varchar(255),
                [Web Site] Varchar(255),
                [Notes] Varchar(255),
                [Ta Status] Varchar(255),
                [Claim Status] Varchar(255),
                )";

                cn.Open();

                // create temp table for travel statistics
                using (var cmd = new SqlCommand(query, cn))
                {
                    cmd.CommandType = CommandType.Text;
                    cmd.ExecuteNonQuery();
                }

                #region DELETED BY RAINIER
                /*
                // retrieve Excel data
                var strExcelConn = "Provider=Microsoft.ACE.OLEDB.12.0;"
                    + "Data Source=" + sourcePath + ";"
                    + "Extended Properties='Excel 12.0;'";



                using (var conn = new OleDbConnection(strExcelConn))
                {
                    conn.Open();

                    var sheets = conn.GetOleDbSchemaTable(System.Data.OleDb.OleDbSchemaGuid.Tables, new object[] { null, null, null, "TABLE" });
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = "SELECT * FROM [Report$H3:AW10000]";

                        var adapter = new OleDbDataAdapter(cmd);
                        var ds = new DataSet();
                        adapter.Fill(ds);
                    }
                }

                var connExcel = new OleDbConnection(strExcelConn);
                var cmdExcel = new OleDbCommand
                {
                    Connection = connExcel,
                    CommandText = "SELECT * FROM [Report$H3:AW10000]"
                };

                connExcel.Open();
                // proceed with bulk copy process
                using (var xlreader = cmdExcel.ExecuteReader())
                {

                    try
                    {
                        var columns = new List<string>();

                        for (var i = 0; i < xlreader.FieldCount; i++)
                        {
                            columns.Add(xlreader.GetName(i));
                            if (!query.Contains(xlreader.GetName(i)) || xlreader.FieldCount != 42)
                            {
                                // file did not match or smth.
                                return false;
                            }
                        }

                        using (var bulkCopy = new SqlBulkCopy(cn))
                        {
                            bulkCopy.DestinationTableName = "#tmp_mac";
                            bulkCopy.WriteToServer(xlreader);

                            hasImport = true;
                        }
                    }
                    catch (Exception ex)
                    {
                        // ignored
                        return false;
                    }
                    finally
                    {
                        if (connExcel.State == ConnectionState.Open) connExcel.Close();
                    }

                }
                */
                #endregion

                #region ADDED BY RAINIER 
                

                try
                {
                    var tempDT = new DataTable();
                    var uploadedDT = new ExcelHelper(srcPath, 3).ExcelDataTable;
                    using (var cmd = new SqlCommand("select * from #tmp_mac", cn))
                    {
                        cmd.CommandType = CommandType.Text;
                        var da = new SqlDataAdapter(cmd);
                        da.Fill(tempDT);
                    }

                    if (tempDT.Columns.Count > 0)
                    {
                        foreach (DataRow dr in uploadedDT.Rows)
                        {
                            var newrow = tempDT.NewRow();
                            foreach (System.Data.DataColumn col in tempDT.Columns)
                            {
                                newrow[col.ColumnName] = dr[col.ColumnName];
                            }
                            tempDT.Rows.Add(newrow);
                        }
                    }

                    using (var bulkCopy = new SqlBulkCopy(cn))
                    {
                        bulkCopy.DestinationTableName = "#tmp_mac";
                        bulkCopy.WriteToServer(tempDT);

                        hasImport = true;
                    }
                }
                catch
                {
                    // ignored
                    return false;
                }

                #endregion

                if (hasImport)
                {
                    var trnscntn = cn.BeginTransaction();
                    using (var cmd = new SqlCommand("usp_meeting_participant_import", cn, trnscntn))
                    {
                        try
                        {
                            cmd.CommandType = CommandType.StoredProcedure;
                            cmd.Parameters.Add("@mtg_id", SqlDbType.Int).Value = mtgId;
                            cmd.Parameters.Add("@user_name", SqlDbType.VarChar).Value = userName;
                            cmd.ExecuteNonQuery();

                            trnscntn.Commit();

                        }
                        catch (Exception ex)
                        {
                            trnscntn.Rollback();
                            return false;
                        }
                    }
                }
                else
                {
                    return false;
                }

            }
            catch (Exception)
            {

                return false;
            }
            finally
            {
                if (cn.State == ConnectionState.Open) cn.Close();

            }

            return true;
        }
    }
}
