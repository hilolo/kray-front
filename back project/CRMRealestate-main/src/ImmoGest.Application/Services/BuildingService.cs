using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Auth.Interfaces;
using ImmoGest.Domain.Constants;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ResultNet;
using System.Security.Cryptography;
using System.Text;

namespace ImmoGest.Application.Services
{
    public class BuildingService : DataServiceBase<Building>, IBuildingService
    {
        private readonly IBuildingRepository _buildingRepository;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly ISession _session;
        private readonly IAttachmentService _attachmentService;
        private readonly IS3StorageService _s3StorageService;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly ILogger<BuildingService> _logger;

        // Store DTOs temporarily for after insert/update processing
        // Use instance variables since service is scoped per request
        private CreateBuildingDto _currentBuildingDto;
        private UpdateBuildingDto _currentUpdateBuildingDto;
        private Guid? _oldDefaultAttachmentId;
        private bool _imageWasUploaded;

        public BuildingService(
            IMapper mapper,
            IBuildingRepository buildingRepository,
            IAttachmentRepository attachmentRepository,
            ISession session,
            IAttachmentService attachmentService,
            IS3StorageService s3StorageService,
            IConfiguration configuration,
            ILogger<BuildingService> logger
        ) : base(mapper, buildingRepository)
        {
            _mapper = mapper;
            _buildingRepository = buildingRepository;
            _attachmentRepository = attachmentRepository;
            _session = session;
            _attachmentService = attachmentService;
            _s3StorageService = s3StorageService;
            _configuration = configuration;
            _logger = logger;
        }

