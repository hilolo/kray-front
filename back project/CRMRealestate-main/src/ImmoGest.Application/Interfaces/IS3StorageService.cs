using System;
using System.IO;
using System.Threading.Tasks;

namespace ImmoGest.Application.Interfaces
{
    public interface IS3StorageService
    {
        Task<string> UploadAsync(string bucketName, string key, string base64Content);
        Task<string> UploadFileAsync(string bucketName, string key, Stream fileStream, string contentType = "application/octet-stream");
        Task<Stream> DownloadAsync(string bucketName, string key);
        Task DeleteAsync(string bucketName, string key);
        Task<string> GetFileUrlAsync(string bucketName, string key);
        Task<bool> FileExistsAsync(string bucketName, string key);
        Task<string> GetSignedUrlAsync(string bucketName, string key, int expirationHours = 24);
        Task<string> GetSignedUrlForLocalhostAsync(string bucketName, string key, int expirationHours = 24);
        string GenerateSimplePublicUrl(string bucketName, string key);
        Task<string> GetOrGenerateCachedUrlAsync(string bucketName, string key, string cachedUrl = null, DateTimeOffset? urlExpiresAt = null, int expirationHours = 24);
        Task<bool> ConfigureCorsForLocalhostAsync(string bucketName = null);
        Task<bool> TestConnectionAsync();
        
        // Company-specific file operations
        Task<string> UploadFileForCompanyAsync(string companyId, string fileName, Stream fileStream, string contentType = "application/octet-stream", string subfolder = "");
        Task<string> UploadBase64ForCompanyAsync(string companyId, string fileName, string base64Content, string contentType = "application/octet-stream", string subfolder = "");
        Task<Stream> DownloadCompanyFileAsync(string companyId, string fileName, string subfolder = "");
        Task DeleteCompanyFileAsync(string companyId, string fileName, string subfolder = "");
        Task<string> GetCompanyFileUrlAsync(string companyId, string fileName, string subfolder = "", int expirationHours = 24);
        Task<bool> CompanyFileExistsAsync(string companyId, string fileName, string subfolder = "");
    }
} 