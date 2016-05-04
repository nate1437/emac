using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Data;

namespace eMAC.UI.api
{
    public class ReportController : ApiController
    {
        private IReportRepository _repository;
        public ReportController(IReportRepository repo)
        {
            _repository = repo;
        }

        // GET api/library
        [ActionName("View")]
        public DataSet Get()
        {
            var parameters = new Dictionary<string, object>();
            parameters.Add("@mtg_id", 75);

            return _repository.GetEntity(StoredProcs.PlanningDocumentView, parameters);
        }        
    }
}
