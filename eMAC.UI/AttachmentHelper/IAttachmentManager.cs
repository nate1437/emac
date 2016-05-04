using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using WebApiAngularJsUploader.Models;

namespace WebApiAngularJsUploader.Attachment
{
    public interface IAttachmentManager
    {
        Task<IEnumerable<AttachmentViewModel>> Get();
        Task<IEnumerable<AttachmentViewModel>> GetById(int mtgId);
        Task<AttachmentActionResult> Delete(string fileName);
        Task<AttachmentActionResult> DeleteById(int mtgId, string fileName);
        Task<AttachmentActionResult> DeleteByMtgNumber(string mtgNumber, string fileName);
        Task<IEnumerable<AttachmentViewModel>> Add(HttpRequestMessage request);
        Task<IEnumerable<AttachmentViewModel>> AddToDir(int mtgId,HttpRequestMessage request);
        Task<IEnumerable<AttachmentViewModel>> AddToDir(string mtgNumber, HttpRequestMessage request);
        bool FileExists(string fileName);
        bool FileExists(int mgId, string fileName);
        bool FileExists(string mtgNumber, string fileName);
        //bool CheckTargetMtgDirectory(int mtgId);
        bool CheckTargetMtgDirectory(string mtgNumber);
        string GetFilePath(int mtgId, string fileName);
        string GetFilePath(string mtgNumber, string fileName);
        FileStream GetAttachmentFileStream(string filePath);
    }
}
