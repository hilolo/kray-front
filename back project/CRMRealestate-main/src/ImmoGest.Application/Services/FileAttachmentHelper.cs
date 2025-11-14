using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ImmoGest.Domain.Entities;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Constants;
using Microsoft.Extensions.Configuration;
using ImmoGest.Domain.Repositories;
using ResultNet;

namespace ImmoGest.Application.Services
{
    /// <summary>
    /// Helper service for common file attachment operations across all services
    /// Provides centralized logic for file upload, download, and deletion
    /// </summary>
    public class FileAttachmentHelper
    {
        private readonly IS3StorageService _s3StorageService;
        private readonly IConfiguration _configuration;
        private readonly IContactRepository _contactRepository;

        public FileAttachmentHelper(
            IS3StorageService s3StorageService,
            IConfiguration configuration,
            IContactRepository contactRepository)
        {
            _s3StorageService = s3StorageService;
            _configuration = configuration;
            _contactRepository = contactRepository;
        }

        #region File Upload Operations

        /// <summary>
        /// Create an attachment entity from base64 content and upload to S3
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="base64Content">Base64 encoded file content</param>
        /// <param name="originalFileName">Original file name</param>
        /// <param name="s3Root">S3 root path (e.g., "contact/Lease", "contact/Reservation")</param>
        /// <param name="entityId">Related entity ID (optional)</param>
        /// <returns>Attachment entity ready to be saved</returns>
        public async Task<Attachment> CreateAttachmentFromBase64Async(
            Guid companyId,
            string base64Content,
            string originalFileName,
            string s3Root,
            Guid? entityId = null)
        {
            if (string.IsNullOrEmpty(base64Content))
                throw new ArgumentException("Base64 content cannot be empty", nameof(base64Content));

            if (string.IsNullOrEmpty(s3Root))
                throw new ArgumentException("S3 root path cannot be empty", nameof(s3Root));

            // Detect file extension from base64
            var fileExtension = GetFileExtensionFromBase64(base64Content);
            var contentType = GetContentTypeFromExtension(fileExtension);

            // Generate unique filename to avoid conflicts
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

            // Generate immutable storage hash for S3 key (never changes)
            var storageHash = Guid.NewGuid().ToString();

            // Build the correct S3 key using BuildAttachmentKey with StorageHash
            // IMPORTANT: We use StorageHash instead of Root for S3 keys to ensure they never change
            // Format: companies/{companyId}/attachments/{storageHash}/{fileName}
            var bucketName = GetBucketName();
            var s3Key = S3PathConstants.BuildAttachmentKey(companyId.ToString(), storageHash, uniqueFileName);
            
            // Upload to S3 using the correct key structure
            await _s3StorageService.UploadAsync(bucketName, s3Key, base64Content);

            // Calculate file size
            var fileBytes = Convert.FromBase64String(base64Content);
            var fileSize = fileBytes.Length;

            // Create attachment entity
            var attachment = new Attachment
            {
                Id = Guid.NewGuid(),
                FileName = uniqueFileName,
                OriginalFileName = originalFileName,
                FileExtension = fileExtension,
                FileSize = fileSize,
                Root = s3Root,  // Keep Root for folder organization and search
                StorageHash = storageHash,  // Use StorageHash for S3 operations
                CompanyId = companyId,
                IsDeleted = false
            };

            return attachment;
        }

        /// <summary>
        /// Upload a file directly from stream to S3 using StorageHash
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="fileStream">File stream</param>
        /// <param name="fileName">File name</param>
        /// <param name="storageHash">Storage hash for S3 key</param>
        /// <returns>Task</returns>
        public async Task UploadFileStreamAsync(
            Guid companyId,
            Stream fileStream,
            string fileName,
            string storageHash)
        {
            var bucketName = GetBucketName();
            var s3Key = S3PathConstants.BuildAttachmentKey(companyId.ToString(), storageHash, fileName);
            await _s3StorageService.UploadFileAsync(bucketName, s3Key, fileStream);
        }

        #endregion
        
        #region S3 Key Building Operations
        
        /// <summary>
        /// Build S3 key for an attachment using StorageHash
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="storageHash">Storage hash from attachment</param>
        /// <param name="fileName">File name</param>
        /// <returns>Full S3 key</returns>
        public string BuildAttachmentS3Key(Guid companyId, string storageHash, string fileName)
        {
            return S3PathConstants.BuildAttachmentKey(companyId.ToString(), storageHash, fileName);
        }
        
        /// <summary>
        /// Build S3 key for a contact avatar using StorageHash (immutable, never changes)
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="avatarStorageHash">Avatar storage hash from contact (immutable identifier)</param>
        /// <param name="fileName">Avatar file name</param>
        /// <returns>Full S3 key</returns>
        public string BuildContactAvatarS3Key(Guid companyId, string avatarStorageHash, string fileName)
        {
            return S3PathConstants.BuildContactAvatarKey(companyId.ToString(), avatarStorageHash, fileName);
        }

