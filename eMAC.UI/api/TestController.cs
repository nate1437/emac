using eMAC.Infra.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace eMAC.UI.api
{
    public class TestController : ApiController
    {
        private ITestRepository _repository;
        
        public TestController(ITestRepository repository)
        {
            _repository = repository;
        }

        // GET api/test
        public IEnumerable<string> Get()
        {
            //var test = _repository.GetEntity(1);

            return new string[] { "value1", "value2" };
        }

        // GET api/test/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/test
        public void Post([FromBody]string value)
        {
        }

        // PUT api/test/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/test/5
        public void Delete(int id)
        {
        }
    }
}
