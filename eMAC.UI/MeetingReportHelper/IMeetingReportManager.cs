using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using WebApiAngularJsUploader.Models;

namespace WebApiAngularJsUploader.MeetingReport
{
    public interface IMeetingReportManager
    {
        //Task<IEnumerable<MeetingReportViewModel>> Get();
        Task<IEnumerable<MeetingReportViewModel>> GetById(int mtgId);
        Task<MeetingReportActionResult> DeleteById(int mtgId, string fileName);
        Task<MeetingReportActionResult> DeleteByMtgNumber(string mtgNumber, string fileName);
        Task<IEnumerable<MeetingReportViewModel>> AddToDir(int mtgId, string fileName, HttpRequestMessage request);
        Task<IEnumerable<MeetingReportViewModel>> AddToDirByMtgNumber(string mtgNumber, string fileName, HttpRequestMessage request); 
        bool FileExists(int mgId, string fileName);
        bool FileExists(string mtgNumber, string fileName);
        bool CheckTargetMtgDirectory(int mtgId);
        bool CheckTargetMtgDirectory(string mtgNumber);
        string GetFilePath(int mtgId, string fileName);
        string GetFilePath(string mtgNumber, string fileName);
        FileStream GetMtgReportFileStream(string filePath);
    }
}