        /// <summary>
        /// Build S3 key for a contact avatar using folder name (deprecated - use BuildContactAvatarS3Key with hash instead)
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="contactFolder">Contact folder name</param>
        /// <param name="fileName">Avatar file name</param>
        /// <returns>Full S3 key</returns>
        [Obsolete("Use BuildContactAvatarS3Key with AvatarStorageHash instead. Folder-based keys are deprecated.")]
        public string BuildContactAvatarS3KeyWithFolder(Guid companyId, string contactFolder, string fileName)
        {
            return S3PathConstants.BuildContactAvatarKeyWithFolder(companyId.ToString(), contactFolder, fileName);
        }
        
        #endregion

        #region File Deletion Operations

        /// <summary>
        /// Delete an attachment file from S3
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="fileName">File name</param>
        /// <param name="s3Root">S3 root path</param>
        /// <returns>Task</returns>
        public async Task DeleteAttachmentAsync(
            Guid companyId,
            string fileName,
            string s3Root)
        {
            await _s3StorageService.DeleteCompanyFileAsync(
                companyId.ToString(),
                fileName,
                s3Root
            );
        }

        /// <summary>
        /// Delete an attachment using StorageHash for S3 key
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="attachment">Attachment entity</param>
        /// <returns>Task</returns>
        public async Task DeleteAttachmentByEntityAsync(
            Guid companyId,
            Attachment attachment)
        {
            if (string.IsNullOrEmpty(attachment.StorageHash))
            {
                throw new ArgumentException("Attachment StorageHash cannot be null or empty", nameof(attachment));
            }

            var bucketName = GetBucketName();
            var s3Key = S3PathConstants.BuildAttachmentKey(
                companyId.ToString(),
                attachment.StorageHash,
                attachment.FileName
            );
            await _s3StorageService.DeleteAsync(bucketName, s3Key);
        }

        /// <summary>
        /// Delete avatar file from S3
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="contactFolder">Contact folder name</param>
        /// <param name="avatarFileName">Avatar file name</param>
        /// <returns>Task</returns>
        public async Task DeleteAvatarAsync(
            Guid companyId,
            string contactFolder,
            string avatarFileName)
        {
            var bucketName = GetBucketName();
            var avatarKey = S3PathConstants.BuildContactAvatarKey(
                companyId.ToString(),
                contactFolder,
                avatarFileName
            );
            await _s3StorageService.DeleteAsync(bucketName, avatarKey);
        }

        #endregion

        #region URL Generation Operations

