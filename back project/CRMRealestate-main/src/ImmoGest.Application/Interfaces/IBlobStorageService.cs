using System.IO;
using System.Threading.Tasks;

namespace ImmoGest.Application.Interfaces;

public interface IBlobStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    Task<Stream> DownloadFileAsync(string fileName);
    Task DeleteFileAsync(string fileName);
    Task<bool> FileExistsAsync(string fileName);
} 