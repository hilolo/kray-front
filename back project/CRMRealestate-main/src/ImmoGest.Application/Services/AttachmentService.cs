using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Auth.Interfaces;
using ImmoGest.Domain.Constants;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ResultNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using ISession = ImmoGest.Domain.Auth.Interfaces.ISession;

namespace ImmoGest.Application.Services
{
    public class AttachmentService : DataServiceBase<Attachment>, IAttachmentService
    {
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IMapper _mapper;
        private readonly IS3StorageService _s3StorageService;
        private readonly ISession _session;
        private readonly IConfiguration _configuration;

        public AttachmentService(
            IMapper mapper, 
            IAttachmentRepository attachmentRepository,
            IS3StorageService s3StorageService,
            ISession session,
            IConfiguration configuration)
            : base(mapper, attachmentRepository)
        {
            _attachmentRepository = attachmentRepository;
            _mapper = mapper;
            _s3StorageService = s3StorageService;
            _session = session;
            _configuration = configuration;
        }

        public async Task<Result<FileManagerResponseDto>> GetFileManagerItemsAsync(string root = null, string searchTerm = null)
        {
            try
            {
                // Get all attachments from database filtered by company
                var attachmentsResult = await _attachmentRepository.GetAllAsync();
                if (attachmentsResult.IsFailure())
                {
                    return Result.Failure<FileManagerResponseDto>();
                }

                // Filter by company ID
                var allAttachments = attachmentsResult.Data
                    .Where(a => a.CompanyId == _session.CompanyId)
                    .ToList();

                // If search term is provided, filter attachments and return only files (no folders)
                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    var searchUpper = searchTerm.ToUpper();
                    var searchResults = allAttachments
                        .Where(a => !string.IsNullOrEmpty(a.SearchTerms) && 
                                    a.SearchTerms.Contains(searchUpper))
                        .ToList();

                    var searchFiles = new List<FileManagerItemDto>();
                    foreach (var attachment in searchResults)
                    {
                        searchFiles.Add(await MapAttachmentToFileManagerItemAsync(attachment));
                    }

                    // Sort files alphabetically
                    searchFiles = searchFiles.OrderBy(f => f.Name).ToList();

                    var searchResponse = new FileManagerResponseDto
                    {
                        Folders = new List<FileManagerItemDto>(), // No folders in search results
                        Files = searchFiles,
                        Path = new List<FileManagerItemDto>()
                    };

                    return Result.Success(searchResponse);
                }

                // Use root as root path directly
                string rootPath = root;

                // Build nested folder structure from root paths
                var folders = new List<FileManagerItemDto>();
                var files = new List<FileManagerItemDto>();
                var path = new List<FileManagerItemDto>();

                // Process root level (when rootPath is null)
                if (string.IsNullOrEmpty(rootPath))
                {
                    // Group attachments by their root paths (excluding root="/")
                    var attachmentsByRoot = allAttachments
                        .Where(a => !string.IsNullOrEmpty(a.Root) && a.Root != "/")
                        .GroupBy(a => a.Root)
                        .ToList();

                    // Create folders from first-level roots
                    var firstLevelFolders = new HashSet<string>();
                    foreach (var group in attachmentsByRoot)
                    {
                        var groupRootPath = group.Key;
                        var parts = groupRootPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
                        
                        if (parts.Length > 0)
                        {
                            var firstPart = parts[0];
                            if (!firstLevelFolders.Contains(firstPart))
                            {
                                firstLevelFolders.Add(firstPart);
                                // Count all attachments that belong to this folder (including subfolders)
                                var folderAttachments = allAttachments.Where(a => 
                                    a.Root != null && a.Root.StartsWith(firstPart + "/")).ToList();
                                
                                folders.Add(new FileManagerItemDto
                                {
                                    Id = firstPart,
                                    FolderId = null,
                                    Name = firstPart,
                                    CreatedAt = folderAttachments.Any() 
                                        ? folderAttachments.Min(a => a.CreatedOn).ToString("dd MMMM yyyy")
                                        : DateTimeOffset.UtcNow.ToString("dd MMMM yyyy"),
                                    ModifiedAt = folderAttachments.Any() 
                                        ? folderAttachments.Max(a => a.LastModifiedOn ?? a.CreatedOn).ToString("dd MMMM yyyy")
                                        : DateTimeOffset.UtcNow.ToString("dd MMMM yyyy"),
                                    Size = FormatFileSize(folderAttachments.Sum(a => a.FileSize)),
                                    Type = "folder",
                                    Contents = $"{folderAttachments.Count} fichiers",
                                    Description = null
                                });
                            }
                        }
                    }
                    
                    // Add files that have root="/" or no root
                    var rootFiles = allAttachments.Where(a => string.IsNullOrEmpty(a.Root) || a.Root == "/").ToList();
                    foreach (var attachment in rootFiles)
                    {
                        files.Add(await MapAttachmentToFileManagerItemAsync(attachment));
                    }
                }
                else
                {
                    // Process a specific folder (when rootPath is provided)
                    // Build path
                    BuildPath(rootPath, path);
                    
                    // Get files directly in this folder (where Root equals rootPath exactly)
                    var directFiles = allAttachments.Where(a => 
                        a.Root == rootPath
                    ).ToList();
                    
                    // Add direct files to the files list
                    foreach (var attachment in directFiles)
                    {
                        files.Add(await MapAttachmentToFileManagerItemAsync(attachment));
                    }
                    
                    // Get files and subfolders in subfolders (where Root starts with rootPath + "/")
                    var matchingAttachments = allAttachments.Where(a => 
                        a.Root != null && a.Root.StartsWith(rootPath + "/")
                    ).ToList();
                        
                        // Group by next level
                        var folderAttachmentsMap = new Dictionary<string, List<Attachment>>();
                        
                        foreach (var attachment in matchingAttachments)
                        {
                            var relativePath = attachment.Root.Substring(rootPath.Length + 1);
                            var parts = relativePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
                            
                            if (parts.Length >= 1)
                            {
                                // First part is the next level folder name
                                var nextPart = parts[0];
                                
                                if (!folderAttachmentsMap.ContainsKey(nextPart))
                                {
                                    folderAttachmentsMap[nextPart] = new List<Attachment>();
                                }
                                folderAttachmentsMap[nextPart].Add(attachment);
                            }
                        }
                        
                        // Create folders for each next level
                        foreach (var kvp in folderAttachmentsMap)
                        {
                            var folderName = kvp.Key;
                            var folderAttachments = kvp.Value;
                            var fullPath = rootPath + "/" + folderName;
                            
                            folders.Add(new FileManagerItemDto
                            {
                                Id = fullPath,
                                FolderId = rootPath,
                                Name = folderName,
                                CreatedAt = folderAttachments.Any() 
                                    ? folderAttachments.Min(a => a.CreatedOn).ToString("dd MMMM yyyy")
                                    : DateTimeOffset.UtcNow.ToString("dd MMMM yyyy"),
                                ModifiedAt = folderAttachments.Any() 
                                    ? folderAttachments.Max(a => a.LastModifiedOn ?? a.CreatedOn).ToString("dd MMMM yyyy")
                                    : DateTimeOffset.UtcNow.ToString("dd MMMM yyyy"),
                                Size = FormatFileSize(folderAttachments.Sum(a => a.FileSize)),
                                Type = "folder",
                                Contents = $"{folderAttachments.Count} fichiers",
                                Description = null
                            });
                        }
                }

                // Sort folders and files alphabetically
                folders = folders.OrderBy(f => f.Name).ToList();
                files = files.OrderBy(f => f.Name).ToList();

                var response = new FileManagerResponseDto
                {
                    Folders = folders,
                    Files = files,
                    Path = path
                };

                return Result.Success(response);
            }
            catch (Exception ex)
            {
                return Result.Failure<FileManagerResponseDto>();
            }
        }