        /// <summary>
        /// Generate a signed URL for an attachment using StorageHash (with caching support)
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="attachment">Attachment entity</param>
        /// <param name="expirationHours">URL expiration in hours (default: 24)</param>
        /// <returns>Signed URL</returns>
        public async Task<string> GenerateAttachmentUrlAsync(
            Guid companyId,
            Attachment attachment,
            int expirationHours = 24)
        {
            if (string.IsNullOrEmpty(attachment.FileName))
                return string.Empty;

            if (string.IsNullOrEmpty(attachment.StorageHash))
            {
                // Fallback for old attachments without StorageHash (should not happen after migration)
                return string.Empty;
            }

            try
            {
                var bucketName = GetBucketName();
                var s3Key = S3PathConstants.BuildAttachmentKey(
                    companyId.ToString(),
                    attachment.StorageHash,
                    attachment.FileName
                );
                
                // Use cached URL if available, otherwise generate new one
                var url = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                    bucketName, 
                    s3Key, 
                    attachment.Url, 
                    attachment.UrlExpiresAt, 
                    expirationHours);

                // If URL was regenerated, update the attachment entity
                if (url != attachment.Url)
                {
                    attachment.Url = url;
                    attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(expirationHours);
                }

                return url;
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// Generate a signed URL for a contact avatar
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="contactFolder">Contact folder name</param>
        /// <param name="avatarFileName">Avatar file name</param>
        /// <param name="expirationHours">URL expiration in hours (default: 24)</param>
        /// <returns>Signed URL</returns>
        public async Task<string> GenerateAvatarUrlAsync(
            Guid companyId,
            string contactFolder,
            string avatarFileName,
            int expirationHours = 24)
        {
            if (string.IsNullOrEmpty(avatarFileName))
                return string.Empty;

            try
            {
                var bucketName = GetBucketName();
                var avatarKey = S3PathConstants.BuildContactAvatarKey(
                    companyId.ToString(),
                    contactFolder,
                    avatarFileName
                );
                // For avatars, we don't have an attachment entity, so pass null for cached URL
                return await _s3StorageService.GetOrGenerateCachedUrlAsync(bucketName, avatarKey, null, null, expirationHours);
            }
            catch (Exception)
            {
                return string.Empty;
            }
        }

        #endregion

        #region File Type Detection

        /// <summary>
        /// Detect file extension from base64 content
        /// Supports images (JPEG, PNG, GIF, WebP) and documents (PDF, DOC, DOCX, XLS, XLSX)
        /// </summary>
        /// <param name="base64String">Base64 encoded string</param>
        /// <returns>File extension with dot prefix (e.g., ".jpg", ".pdf")</returns>
        public string GetFileExtensionFromBase64(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return ".bin";

            // Handle data URI format
            if (base64String.StartsWith("data:"))
            {
                var mimeType = base64String.Substring(5, base64String.IndexOf(';') - 5);
                return GetExtensionFromMimeType(mimeType);
            }

            // Detect from base64 magic bytes
            try
            {
                // Remove data URI prefix if present
                var base64Data = base64String.Contains(",") 
                    ? base64String.Split(',')[^1] 
                    : base64String;

                var bytes = Convert.FromBase64String(base64Data);
                if (bytes.Length >= 4)
                {
                    // Check for common file signatures (magic bytes)
                    if (bytes[0] == 0xFF && bytes[1] == 0xD8) return ".jpg";  // JPEG
                    if (bytes[0] == 0x89 && bytes[1] == 0x50) return ".png";  // PNG
                    if (bytes[0] == 0x47 && bytes[1] == 0x49) return ".gif";  // GIF
                    if (bytes[0] == 0x25 && bytes[1] == 0x50) return ".pdf";  // PDF
                    if (bytes[0] == 0x52 && bytes[1] == 0x49 && bytes[2] == 0x46 && bytes[3] == 0x46) return ".webp"; // WebP
                    if (bytes[0] == 0x50 && bytes[1] == 0x4B) return ".zip";  // ZIP (also DOCX, XLSX, etc.)
                }
            }
            catch
            {
                // Fall through to default
            }

            return ".bin";
        }

        /// <summary>
        /// Get file extension from MIME type
        /// </summary>
        /// <param name="mimeType">MIME type string</param>
        /// <returns>File extension with dot prefix</returns>
        public string GetExtensionFromMimeType(string mimeType)
        {
            return mimeType switch
            {
                "image/jpeg" => ".jpg",
                "image/png" => ".png",
                "image/gif" => ".gif",
                "image/webp" => ".webp",
                "application/pdf" => ".pdf",
                "application/msword" => ".doc",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" => ".docx",
                "application/vnd.ms-excel" => ".xls",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" => ".xlsx",
                "application/zip" => ".zip",
                "text/plain" => ".txt",
                _ => ".bin"
            };
        }

        /// <summary>
        /// Get content type from file extension
        /// </summary>
        /// <param name="extension">File extension with or without dot prefix</param>
        /// <returns>MIME type string</returns>
        public string GetContentTypeFromExtension(string extension)
        {
            var ext = extension.ToLower();
            if (!ext.StartsWith("."))
                ext = "." + ext;

            return ext switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".gif" => "image/gif",
                ".webp" => "image/webp",
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".xls" => "application/vnd.ms-excel",
                ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                ".zip" => "application/zip",
                ".txt" => "text/plain",
                _ => "application/octet-stream"
            };
        }

        #endregion

        #region Validation

