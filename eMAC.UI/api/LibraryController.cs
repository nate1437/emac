using eMAC.Infra.Common;
using eMAC.Infra.Domain;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Hosting;
using System.Web.Http;
using System.Xml;
using System.Xml.Linq;

namespace eMAC.UI.api
{
    public class LibraryController : ApiController
    {
        private ILibraryRepository _repository;

        public LibraryController(ILibraryRepository repo)
        {
            _repository = repo;
        }

        // GET api/library
        [ActionName("List")]
        public string Get()
        {
            //(StoredProcedure.SituationUpdList, parameters);
            var parameters = new Dictionary<string, object>();

            var list = _repository.GetEntity(StoredProcs.LibraryDataGet, new Dictionary<string, object>());
            // ctry list
            var ctryList = JsonConvert.SerializeObject(list.Tables[0]);
            // mtg types
            var mtgTypes = JsonConvert.SerializeObject(list.Tables[1]);
            //mtg classifications
            var mtgClass = JsonConvert.SerializeObject(list.Tables[2]);
            // core functions
            var coreFunction = JsonConvert.SerializeObject(list.Tables[3]);
            // year filter value
            var yearFilter = JsonConvert.SerializeObject(list.Tables[4]); //list.Tables[4].Rows.Count > 0 ? JsonConvert.SerializeObject(list.Tables[4]) : JsonConvert.SerializeObject(new Dictionary<string, string>() { { "year_created", DateTime.Now.ToString("yyyy") } });
            // org unit
            var orgUnit = JsonConvert.SerializeObject(list.Tables[5]);
            // officers
            var officer = JsonConvert.SerializeObject(list.Tables[6]);
            // resolution types
            var resolutionType = JsonConvert.SerializeObject(list.Tables[7]);
            // participant funding source
            var participantFundSrc = JsonConvert.SerializeObject(list.Tables[8]);
            // pb categories
            var pbCategories = JsonConvert.SerializeObject(list.Tables[9]);
            // pb outcome
            var pbOutcomes = JsonConvert.SerializeObject(list.Tables[10]);
            // pb output
            var pbOutputs = JsonConvert.SerializeObject(list.Tables[11]);

            var data = new Dictionary<string, string>();
            data.Add("ctryList", ctryList);
            data.Add("mtgTypeList", mtgTypes);
            data.Add("mtgClassList", mtgClass);
            data.Add("coreFunctionList", coreFunction);
            data.Add("yearFilter", yearFilter);
            data.Add("orgUnitList", orgUnit);
            data.Add("officerList", officer);
            data.Add("resolutionTypeList", resolutionType);
            data.Add("participantFundSrcList", participantFundSrc);
            data.Add("pbCategoryList", pbCategories);
            data.Add("pbOutcomeList", pbOutcomes);
            data.Add("pbOutputList", pbOutputs);

            // add xml
            var xmlLocation = string.Format("{0}end_notes_default.xml", HostingEnvironment.MapPath("~/xml/"));
            var xDoc = XElement.Load(xmlLocation);


            data.Add("end_notes_default", JsonConvert.SerializeObject(xDoc.GetDictionaryFromXml("end_note")));
            //data.Add("columns", JsonConvert.SerializeObject(columns));

            return JsonConvert.SerializeObject(data); 
        }

        // GET api/library/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/library
        public void Post([FromBody]string value)
        {
        }

        // PUT api/library/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/library/5
        public void Delete(int id)
        {
        }
    }
}