        protected override async Task InCreate_BeforInsertAsync<TCreateModel>(Building entity, TCreateModel createModel)
        {
            // Set CompanyId from session
            entity.CompanyId = _session.CompanyId;
            
            if (createModel is CreateBuildingDto dto)
            {
                _currentBuildingDto = dto;
            }
            
            await base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override async Task InCreate_AfterInsertAsync<TCreateModel>(Building entity, TCreateModel createModel)
        {
            if (_currentBuildingDto != null && _currentBuildingDto.Image != null && !string.IsNullOrEmpty(_currentBuildingDto.Image.Base64Content))
            {
                var dto = _currentBuildingDto;
                
                try
                {
                    var fileExtension = GetImageExtensionFromBase64(dto.Image.Base64Content);
                    var originalFileName = string.IsNullOrEmpty(dto.Image.FileName) 
                        ? $"building_{Guid.NewGuid()}{fileExtension}" 
                        : dto.Image.FileName;
                    
                    if (!Path.HasExtension(originalFileName))
                    {
                        originalFileName = $"{originalFileName}{fileExtension}";
                    }

                    originalFileName = SanitizeFileName(originalFileName);

                    // Convert base64 to bytes first
                    var fileBytes = Convert.FromBase64String(dto.Image.Base64Content);

                    // Generate immutable storage hash based on CompanyId and file content
                    // This ensures same file + same company = same hash (works even when name changes)
                    var storageHash = GenerateStorageHash(entity.CompanyId, fileBytes);
                    
                    // Upload to S3 using StorageHash
                    var s3Key = S3PathConstants.BuildAttachmentKey(
                        entity.CompanyId.ToString(),
                        storageHash,
                        originalFileName
                    );
                    
                    // Upload to S3
                    using (var stream = new MemoryStream(fileBytes))
                    {
                        await _s3StorageService.UploadFileAsync(GetBucketName(), s3Key, stream);
                    }
                    
                    // Create attachment record
                    var buildingFolder = SanitizeFolderName(entity.Name);
                    var attachment = new Attachment
                    {
                        FileName = originalFileName,
                        OriginalFileName = originalFileName,
                        FileExtension = Path.GetExtension(originalFileName),
                        FileSize = fileBytes.Length,
                        Root = S3PathConstants.GetBuildingAttachmentsPath(buildingFolder), // Keep Root for folder organization
                        StorageHash = storageHash,  // Use StorageHash for S3 operations
                        CompanyId = entity.CompanyId
                    };
                    attachment.BuildSearchTerms();
                    
                    var createdAttachment = await _attachmentService.CreateAsync<Attachment, Attachment>(attachment);
                    
                    if (createdAttachment.IsSuccess() && createdAttachment.Data != null)
                    {
                        await _buildingRepository.UpdateDefaultAttachmentIdAsync(entity.Id, createdAttachment.Data.Id);
                        entity.DefaultAttachmentId = createdAttachment.Data.Id;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[Building Create - Image] Error processing image for BuildingId: {BuildingId}", entity.Id);
                    // Continue processing
                }
                
                _currentBuildingDto = null;
            }
            
            await base.InCreate_AfterInsertAsync(entity, createModel);
        }

        protected override async Task InUpdate_BeforUpdateAsync<TUpdateModel>(Building entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateBuildingDto dto)
            {
                _currentUpdateBuildingDto = dto;
                
                // Store the old DefaultAttachmentId before mapping to delete it later if needed
                _oldDefaultAttachmentId = entity.DefaultAttachmentId;
                
                // Map all fields from DTO to entity
                _mapper.Map(dto, entity);
                
                // Ensure CompanyId is not modified during update
                entity.CompanyId = _session.CompanyId;
                
                // Reset image upload flag
                _imageWasUploaded = false;
            }
            
            await base.InUpdate_BeforUpdateAsync(entity, updateModel);
        }

        protected override async Task InUpdate_AfterUpdateAsync<TUpdateModel>(Building entity, TUpdateModel updateModel)
        {
            if (_currentUpdateBuildingDto != null && _currentUpdateBuildingDto.Image != null && !string.IsNullOrEmpty(_currentUpdateBuildingDto.Image.Base64Content))
            {
                var dto = _currentUpdateBuildingDto;
                
                try
                {
                    // Delete old image if exists (use the stored old ID, not the entity's current ID)
                    if (_oldDefaultAttachmentId.HasValue)
                    {
                        var oldAttachment = await _attachmentService.GetByIdAsync<AttachmentDto>(_oldDefaultAttachmentId.Value);
                        if (oldAttachment.IsSuccess() && oldAttachment.Data != null)
                        {
                            if (!string.IsNullOrEmpty(oldAttachment.Data.StorageHash))
                            {
                                var oldS3Key = S3PathConstants.BuildAttachmentKey(
                                    entity.CompanyId.ToString(),
                                    oldAttachment.Data.StorageHash,
                                    oldAttachment.Data.FileName
                                );
                                await _s3StorageService.DeleteAsync(GetBucketName(), oldS3Key);
                            }
                            await _attachmentService.DeleteAsync(_oldDefaultAttachmentId.Value);
                        }
                    }
                    
                    var fileExtension = GetImageExtensionFromBase64(dto.Image.Base64Content);
                    var originalFileName = string.IsNullOrEmpty(dto.Image.FileName) 
                        ? $"building_{Guid.NewGuid()}{fileExtension}" 
                        : dto.Image.FileName;
                    
                    if (!Path.HasExtension(originalFileName))
                    {
                        originalFileName = $"{originalFileName}{fileExtension}";
                    }

                    originalFileName = SanitizeFileName(originalFileName);

                    // Convert base64 to bytes first
                    var fileBytes = Convert.FromBase64String(dto.Image.Base64Content);

                    // Generate immutable storage hash based on CompanyId and file content
                    // This ensures same file + same company = same hash (works even when name changes)
                    var storageHash = GenerateStorageHash(entity.CompanyId, fileBytes);
                    
                    // Upload to S3 using StorageHash
                    var s3Key = S3PathConstants.BuildAttachmentKey(
                        entity.CompanyId.ToString(),
                        storageHash,
                        originalFileName
                    );
                    
                    // Upload to S3
                    using (var stream = new MemoryStream(fileBytes))
                    {
                        await _s3StorageService.UploadFileAsync(GetBucketName(), s3Key, stream);
                    }
                    
                    // Create attachment record in database - same structure as CREATE
                    var buildingFolder = SanitizeFolderName(entity.Name);
                    var attachment = new Attachment
                    {
                        FileName = originalFileName,
                        OriginalFileName = originalFileName,
                        FileExtension = Path.GetExtension(originalFileName),
                        FileSize = fileBytes.Length,
                        Root = S3PathConstants.GetBuildingAttachmentsPath(buildingFolder), // Keep Root for folder organization
                        StorageHash = storageHash,  // Use StorageHash for S3 operations
                        CompanyId = entity.CompanyId
                    };
                    attachment.BuildSearchTerms();
                    
                    var createdAttachment = await _attachmentService.CreateAsync<Attachment, Attachment>(attachment);
                    
                    if (createdAttachment.IsSuccess() && createdAttachment.Data != null)
                    {
                        await _buildingRepository.UpdateDefaultAttachmentIdAsync(entity.Id, createdAttachment.Data.Id);
                        entity.DefaultAttachmentId = createdAttachment.Data.Id;
                        
                        // Set flag to indicate image was uploaded
                        _imageWasUploaded = true;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[Building Update - Image] Error processing image for BuildingId: {BuildingId}", entity.Id);
                    // Continue processing
                }
                
                // Clear temporary variables (but keep _imageWasUploaded flag)
                _currentUpdateBuildingDto = null;
                _oldDefaultAttachmentId = null;
            }
            
            await base.InUpdate_AfterUpdateAsync(entity, updateModel);
        }

        protected override async Task InGet_AfterMappingAsync<TOut>(Building entity, TOut mappedEntity)
        {
            if (mappedEntity is BuildingDto dto)
            {
                // Generate default attachment URL if DefaultAttachmentId exists
                if (entity.DefaultAttachmentId.HasValue)
                {
                    try
                    {
                        // Get the attachment entity directly from repository to access cached URL
                        var attachmentEntityResult = await _attachmentRepository.GetByIdAsync(entity.DefaultAttachmentId.Value);
                        if (attachmentEntityResult.IsSuccess() && attachmentEntityResult.Data != null)
                        {
                            var attachmentEntity = attachmentEntityResult.Data;
                            if (!string.IsNullOrEmpty(attachmentEntity.StorageHash))
                            {
                                var s3Key = S3PathConstants.BuildAttachmentKey(
                                    entity.CompanyId.ToString(),
                                    attachmentEntity.StorageHash,
                                    attachmentEntity.FileName
                                );
                                
                                // Use cached URL from repository
                                dto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                    GetBucketName(), 
                                    s3Key, 
                                    attachmentEntity.Url, 
                                    attachmentEntity.UrlExpiresAt, 
                                    24);
                                
                                // Update cached URL in repository if it was regenerated
                                if (dto.DefaultAttachmentUrl != attachmentEntity.Url)
                                {
                                    attachmentEntity.Url = dto.DefaultAttachmentUrl;
                                    attachmentEntity.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                    await _attachmentRepository.Update(attachmentEntity);
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        dto.DefaultAttachmentUrl = null;
                    }
                }
                
                // Populate Properties and PropertiesCount
                if (entity.Properties != null && entity.Properties.Any())
                {
                    dto.Properties = _mapper.Map<List<PropertyDto>>(entity.Properties);
                    dto.PropertiesCount = entity.Properties.Count;
                    
                    // Generate URLs for each property's default attachment
                    foreach (var property in entity.Properties)
                    {
                        var propertyDto = dto.Properties.FirstOrDefault(p => p.Id == property.Id);
                        if (propertyDto != null && property.DefaultAttachmentId.HasValue)
                        {
                            try
                            {
                                // Get the attachment entity directly from repository to access cached URL
                                var attachmentEntityResult = await _attachmentRepository.GetByIdAsync(property.DefaultAttachmentId.Value);
                                if (attachmentEntityResult.IsSuccess() && attachmentEntityResult.Data != null)
                                {
                                    var attachmentEntity = attachmentEntityResult.Data;
                                    if (!string.IsNullOrEmpty(attachmentEntity.StorageHash))
                                    {
                                        var s3Key = S3PathConstants.BuildAttachmentKey(
                                            property.CompanyId.ToString(),
                                            attachmentEntity.StorageHash,
                                            attachmentEntity.FileName
                                        );
                                        
                                        // Use cached URL from repository
                                        propertyDto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                            GetBucketName(), 
                                            s3Key, 
                                            attachmentEntity.Url, 
                                            attachmentEntity.UrlExpiresAt, 
                                            24);
                                        
                                        // Update cached URL in repository if it was regenerated
                                        if (propertyDto.DefaultAttachmentUrl != attachmentEntity.Url)
                                        {
                                            attachmentEntity.Url = propertyDto.DefaultAttachmentUrl;
                                            attachmentEntity.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                            await _attachmentRepository.Update(attachmentEntity);
                                        }
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                propertyDto.DefaultAttachmentUrl = null;
                            }
                        }
                    }
                }
                else
                {
                    // Count properties from database if not loaded
                    var propertiesCount = await _buildingRepository.CountPropertiesAsync(entity.Id);
                    dto.PropertiesCount = propertiesCount;
                    dto.Properties = new List<PropertyDto>();
                }
            }
            
            await base.InGet_AfterMappingAsync(entity, mappedEntity);
        }

        protected override Task InPagedResult_BeforeListRetrievalAsync<IFilter>(IFilter filterOption)
        {
            filterOption.CompanyId = _session.CompanyId;
            return base.InPagedResult_BeforeListRetrievalAsync(filterOption);
        }

        /// <summary>
        /// Override GetByIdAsync to load building with properties
        /// </summary>
        public override async Task<Result<TOut>> GetByIdAsync<TOut>(Guid id)
        {
            // Use the repository method that includes properties
            var building = await _buildingRepository.GetByIdWithPropertiesAsync(id);
            if (building == null)
                return Result.Failure<TOut>();

            var mappedEntity = _mapper.Map<TOut>(building);

            /*hook after mapping the entity*/
            await InGet_AfterMappingAsync(building, mappedEntity);

            return Result.Success(mappedEntity);
        }

        /// <summary>
        /// Override UpdateAsync to ensure the returned DTO includes the newly generated image URL
        /// </summary>
        public override async Task<Result<TOut>> UpdateAsync<TOut, TUpdateModel>(Guid id, TUpdateModel updateModel)
        {
            // Call base update method (this will trigger InUpdate_AfterUpdateAsync where image is uploaded)
            var result = await base.UpdateAsync<TOut, TUpdateModel>(id, updateModel);
            
            if (!result.IsSuccess())
            {
                return result;
            }

            // If an image was uploaded, reload the building to get the new image URL
            if (result.Data is BuildingDto dto && _imageWasUploaded)
            {
                // Get the updated building with the new DefaultAttachmentId
                var buildingResult = await _buildingRepository.GetByIdAsync(id);
                if (buildingResult.IsSuccess() && buildingResult.Data != null)
                {
                    var building = buildingResult.Data;
                    
                    // Generate the image URL for the new attachment
                    if (building.DefaultAttachmentId.HasValue)
                    {
                        try
                        {
                            var defaultAttachmentResult = await _attachmentService.GetByIdAsync<AttachmentDto>(building.DefaultAttachmentId.Value);
                            if (defaultAttachmentResult.IsSuccess() && defaultAttachmentResult.Data != null)
                            {
                                var defaultAttachment = defaultAttachmentResult.Data;
                                
                                if (!string.IsNullOrEmpty(defaultAttachment.StorageHash))
                                {
                                    var s3Key = S3PathConstants.BuildAttachmentKey(
                                        building.CompanyId.ToString(),
                                        defaultAttachment.StorageHash,
                                        defaultAttachment.FileName
                                    );
                                    
                                    // Get attachment entity for cached URL
                                    var attachmentEntityResult = await _attachmentRepository.GetByIdAsync(building.DefaultAttachmentId.Value);
                                    if (attachmentEntityResult.IsSuccess() && attachmentEntityResult.Data != null)
                                    {
                                        var attachmentEntity = attachmentEntityResult.Data;
                                        
                                        dto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                            GetBucketName(), 
                                            s3Key, 
                                            attachmentEntity.Url, 
                                            attachmentEntity.UrlExpiresAt, 
                                            24);
                                        
                                        if (dto.DefaultAttachmentUrl != attachmentEntity.Url)
                                        {
                                            attachmentEntity.Url = dto.DefaultAttachmentUrl;
                                            attachmentEntity.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                            await _attachmentRepository.Update(attachmentEntity);
                                        }
                                    }
                                    else
                                    {
                                        dto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(GetBucketName(), s3Key, null, null, 24);
                                    }
                                }
                                
                                dto.DefaultAttachmentId = building.DefaultAttachmentId;
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "[Building Update - URL Generation] Error generating image URL for BuildingId: {BuildingId}", id);
                            // Continue processing
                        }
                    }
                }
                
                // Reset the flag
                _imageWasUploaded = false;
            }

            return result;
        }

        public override async Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption)
        {
            // Call base implementation to get the paged result
            var result = await base.GetAsPagedResultAsync<TOut, IFilter>(filterOption);
            
            if (!result.IsSuccess() || result.Data == null)
                return result;

            // Post-process the DTOs to add image URLs and properties count
            if (typeof(TOut) == typeof(BuildingDto))
            {
                var paginatedList = result.Data;
                var dtos = paginatedList.Result as List<BuildingDto>;
                
                if (dtos != null && dtos.Count > 0)
                {
                    foreach (var dto in dtos)
                    {
                        // Only generate image URLs if pagination is NOT being ignored
                        // When Ignore=true (e.g., for dropdowns), skip expensive S3 calls
                        if (!filterOption.Ignore && dto.DefaultAttachmentId.HasValue)
                        {
                            try
                            {
                                // Get attachment entity directly from repository to access cached URL
                                var attachmentEntityResult = await _attachmentRepository.GetByIdAsync(dto.DefaultAttachmentId.Value);
                                
                                if (attachmentEntityResult.IsSuccess() && attachmentEntityResult.Data != null)
                                {
                                    var attachmentEntity = attachmentEntityResult.Data;
                                    
                                    // Check if cached URL is still valid (with 1 hour buffer for safety)
                                    var bufferTime = TimeSpan.FromHours(1);
                                    var hasValidCache = !string.IsNullOrEmpty(attachmentEntity.Url) 
                                        && attachmentEntity.UrlExpiresAt.HasValue 
                                        && DateTimeOffset.UtcNow < attachmentEntity.UrlExpiresAt.Value.Subtract(bufferTime);
                                    
                                    if (hasValidCache)
                                    {
                                        // Use cached URL directly without calling S3 service
                                        dto.DefaultAttachmentUrl = attachmentEntity.Url;
                                    }
                                    else
                                    {
                                        // Cache is invalid or missing, generate new URL
                                        if (!string.IsNullOrEmpty(attachmentEntity.StorageHash))
                                        {
                                            var s3Key = S3PathConstants.BuildAttachmentKey(
                                                dto.CompanyId.ToString(),
                                                attachmentEntity.StorageHash,
                                                attachmentEntity.FileName
                                            );
                                            dto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                GetBucketName(), 
                                                s3Key, 
                                                attachmentEntity.Url, 
                                                attachmentEntity.UrlExpiresAt, 
                                                24);
                                        }
                                        
                                        // Update cached URL in repository if it was regenerated
                                        if (dto.DefaultAttachmentUrl != attachmentEntity.Url)
                                        {
                                            attachmentEntity.Url = dto.DefaultAttachmentUrl;
                                            attachmentEntity.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                            await _attachmentRepository.Update(attachmentEntity);
                                        }
                                    }
                                }
                            }
                            catch
                            {
                                dto.DefaultAttachmentUrl = null;
                            }
                        }
                        
                        // Populate PropertiesCount
                        var propertiesCount = await _buildingRepository.CountPropertiesAsync(dto.Id);
                        dto.PropertiesCount = propertiesCount;
                    }
                }
            }
            
            return result;
        }

        #region Helper Methods

        private string GetBucketName()
        {
            return _configuration["AWS:BucketName"] ?? "immogest-files";
        }

        private string GetImageExtensionFromBase64(string base64String)
        {
            if (base64String.StartsWith("/9j/"))
                return ".jpg";
            if (base64String.StartsWith("iVBORw0KGgo"))
                return ".png";
            if (base64String.StartsWith("R0lGOD"))
                return ".gif";
            if (base64String.StartsWith("UklGR"))
                return ".webp";

            return ".jpg";
        }

        private string SanitizeFileName(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return fileName;

            var extension = Path.GetExtension(fileName);
            var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);

            var invalidChars = Path.GetInvalidFileNameChars();
            foreach (var c in invalidChars)
            {
                nameWithoutExtension = nameWithoutExtension.Replace(c, '_');
            }

            nameWithoutExtension = nameWithoutExtension.Replace(' ', '_');
            nameWithoutExtension = System.Text.RegularExpressions.Regex.Replace(nameWithoutExtension, @"[^\w\-]", "_");

            return nameWithoutExtension + extension;
        }

        private new string SanitizeFolderName(string folderName)
        {
            if (string.IsNullOrEmpty(folderName))
                return "UNKNOWN";

            var invalidChars = Path.GetInvalidFileNameChars();
            foreach (var c in invalidChars)
            {
                folderName = folderName.Replace(c, '_');
            }

            folderName = folderName.Replace(' ', '_');
            folderName = System.Text.RegularExpressions.Regex.Replace(folderName, @"[^\w\-]", "_");

            return folderName;
        }

        /// <summary>
        /// Generate immutable storage hash for attachment based on CompanyId and file content
        /// This ensures same file + same company = same hash (works even when name changes)
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="fileBytes">File content as byte array</param>
        /// <returns>SHA256 hash as hexadecimal string</returns>
        private string GenerateStorageHash(Guid companyId, byte[] fileBytes)
        {
            using (var sha256 = SHA256.Create())
            {
                // Combine CompanyId and file content for hashing
                var companyIdBytes = Encoding.UTF8.GetBytes(companyId.ToString());
                var combinedBytes = new byte[companyIdBytes.Length + fileBytes.Length];
                
                // Copy companyId bytes first, then file bytes
                Buffer.BlockCopy(companyIdBytes, 0, combinedBytes, 0, companyIdBytes.Length);
                Buffer.BlockCopy(fileBytes, 0, combinedBytes, companyIdBytes.Length, fileBytes.Length);
                
                // Compute hash
                var hashBytes = sha256.ComputeHash(combinedBytes);
                
                // Convert to hexadecimal string
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
            }
        }

        /// <summary>
        /// Update the archive status of a building
        /// </summary>
        public async Task<Result<BuildingDto>> UpdateArchiveStatusAsync(UpdateBuildingArchiveStatusDto dto)
        {
            try
            {
                var buildingResult = await _buildingRepository.GetByIdAsync(dto.BuildingId);
                if (!buildingResult.IsSuccess() || buildingResult.Data == null)
                {
                    return Result.Failure<BuildingDto>();
                }

                var building = buildingResult.Data;

                // Ensure the building belongs to the current company
                if (building.CompanyId != _session.CompanyId)
                {
                    return Result.Failure<BuildingDto>();
                }

                // Update archive status
                building.IsArchived = dto.IsArchived;
                building.LastModifiedOn = DateTimeOffset.UtcNow;
                building.BuildSearchTerms();

                var updateResult = await _buildingRepository.Update(building);
                if (!updateResult.IsSuccess())
                {
                    return Result.Failure<BuildingDto>();
                }

                // Return updated building as DTO
                return await GetByIdAsync<BuildingDto>(dto.BuildingId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Building UpdateArchiveStatus] Error updating archive status for BuildingId: {BuildingId}", dto.BuildingId);
                return Result.Failure<BuildingDto>();
            }
        }

        #endregion
    }
}

