using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain
{
    public interface ISpireHelper
    {
        void GenerateIB2Document(int mtg_id);
        byte[] GetDocumentBytes();
        Stream GetDocumentStream();
        IParticipantIB2Repository IB2Repo { get; set; }
        string DocPath { set; }
        string TempPath { set; }
        eMAC.Infra.Domain.Helpers.SpireHelperBase.DocTypes DocType { set; }
    }
}
