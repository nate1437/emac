using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace eMAC.UI.api
{
    public class ActionHistoryController : ApiController
    {
        private IActionHistoryRepository _actionRepo;

        public ActionHistoryController(IActionHistoryRepository actionRepo)
        {
            this._actionRepo = actionRepo;
        }

        // GET api/meetingreport/5
        [ActionName("GetActionHistory")]
        public async Task<HttpResponseMessage> GetById(int mtgId)
        {            
            var actionsParam = new Dictionary<string, object>();
            var mtgActionsObject = "[]";

            try
            {  
                // get file record
                actionsParam.Add("@mtg_id", mtgId);
                var mtgActionsData = _actionRepo.GetEntity(StoredProcs.MtgActionsGet, actionsParam);

                if (mtgActionsData.Tables[0] != null)
                {
                    mtgActionsObject = JsonConvert.SerializeObject(mtgActionsData.Tables[0]);
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, new { actions_list = mtgActionsObject });
               
            }
            catch (Exception ex)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, ex.GetBaseException().Message);
            }
        }

        // GET api/actionhistory
        public IEnumerable<string> Get()
        {

            return new string[] { "value1", "value2" };
        }

        // GET api/actionhistory/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/actionhistory
        public void Post([FromBody]string value)
        {
        }

        // PUT api/actionhistory/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/actionhistory/5
        public void Delete(int id)
        {
        }
    }
}
