using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace eMAC.UI.api
{
    public class UsersController : ApiController
    {
        private IUserRepository _repository;

        public UsersController(IUserRepository repository)
        {
            _repository = repository;
            //UserRepository urepo = new UserRepository();
        }

        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        [ActionName("User")]
        public string Get(string value)
        {
            var parameters = new Dictionary<string, object>();  
            var username = JsonConvert.DeserializeObject<string>(value);
            
            parameters.Add("@user_name", username);

            //var result = _repository.GetEntity(StoredProcs.LibUserLevelGet, parameters);
            var result = _repository.GetEntity(StoredProcs.LibUserLevelGet, parameters);
             
            if (result.Tables[0].Rows.Count == 0)
                return UserRoles.Viewer.ToString();

            foreach (DataRow row in result.Tables[0].Rows)
            {
                var item = row["user_level"].ToString();
                var role = Convert.ToInt32(item);
                if (role >= 90)
                    return UserRoles.Admin.ToString();
                else if (role >= 80)
                    return UserRoles.Approver.ToString();
                else if (role >= 70)
                    return UserRoles.User.ToString();
                else
                    return UserRoles.Viewer.ToString();
            }

            return string.Empty;
        }

        [ActionName("GetUser")]
        public async Task<HttpResponseMessage> GetUser(string value)
        {
            var parameters = new Dictionary<string, object>();
            var username = JsonConvert.DeserializeObject<string>(value);
            var userObject = "[]";

            parameters.Add("@user_name", username);

            //var result = _repository.GetEntity(StoredProcs.LibUserLevelGet, parameters);
            var result = _repository.GetEntity(StoredProcs.LibUserGet, parameters);

            if (result.Tables[0].Rows.Count == 0)
                return this.Request.CreateResponse(HttpStatusCode.OK, new { user_object = userObject });

            var userData = JsonConvert.SerializeObject(result.Tables[0]);

            var userDataObject = JsonConvert.DeserializeObject<List<User>>(userData);

            userObject = JsonConvert.SerializeObject(userDataObject);

            return this.Request.CreateResponse(HttpStatusCode.OK, new { user_object = userObject });
        }

        [HttpGet]
        public dynamic GetUserDetails(string user_name)
        {
            try
            {
                var parameters = new Dictionary<string, object>() 
                { 
                    { "@user_name", user_name } 
                };
                var result = _repository.GetEntity(StoredProcs.LibUserDataGet, parameters);
                var table1 = result.Tables[0].ToDictionary().ToList();
                if (result.Tables.Count > 1)
                {
                    var table2 = result.Tables[1].ToDictionary().ToList();
                    return new
                    {
                        op = true,
                        user_details = table2.SingleOrDefault()
                    };
                }
                return new
                {
                    op = true,
                    user_details = table1.SingleOrDefault()
                };
                //else if (table2.Count() > 0)
                //{
                //    return new { op = true, user_details = table2.SingleOrDefault() };
                //}
                //if (result.Tables[0].Rows.Count != 0)
                //{
                //    var userData = JsonConvert.SerializeObject(result.Tables[0]);

                //    var userDataObject = JsonConvert.DeserializeObject<List<User>>(userData);

                //    userObject = JsonConvert.SerializeObject(userDataObject);
                //}
                //else if (result.Tables[1].Rows.Count != 0)
                //{
                //    var userData = JsonConvert.SerializeObject(result.Tables[1]);

                //    var userDataObject = JsonConvert.DeserializeObject<List<User>>(userData);

                //    userObject = JsonConvert.SerializeObject(userDataObject);
                //}
                //else
                //    return this.Request.CreateResponse(HttpStatusCode.OK, new { user_object = userObject });
                

                //return this.Request.CreateResponse(HttpStatusCode.OK, new { user_object = userObject });
            }
            catch (Exception ex)
            {
                return new { op = false, result = ex.Message };
            }
            return new { op = false, result = "No record found." };
        
        }

        [ActionName("GetUserData")]
        public async Task<HttpResponseMessage> GetUserData(string value)
        {
            try
            {
                var parameters = new Dictionary<string, object>();
                var username = JsonConvert.DeserializeObject<string>(value);
                var userObject = "[]";

                parameters.Add("@user_name", username);

                //var result = _repository.GetEntity(StoredProcs.LibUserLevelGet, parameters);
                var result = _repository.GetEntity(StoredProcs.LibUserDataGet, parameters);

                if (result.Tables[0].Rows.Count != 0)
                {
                    var userData = JsonConvert.SerializeObject(result.Tables[0]);

                    var userDataObject = JsonConvert.DeserializeObject<List<User>>(userData);

                    userObject = JsonConvert.SerializeObject(userDataObject);
                }
                else if (result.Tables[1].Rows.Count != 0)
                {
                    var userData = JsonConvert.SerializeObject(result.Tables[1]);

                    var userDataObject = JsonConvert.DeserializeObject<List<User>>(userData);

                    userObject = JsonConvert.SerializeObject(userDataObject);
                }
                else
                    return this.Request.CreateResponse(HttpStatusCode.OK, new { user_object = userObject });
                

                return this.Request.CreateResponse(HttpStatusCode.OK, new { user_object = userObject });
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }

    public enum UserRoles
    {
        Admin,
        Approver,
        User,
        Viewer
    }

    public class User
    {
        public int person_id { get; set; }
        public string name { get; set; }
        public string last_name { get; set; }
        public string first_name { get; set; }
        public string email { get; set; }
        public string org_unit { get; set; }
        public string user_name { get; set; }
        public int user_level { get; set; }
    }
}
