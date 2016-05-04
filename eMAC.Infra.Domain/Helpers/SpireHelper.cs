using eMAC.Infra.Common;
using Spire.Doc;
using Spire.Doc.Documents;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eMAC.Infra.Domain.Helpers
{
    public class SpireHelper : SpireHelperBase, ISpireHelper
    {
        public string DocPath { set { base.DocPath = value; } }
        public string TempPath { set { base.TempPath = value; } }
        public DocTypes DocType { set { base.DocType = value; } }
        public IParticipantIB2Repository IB2Repo { get; set; }
        public SpireHelper()
        {
        }

        public SpireHelper(string docPath, DocTypes docType)
            : base(docPath, docType)
        {

        }

        public void GenerateIB2Document(int mtg_id)
        {
            base.LoadData(IB2Repo.GetEntity(StoredProcs.ParticipantsIB2View, new Dictionary<string, object>() { { "@mtg_id", mtg_id } }));
            
        }

        public Stream GetDocumentStream()
        {
            Stream docStream = new MemoryStream();
            base.LoadedDocument.SaveToStream(docStream, FileFormat.Docx);
            return docStream;
        }

        public byte[] GetDocumentBytes()
        {
            return base.GetFileBytes();
        }
    }
}
