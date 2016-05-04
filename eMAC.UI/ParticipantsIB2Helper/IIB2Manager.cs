using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using WebApiAngularJsUploader.Models;

namespace WebApiAngularJsUploader.Participants
{
    public interface IIB2Manager
    {
        //Task<IEnumerable<MeetingReportViewModel>> Get();
        Task<IEnumerable<MeetingReportViewModel>> GetById(int mtgId);
        Task<IB2ActionResult> DeleteById(int mtgId, string fileName);
        Task<IEnumerable<IB2ViewModel>> AddToDir(string mtgNumber, int mtgId, string fileName, string userName, HttpRequestMessage request);     
        bool FileExists(int mgId, string fileName);
        bool CheckTargetMtgDirectory(string mtgNumber);
        //bool CheckTargetMtgDirectory(int mtgId);
        string GetFilePath(int mtgId, string fileName);
        FileStream GetMtgReportFileStream(string filePath);
    }
}