        private async Task<FileManagerItemDto> MapAttachmentToFileManagerItemAsync(Attachment attachment)
        {
            // Generate URL for the attachment
            var url = await GenerateAttachmentUrlAsync(attachment);
            
            return new FileManagerItemDto
            {
                Id = attachment.Id.ToString(),
                FolderId = attachment.Root,
                Name = attachment.OriginalFileName,
                CreatedAt = attachment.CreatedOn.ToString("dd MMMM yyyy"),
                ModifiedAt = null,
                Size = FormatFileSize(attachment.FileSize),
                Type = GetFileTypeFromExtension(attachment.FileExtension),
                Contents = null,
                Description = null,
                Url = url
            };
        }

        private async Task<string> GenerateAttachmentUrlAsync(Attachment attachment)
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
                
                // Use StorageHash for S3 key generation (immutable, never changes)
                var key = S3PathConstants.BuildAttachmentKey(
                    _session.CompanyId.ToString(),
                    attachment.StorageHash,
                    attachment.FileName
                );

                // Use cached URL if available, otherwise generate new one
                var url = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                    bucketName, 
                    key, 
                    attachment.Url, 
                    attachment.UrlExpiresAt, 
                    24);

                // If URL was regenerated, update the attachment entity
                if (url != attachment.Url)
                {
                    attachment.Url = url;
                    attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                    
                    // Update the attachment in database
                    await _attachmentRepository.Update(attachment);
                }

                return url;
            }
            catch
            {
                // Silently return empty string to prevent exposing internal details
                return string.Empty;
            }
        }

        private string GetBucketName()
        {
            return _configuration["AWS:BucketName"] ?? "immogest-files";
        }

        private void BuildPath(string folderPath, List<FileManagerItemDto> path)
        {
            if (string.IsNullOrEmpty(folderPath))
                return;

            var parts = folderPath.Split('/', StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < parts.Length; i++)
            {
                var partialPath = string.Join("/", parts.Take(i + 1));
                var parentPath = i > 0 ? string.Join("/", parts.Take(i)) : null;
                
                path.Add(new FileManagerItemDto
                {
                    Id = partialPath,
                    FolderId = parentPath,
                    Name = parts[i],
                    Type = "folder"
                });
            }
        }

        private string FormatFileSize(long bytes)
        {
            if (bytes < 1024)
                return $"{bytes} B";
            if (bytes < 1024 * 1024)
                return $"{bytes / 1024.0:F1} KB";
            if (bytes < 1024 * 1024 * 1024)
                return $"{bytes / (1024.0 * 1024.0):F1} MB";
            return $"{bytes / (1024.0 * 1024.0 * 1024.0):F1} GB";
        }

        private string GetFileTypeFromExtension(string extension)
        {
            if (string.IsNullOrEmpty(extension))
                return "file";

            var ext = extension.ToLower().TrimStart('.');
            
            switch (ext)
            {
                case "pdf":
                    return "PDF";
                case "doc":
                case "docx":
                    return "DOC";
                case "xls":
                case "xlsx":
                    return "XLS";
                case "jpg":
                case "jpeg":
                    return "JPG";
                case "png":
                    return "PNG";
                case "gif":
                    return "GIF";
                case "txt":
                    return "TXT";
                default:
                    return ext.ToUpper();
            }
        }

        public async Task<Result> UploadFilesAsync(FileUploadRequestDto request)
        {
            try
            {
                if (request.Files == null || request.Files.Count == 0)
                {
                    return Result.Failure().WithMessage("No files provided");
                }

                var bucketName = GetBucketName();
                var uploadedFiles = new List<Attachment>();

                foreach (var fileDto in request.Files)
                {
                    try
                    {
                        // Convert base64 to bytes
                        var fileBytes = Convert.FromBase64String(fileDto.Base64Content);
                        
                        // Get file extension
                        var extension = System.IO.Path.GetExtension(fileDto.FileName).TrimStart('.');
                        
                        // Generate unique file name
                        var uniqueFileName = $"{Guid.NewGuid()}_{fileDto.FileName}";
                        
                        // Generate immutable storage hash for S3 key (never changes)
                        var storageHash = Guid.NewGuid().ToString();
                        
                        // Determine S3 key based on StorageHash
                        // Format: companies/{companyId}/attachments/{storageHash}/{filename}
                        var s3Key = S3PathConstants.BuildAttachmentKey(
                            _session.CompanyId.ToString(),
                            storageHash,
                            uniqueFileName
                        );
                        
                        // Upload to S3 using Stream
                        using (var stream = new System.IO.MemoryStream(fileBytes))
                        {
                            await _s3StorageService.UploadFileAsync(bucketName, s3Key, stream);
                        }
                        
                        // Create attachment entity
                        var attachment = new Attachment
                        {
                            Id = Guid.NewGuid(),
                            FileName = uniqueFileName,
                            OriginalFileName = fileDto.FileName,
                            FileExtension = extension,
                            FileSize = fileBytes.Length,
                            Root = string.IsNullOrEmpty(request.Root) ? "/" : request.Root,  // Keep Root for folder organization
                            StorageHash = storageHash,  // Use StorageHash for S3 operations
                            CompanyId = _session.CompanyId,
                            CreatedOn = DateTime.UtcNow
                        };
                        
                        // Save to database
                        var createResult = await _attachmentRepository.Create(attachment);
                        if (createResult.IsSuccess())
                        {
                            uploadedFiles.Add(attachment);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Continue with other files
                    }
                }

                if (uploadedFiles.Count == 0)
                {
                    return Result.Failure().WithMessage("Failed to upload any files");
                }

                return Result.Success().WithMessage($"Successfully uploaded {uploadedFiles.Count} file(s)");
            }
            catch (Exception ex)
            {
                return Result.Failure().WithMessage($"Error uploading files: {ex.Message}");
            }
        }

        public async Task<Result> UploadFilesMultipartAsync(IFormFileCollection files, string root = null)
        {
            try
            {
                if (files == null || files.Count == 0)
                {
                    return Result.Failure().WithMessage("No files provided");
                }

                var bucketName = GetBucketName();
                var uploadedFiles = new List<Attachment>();

                foreach (var file in files)
                {
                    try
                    {
                        // Get file extension
                        var extension = System.IO.Path.GetExtension(file.FileName).TrimStart('.');
                        
                        // Generate unique file name
                        var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
                        
                        // Generate immutable storage hash for S3 key (never changes)
                        var storageHash = Guid.NewGuid().ToString();
                        
                        // Determine S3 key based on StorageHash
                        // Format: companies/{companyId}/attachments/{storageHash}/{filename}
                        var s3Key = S3PathConstants.BuildAttachmentKey(
                            _session.CompanyId.ToString(),
                            storageHash,
                            uniqueFileName
                        );
                        
                        // Upload to S3 using the file stream directly (more memory efficient)
                        await _s3StorageService.UploadFileAsync(bucketName, s3Key, file.OpenReadStream());
                        
                        // Create attachment entity
                        var attachment = new Attachment
                        {
                            Id = Guid.NewGuid(),
                            FileName = uniqueFileName,
                            OriginalFileName = file.FileName,
                            FileExtension = extension,
                            FileSize = file.Length,
                            Root = string.IsNullOrEmpty(root) ? "/" : root,  // Keep Root for folder organization
                            StorageHash = storageHash,  // Use StorageHash for S3 operations
                            CompanyId = _session.CompanyId,
                            CreatedOn = DateTime.UtcNow
                        };
                        
                        // Save to database
                        var createResult = await _attachmentRepository.Create(attachment);
                        if (createResult.IsSuccess())
                        {
                            uploadedFiles.Add(attachment);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Continue with other files
                    }
                }

                if (uploadedFiles.Count == 0)
                {
                    return Result.Failure().WithMessage("Failed to upload any files");
                }

                return Result.Success().WithMessage($"Successfully uploaded {uploadedFiles.Count} file(s)");
            }
            catch (Exception ex)
            {
                return Result.Failure().WithMessage($"Error uploading files: {ex.Message}");
            }
        }

        public async Task<Result<StorageUsageDto>> GetStorageUsageAsync()
        {
            try
            {
                // Get all attachments for the current company
                var attachmentsResult = await _attachmentRepository.GetAllAsync();
                if (attachmentsResult.IsFailure())
                {
                    return Result.Failure<StorageUsageDto>();
                }

                var attachments = attachmentsResult.Data.Where(a => a.CompanyId == _session.CompanyId).ToList();
                
                // Calculate total storage used
                var totalSize = attachments.Sum(a => a.FileSize);
                
                // Get storage limit from configuration (default 1GB)
                var storageLimit = _configuration.GetValue<long>("Storage:Limit", 1073741824); // 1GB in bytes

                var storageUsage = new StorageUsageDto
                {
                    UsedBytes = totalSize,
                    LimitBytes = storageLimit,
                    UsedPercentage = (int)Math.Round((double)totalSize / storageLimit * 100)
                };

                return Result.Success(storageUsage);
            }
            catch (Exception ex)
            {
                return Result.Failure<StorageUsageDto>().WithMessage($"Error getting storage usage: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete multiple attachments by IDs
        /// </summary>
        /// <param name="fileIds">List of file IDs to delete</param>
        /// <returns>Delete result</returns>
        public async Task<Result> BulkDeleteAsync(List<Guid> fileIds)
        {
            try
            {
                if (fileIds == null || !fileIds.Any())
                {
                    return Result.Failure().WithMessage("No files specified for deletion");
                }

                var deletedCount = 0;
                var errors = new List<string>();

                foreach (var fileId in fileIds)
                {
                    try
                    {
                        // Get the attachment to delete
                        var attachmentResult = await _attachmentRepository.GetByIdAsync(fileId);
                        if (attachmentResult.IsFailure())
                        {
                            errors.Add($"File with ID {fileId} not found");
                            continue;
                        }

                        var attachment = attachmentResult.Data;
                        
                        // All attachments in the database are files (folders are virtual)
                        // No need to check for IsFolder since it doesn't exist

                        // Delete from S3 first
                        await DeleteFromS3(attachment);
                        
                        // Delete from database
                        var deleteResult = await DeleteAsync(fileId);
                        if (deleteResult.IsSuccess())
                        {
                            deletedCount++;
                        }
                        else
                        {
                            errors.Add($"Failed to delete {attachment.OriginalFileName}: {deleteResult.Message}");
                        }
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Error deleting file {fileId}: {ex.Message}");
                    }
                }

                if (deletedCount > 0)
                {
                    var message = $"Successfully deleted {deletedCount} file(s)";
                    if (errors.Any())
                    {
                        message += $". {errors.Count} error(s) occurred: {string.Join(", ", errors)}";
                    }
                    return Result.Success().WithMessage(message);
                }
                else
                {
                    return Result.Failure().WithMessage($"No files were deleted. Errors: {string.Join(", ", errors)}");
                }
            }
            catch (Exception ex)
            {
                return Result.Failure().WithMessage($"Error during bulk delete: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete file from S3 storage using StorageHash
        /// </summary>
        private async Task DeleteFromS3(Attachment attachment)
        {
            try
            {
                if (string.IsNullOrEmpty(attachment.StorageHash))
                {
                    // Skip deletion if StorageHash is missing (should not happen after migration)
                    return;
                }

                var bucketName = GetBucketName();
                
                // Construct the S3 key based on StorageHash
                var key = S3PathConstants.BuildAttachmentKey(
                    attachment.CompanyId.ToString(),
                    attachment.StorageHash,
                    attachment.FileName
                );

                await _s3StorageService.DeleteAsync(bucketName, key);
            }
            catch (Exception ex)
            {
                // Continue with database deletion even if S3 deletion fails
            }
        }

        /// <summary>
        /// Hook called before deleting an attachment
        /// Deletes the file from S3 storage using StorageHash
        /// </summary>
        protected override async Task InDelete_BeforDeleteAsync(Attachment entity)
        {
            try
            {
                if (string.IsNullOrEmpty(entity.StorageHash))
                {
                    // Skip deletion if StorageHash is missing (should not happen after migration)
                    return;
                }

                var bucketName = GetBucketName();
                
                // Construct the S3 key based on StorageHash
                var key = S3PathConstants.BuildAttachmentKey(
                    entity.CompanyId.ToString(),
                    entity.StorageHash,
                    entity.FileName
                );

                await _s3StorageService.DeleteAsync(bucketName, key);
            }
            catch (Exception ex)
            {
                // Continue with database deletion even if S3 deletion fails
            }
        }

        /// <summary>
        /// Get all attachments for a specific property
        /// </summary>
        /// <param name="propertyId">Property ID</param>
        /// <returns>List of attachments for the property</returns>
        public async Task<List<Attachment>> GetAllAttachmentsForPropertyAsync(Guid propertyId)
        {
            try
            {
                var attachmentsResult = await _attachmentRepository.GetAllAsync();
                if (attachmentsResult.IsFailure())
                {
                    return new List<Attachment>();
                }

                // Filter attachments by property ID and company ID
                var propertyAttachments = attachmentsResult.Data
                    .Where(a => a.PropertyId == propertyId && a.CompanyId == _session.CompanyId)
                    .ToList();

                return propertyAttachments;
            }
            catch (Exception ex)
            {
                return new List<Attachment>();
            }
        }
    }
}