        /// <summary>
        /// Validate if a string is valid base64
        /// </summary>
        /// <param name="base64String">String to validate</param>
        /// <returns>True if valid base64, false otherwise</returns>
        public bool IsValidBase64String(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return false;

            try
            {
                // Remove data URI prefix if present
                var base64Data = base64String.Contains(",") 
                    ? base64String.Split(',')[^1] 
                    : base64String;
                    
                Convert.FromBase64String(base64Data);
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Calculate file size from base64 string
        /// </summary>
        /// <param name="base64String">Base64 encoded string</param>
        /// <returns>File size in bytes</returns>
        public long CalculateBase64FileSize(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return 0;

            // Remove data URI prefix if present
            var base64Data = base64String.Contains(",") 
                ? base64String.Split(',')[^1] 
                : base64String;

            // Count padding characters
            int padding = 0;
            if (base64Data.EndsWith("=="))
                padding = 2;
            else if (base64Data.EndsWith("="))
                padding = 1;

            // Calculate size in bytes: (base64Length * 3) / 4 - padding
            long size = ((base64Data.Length * 3) / 4) - padding;
            return size;
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Get S3 bucket name from configuration
        /// </summary>
        /// <returns>Bucket name</returns>
        public string GetBucketName()
        {
            return _configuration["AWS:BucketName"] ?? "immogest-files";
        }

        /// <summary>
        /// Sanitize filename to remove invalid characters
        /// </summary>
        /// <param name="fileName">Original filename</param>
        /// <returns>Sanitized filename</returns>
        public string SanitizeFileName(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return fileName;

            // Get the extension
            var extension = Path.GetExtension(fileName);
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);

            // Replace invalid characters and spaces with underscores
            var invalidChars = Path.GetInvalidFileNameChars();
            foreach (var c in invalidChars)
            {
                nameWithoutExtension = nameWithoutExtension.Replace(c, '_');
            }

            // Replace spaces with underscores
            nameWithoutExtension = nameWithoutExtension.Replace(' ', '_');

            // Remove any other potentially problematic characters
            nameWithoutExtension = System.Text.RegularExpressions.Regex.Replace(nameWithoutExtension, @"[^\w\-]", "_");

            return nameWithoutExtension + extension;
        }

        #endregion

        #region Contact and Owner Name Helpers

        /// <summary>
        /// Get sanitized owner name from contact ID (for Property attachments)
        /// Returns company name for companies, or "FirstName LastName" for individuals
        /// Fallback: "UNKNOWN-OWNER"
        /// </summary>
        /// <param name="contactId">Contact ID</param>
        /// <returns>Sanitized owner name</returns>
        public async Task<string> GetOwnerNameAsync(Guid contactId)
        {
            try
            {
                var contactResult = await _contactRepository.GetByIdAsync(contactId);
                
                if (contactResult.IsSuccess() && contactResult.Data != null)
                {
                    var contact = contactResult.Data;
                    
                    if (contact.IsACompany && !string.IsNullOrEmpty(contact.CompanyName))
                    {
                        return SanitizeFolderName(contact.CompanyName);
                    }
                    
                    var fullName = $"{contact.FirstName} {contact.LastName}".Trim();
                    if (!string.IsNullOrEmpty(fullName))
                    {
                        return SanitizeFolderName(fullName);
                    }
                }
                
                return "UNKNOWN-OWNER";
            }
            catch
            {
                return "UNKNOWN-OWNER";
            }
        }

        /// <summary>
        /// Get sanitized contact folder name from contact properties
        /// Returns company name for companies, or "FirstName-LastName" for individuals
        /// Fallback: "UNNAMED"
        /// </summary>
        /// <param name="firstName">First name</param>
        /// <param name="lastName">Last name</param>
        /// <param name="companyName">Company name (if company)</param>
        /// <param name="isCompany">Whether contact is a company</param>
        /// <param name="contactId">Optional contact ID for fallback (if provided and name is empty)</param>
        /// <returns>Sanitized contact folder name</returns>
        public string GetContactFolderNameFromProperties(
            string firstName, 
            string lastName, 
            string companyName, 
            bool isCompany,
            Guid? contactId = null)
        {
            string contactName;
            if (isCompany && !string.IsNullOrEmpty(companyName))
            {
                contactName = companyName;
            }
            else
            {
                var first = string.IsNullOrWhiteSpace(firstName) ? "" : firstName.Trim();
                var last = string.IsNullOrWhiteSpace(lastName) ? "" : lastName.Trim();
                contactName = string.IsNullOrWhiteSpace(last) ? first : $"{first}-{last}";
            }

            var sanitized = SanitizeFolderName(contactName);
            
            // If empty after sanitization and contactId is provided, use it as fallback
            if ((string.IsNullOrEmpty(sanitized) || sanitized == "UNNAMED") && contactId.HasValue)
            {
                return contactId.Value.ToString();
            }
            
            return sanitized;
        }

        /// <summary>
        /// Sanitize a folder name for S3 storage
        /// Removes invalid characters and normalizes to uppercase with dashes
        /// </summary>
        /// <param name="folderName">Original folder name</param>
        /// <returns>Sanitized folder name</returns>
        private string SanitizeFolderName(string folderName)
        {
            if (string.IsNullOrWhiteSpace(folderName))
                return "UNNAMED";

            // Remove invalid characters and normalize
            var sanitized = folderName.Trim()
                .Replace(" ", "-")
                .Replace("/", "-")
                .Replace("\\", "-")
                .Replace(":", "-")
                .Replace("*", "-")
                .Replace("?", "-")
                .Replace("\"", "-")
                .Replace("<", "-")
                .Replace(">", "-")
                .Replace("|", "-");

            // Remove consecutive dashes
            while (sanitized.Contains("--"))
                sanitized = sanitized.Replace("--", "-");

            // Trim dashes from start and end
            sanitized = sanitized.Trim('-');

            return string.IsNullOrWhiteSpace(sanitized) ? "UNNAMED" : sanitized;
        }

        #endregion
    }
}

