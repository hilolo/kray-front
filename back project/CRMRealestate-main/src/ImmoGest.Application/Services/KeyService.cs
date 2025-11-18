using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Constants;
using ImmoGest.Domain.Auth.Interfaces;
using ResultNet;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace ImmoGest.Application.Services
{
    public class KeyService : DataServiceBase<Key>, IKeyService
    {
        private readonly IKeyRepository _keyRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly IAttachmentService _attachmentService;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IS3StorageService _s3StorageService;
        private readonly ISession _session;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        // Store DTOs temporarily for after insert/update processing
        private CreateKeyDto _currentKeyDto;
        private UpdateKeyDto _currentUpdateKeyDto;
        private Guid? _oldDefaultAttachmentId;
        private bool _imageWasUploaded;

        public KeyService(
            IMapper mapper,
            IKeyRepository keyRepository,
            IPropertyRepository propertyRepository,
            IAttachmentService attachmentService,
            IAttachmentRepository attachmentRepository,
            IS3StorageService s3StorageService,
            ISession session,
            IConfiguration configuration)
            : base(mapper, keyRepository)
        {
            _mapper = mapper;
            _keyRepository = keyRepository;
            _propertyRepository = propertyRepository;
            _attachmentService = attachmentService;
            _attachmentRepository = attachmentRepository;
            _s3StorageService = s3StorageService;
            _session = session;
            _configuration = configuration;
        }

        protected override async Task InCreate_BeforInsertAsync<TCreateModel>(Key entity, TCreateModel createModel)
        {
            if (createModel is CreateKeyDto dto)
            {
                // Store DTO for after insert processing
                _currentKeyDto = dto;
            }
            entity.BuildSearchTerms();
            await base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override async Task InCreate_AfterInsertAsync<TCreateModel>(Key entity, TCreateModel createModel)
        {
            if (_currentKeyDto != null && _currentKeyDto.Image != null && !string.IsNullOrEmpty(_currentKeyDto.Image.Base64Content))
            {
                var dto = _currentKeyDto;
                
                try
                {
                    // Get company ID from property - load Property if not already loaded
                    Guid companyId;
                    if (entity.Property != null)
                    {
                        companyId = entity.Property.CompanyId;
                    }
                    else
                    {
                        // Load Property to get CompanyId
                        var propertyResult = await _propertyRepository.GetByIdAsync(entity.PropertyId);
                        if (propertyResult.IsSuccess() && propertyResult.Data != null)
                        {
                            companyId = propertyResult.Data.CompanyId;
                        }
                        else
                        {
                            // Fallback to session CompanyId if Property not found
                            companyId = _session.CompanyId;
                        }
                    }
                    
                    var fileExtension = GetImageExtensionFromBase64(dto.Image.Base64Content);
                    
                    var originalFileName = string.IsNullOrEmpty(dto.Image.FileName) 
                        ? $"key_{Guid.NewGuid()}{fileExtension}" 
                        : dto.Image.FileName;
                    
                    if (!Path.HasExtension(originalFileName))
                    {
                        originalFileName = $"{originalFileName}{fileExtension}";
                    }

                    originalFileName = SanitizeFileName(originalFileName);

                    // Convert base64 to bytes first
                    var fileBytes = Convert.FromBase64String(dto.Image.Base64Content);

                    // Generate immutable storage hash based on CompanyId and file content
                    var storageHash = GenerateStorageHash(companyId, fileBytes);
                    
                    // Upload to S3 using StorageHash
                    var s3Key = S3PathConstants.BuildAttachmentKey(
                        companyId.ToString(),
                        storageHash,
                        originalFileName
                    );
                    var bucketName = GetBucketName();
                    
                    // Upload to S3 - match BuildingService exactly (no contentType parameter)
                    using (var stream = new MemoryStream(fileBytes))
                    {
                        await _s3StorageService.UploadFileAsync(bucketName, s3Key, stream);
                    }
                    
                    // Create attachment record
                    var attachment = new Attachment
                    {
                        FileName = originalFileName,
                        OriginalFileName = originalFileName,
                        FileExtension = Path.GetExtension(originalFileName),
                        FileSize = fileBytes.Length,
                        Root = $"key/{entity.Id}",
                        StorageHash = storageHash,
                        KeyId = entity.Id,
                        CompanyId = companyId
                    };
                    attachment.BuildSearchTerms();
                    
                    var createdAttachment = await _attachmentService.CreateAsync<Attachment, Attachment>(attachment);
                    
                    if (createdAttachment.IsSuccess() && createdAttachment.Data != null)
                    {
                        entity.DefaultAttachmentId = createdAttachment.Data.Id;
                        await _keyRepository.Update(entity);
                    }
                }
                catch (Exception ex)
                {
                    // Continue processing
                }
                
                _currentKeyDto = null;
            }
            
            await base.InCreate_AfterInsertAsync(entity, createModel);
        }

        protected override async Task InUpdate_BeforUpdateAsync<TUpdateModel>(Key entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateKeyDto dto)
            {
                _currentUpdateKeyDto = dto;
                
                // Store the old DefaultAttachmentId before mapping to delete it later if needed
                _oldDefaultAttachmentId = entity.DefaultAttachmentId;
                
                // Map all fields from DTO to entity
                _mapper.Map(dto, entity);
                
                // Reset image upload flag
                _imageWasUploaded = false;
            }
            
            entity.BuildSearchTerms();
            await base.InUpdate_BeforUpdateAsync(entity, updateModel);
        }

        protected override async Task InUpdate_AfterUpdateAsync<TUpdateModel>(Key entity, TUpdateModel updateModel)
        {
            if (_currentUpdateKeyDto != null && _currentUpdateKeyDto.Image != null && !string.IsNullOrEmpty(_currentUpdateKeyDto.Image.Base64Content))
            {
                var dto = _currentUpdateKeyDto;
                
                try
                {
                    // Get company ID from property - load Property if not already loaded
                    Guid companyId;
                    if (entity.Property != null)
                    {
                        companyId = entity.Property.CompanyId;
                    }
                    else
                    {
                        // Load Property to get CompanyId
                        var propertyResult = await _propertyRepository.GetByIdAsync(entity.PropertyId);
                        if (propertyResult.IsSuccess() && propertyResult.Data != null)
                        {
                            companyId = propertyResult.Data.CompanyId;
                        }
                        else
                        {
                            // Fallback to session CompanyId if Property not found
                            companyId = _session.CompanyId;
                        }
                    }
                    
                    // Delete old image if exists (use the stored old ID, not the entity's current ID)
                    if (_oldDefaultAttachmentId.HasValue)
                    {
                        var oldAttachment = await _attachmentService.GetByIdAsync<AttachmentDto>(_oldDefaultAttachmentId.Value);
                        if (oldAttachment.IsSuccess() && oldAttachment.Data != null)
                        {
                            if (!string.IsNullOrEmpty(oldAttachment.Data.StorageHash))
                            {
                                var oldS3Key = S3PathConstants.BuildAttachmentKey(
                                    companyId.ToString(),
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
                        ? $"key_{Guid.NewGuid()}{fileExtension}" 
                        : dto.Image.FileName;
                    
                    if (!Path.HasExtension(originalFileName))
                    {
                        originalFileName = $"{originalFileName}{fileExtension}";
                    }

                    originalFileName = SanitizeFileName(originalFileName);

                    // Convert base64 to bytes first
                    var fileBytes = Convert.FromBase64String(dto.Image.Base64Content);

                    // Generate immutable storage hash based on CompanyId and file content
                    var storageHash = GenerateStorageHash(companyId, fileBytes);
                    
                    // Upload to S3 using StorageHash
                    var s3Key = S3PathConstants.BuildAttachmentKey(
                        companyId.ToString(),
                        storageHash,
                        originalFileName
                    );
                    var bucketName = GetBucketName();
                    
                    // Upload to S3 - match BuildingService exactly (no contentType parameter)
                    using (var stream = new MemoryStream(fileBytes))
                    {
                        await _s3StorageService.UploadFileAsync(bucketName, s3Key, stream);
                    }
                    
                    // Create attachment record in database - same structure as CREATE
                    var attachment = new Attachment
                    {
                        FileName = originalFileName,
                        OriginalFileName = originalFileName,
                        FileExtension = Path.GetExtension(originalFileName),
                        FileSize = fileBytes.Length,
                        Root = $"key/{entity.Id}",
                        StorageHash = storageHash,
                        KeyId = entity.Id,
                        CompanyId = companyId
                    };
                    attachment.BuildSearchTerms();
                    
                    var createdAttachment = await _attachmentService.CreateAsync<Attachment, Attachment>(attachment);
                    
                    if (createdAttachment.IsSuccess() && createdAttachment.Data != null)
                    {
                        entity.DefaultAttachmentId = createdAttachment.Data.Id;
                        await _keyRepository.Update(entity);
                        
                        // Set flag to indicate image was uploaded
                        _imageWasUploaded = true;
                    }
                }
                catch (Exception ex)
                {
                    // Continue processing
                }
                
                // Clear temporary variables (but keep _imageWasUploaded flag)
                _currentUpdateKeyDto = null;
                _oldDefaultAttachmentId = null;
            }
            
            await base.InUpdate_AfterUpdateAsync(entity, updateModel);
        }

        public override async Task<Result<TOut>> GetByIdAsync<TOut>(Guid id)
        {
            var entity = await _keyRepository.GetByIdAsync(id);
            if (entity is null || entity.Data is null)
                return Result.Failure<TOut>();

            var mappedEntity = _mapper.Map<TOut>(entity.Data);

            // Post-process to manually map Property (to avoid circular reference issues)
            if (typeof(TOut) == typeof(KeyDto) && mappedEntity is KeyDto keyDto && entity.Data is Key keyEntity)
            {
                // Manually map Property if it exists
                if (keyEntity.Property != null)
                {
                    keyDto.Property = _mapper.Map<PropertyDto>(keyEntity.Property);
                    
                    // Map Building if it exists
                    if (keyEntity.Property.Building != null && keyDto.Property != null)
                    {
                        keyDto.Property.Building = new PropertyBuildingDto
                        {
                            Id = keyEntity.Property.Building.Id,
                            Name = keyEntity.Property.Building.Name
                        };
                    }
                    
                    // Set OwnerName from Contact if available
                    if (keyEntity.Property.Contact != null && keyDto.Property != null)
                    {
                        keyDto.Property.OwnerName = $"{keyEntity.Property.Contact.FirstName} {keyEntity.Property.Contact.LastName}".Trim();
                    }
                }
            }

            /*hook after mapping the entity*/
            await InGet_AfterMappingAsync(entity.Data, mappedEntity);

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

            // If an image was uploaded, reload the key to get the new image URL
            if (result.Data is KeyDto dto && _imageWasUploaded)
            {
                // Get the updated key with the new DefaultAttachmentId
                var keyResult = await _keyRepository.GetByIdAsync(id);
                if (keyResult.IsSuccess() && keyResult.Data != null)
                {
                    var key = keyResult.Data;
                    
                    // Generate the image URL for the new attachment
                    if (key.DefaultAttachmentId.HasValue)
                    {
                        try
                        {
                            var defaultAttachmentResult = await _attachmentService.GetByIdAsync<AttachmentDto>(key.DefaultAttachmentId.Value);
                            if (defaultAttachmentResult.IsSuccess() && defaultAttachmentResult.Data != null)
                            {
                                var defaultAttachment = defaultAttachmentResult.Data;
                                
                                if (!string.IsNullOrEmpty(defaultAttachment.StorageHash))
                                {
                                    var companyId = key.Property?.CompanyId ?? _session.CompanyId;
                                    var s3Key = S3PathConstants.BuildAttachmentKey(
                                        companyId.ToString(),
                                        defaultAttachment.StorageHash,
                                        defaultAttachment.FileName
                                    );
                                    
                                    // Get attachment entity for cached URL
                                    var attachmentEntityResult = await _attachmentRepository.GetByIdAsync(key.DefaultAttachmentId.Value);
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
                                
                                dto.DefaultAttachmentId = key.DefaultAttachmentId;
                            }
                        }
                        catch (Exception ex)
                        {
                            // Continue processing
                        }
                    }
                }
                
                // Reset the flag
                _imageWasUploaded = false;
            }

            return result;
        }

        protected override async Task InGet_AfterMappingAsync<TOut>(Key entity, TOut mappedEntity)
        {
            if (mappedEntity is KeyDto dto)
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
                                var companyId = entity.Property?.CompanyId ?? _session.CompanyId;
                                var s3Key = S3PathConstants.BuildAttachmentKey(
                                    companyId.ToString(),
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
            }
            
            await base.InGet_AfterMappingAsync(entity, mappedEntity);
        }


        private string GetBucketName()
        {
            return _configuration["AWS:BucketName"] ?? "immogest-files";
        }

        public override async Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption)
        {
            // Call base implementation to get the paged result
            var result = await base.GetAsPagedResultAsync<TOut, IFilter>(filterOption);
            
            if (!result.IsSuccess() || result.Data == null)
                return result;

            // Post-process the DTOs to add image URLs
            if (typeof(TOut) == typeof(KeyDto))
            {
                var paginatedList = result.Data;
                var dtos = paginatedList.Result as List<KeyDto>;
                
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
                                                dto.Property?.CompanyId.ToString() ?? _session.CompanyId.ToString(),
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
                    }
                }
            }
            
            return result;
        }

        // Helper methods for image processing
        private bool IsValidBase64String(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return false;

            try
            {
                // Remove data URL prefix if present
                var base64 = base64String.Contains(",") ? base64String.Split(',')[1] : base64String;
                Convert.FromBase64String(base64);
                return true;
            }
            catch
            {
                return false;
            }
        }

        private string GetImageExtensionFromBase64(string base64String)
        {
            // Check for common image format headers in base64
            var base64 = base64String.Contains(",") ? base64String.Split(',')[1] : base64String;
            
            if (base64.StartsWith("/9j/"))
                return ".jpg";
            if (base64.StartsWith("iVBORw0KGgo"))
                return ".png";
            if (base64.StartsWith("R0lGOD"))
                return ".gif";
            if (base64.StartsWith("UklGR"))
                return ".webp";

            // Default to .jpg if format cannot be determined
            return ".jpg";
        }

        private string SanitizeFileName(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
                return "image.jpg";

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

            // Ensure it's not empty
            if (string.IsNullOrWhiteSpace(nameWithoutExtension))
                nameWithoutExtension = "image";

            return nameWithoutExtension + extension;
        }

        private string GenerateStorageHash(Guid companyId, byte[] fileBytes)
        {
            using (var sha256 = SHA256.Create())
            {
                var companyIdBytes = Encoding.UTF8.GetBytes(companyId.ToString());
                var combinedBytes = new byte[companyIdBytes.Length + fileBytes.Length];
                
                Buffer.BlockCopy(companyIdBytes, 0, combinedBytes, 0, companyIdBytes.Length);
                Buffer.BlockCopy(fileBytes, 0, combinedBytes, companyIdBytes.Length, fileBytes.Length);
                
                var hashBytes = sha256.ComputeHash(combinedBytes);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
            }
        }

        private string GetContentTypeFromExtension(string extension)
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
    }
}

