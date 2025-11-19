using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Constants;
using ImmoGest.Domain.Auth.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ResultNet;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace ImmoGest.Application.Services
{
    public class PropertyService : DataServiceBase<Property>, IPropertyService
    {
        private readonly IPropertyRepository _propertyRepository;
        private readonly IContactRepository _contactRepository;
        private readonly IAttachmentService _attachmentService;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IMapper _mapper;
        private readonly ISession _session;
        private readonly IS3StorageService _s3StorageService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PropertyService> _logger;
        
        // Store DTOs temporarily for after insert/update processing
        // Use instance variables since service is scoped per request
        private CreatePropertyDto _currentPropertyDto;
        private UpdatePropertyDto _currentUpdatePropertyDto;

        public PropertyService(
            IMapper mapper,
            IPropertyRepository propertyRepository,
            IContactRepository contactRepository,
            IAttachmentService attachmentService,
            IAttachmentRepository attachmentRepository,
            ISession session,
            IS3StorageService s3StorageService,
            IConfiguration configuration,
            ILogger<PropertyService> logger)
            : base(mapper, propertyRepository)
        {
            _propertyRepository = propertyRepository;
            _contactRepository = contactRepository;
            _attachmentService = attachmentService;
            _attachmentRepository = attachmentRepository;
            _mapper = mapper;
            _session = session;
            _s3StorageService = s3StorageService;
            _configuration = configuration;
            _logger = logger;
        }

        protected override async Task InCreate_BeforInsertAsync<TCreateModel>(Property entity, TCreateModel createModel)
        {
            if (createModel is CreatePropertyDto dto)
            {
                // Set CompanyId from session
                entity.CompanyId = _session.CompanyId;

                // Store DTO for after insert processing
                _currentPropertyDto = dto;
            }
            await base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override async Task InCreate_AfterInsertAsync<TCreateModel>(Property entity, TCreateModel createModel)
        {
            if (_currentPropertyDto != null && _currentPropertyDto.Images != null && _currentPropertyDto.Images.Count > 0)
            {
                var dto = _currentPropertyDto;
                Guid? defaultAttachmentId = null;
                
                // Get owner name for folder structure
                var ownerName = await GetOwnerNameAsync(entity.ContactId);
                var propertyReference = SanitizeFolderName(entity.Identifier);
                
                for (int i = 0; i < dto.Images.Count; i++)
                {
                    var image = dto.Images[i];
                    
                    if (!string.IsNullOrEmpty(image.Base64Content) && IsValidBase64String(image.Base64Content))
                    {
                        try
                        {
                            var fileExtension = GetImageExtensionFromBase64(image.Base64Content);
                            var originalFileName = string.IsNullOrEmpty(image.FileName) 
                                ? $"image_{i}{fileExtension}" 
                                : image.FileName;
                            
                            // Ensure the filename has an extension
                            if (!System.IO.Path.HasExtension(originalFileName))
                            {
                                originalFileName = $"{originalFileName}{fileExtension}";
                            }

                            // Sanitize the filename to remove spaces and invalid characters
                            originalFileName = SanitizeFileName(originalFileName);

                            // Convert base64 to bytes first
                            var fileBytes = Convert.FromBase64String(image.Base64Content);

                            // Generate immutable storage hash based on CompanyId and file content
                            // This ensures same file + same company = same hash (works even when name changes)
                            var storageHash = GenerateStorageHash(entity.CompanyId, fileBytes);

                            // Upload to S3 using StorageHash
                            var s3Key = S3PathConstants.BuildAttachmentKey(
                                entity.CompanyId.ToString(),
                                storageHash,
                                originalFileName
                            );
                            
                            using (var stream = new System.IO.MemoryStream(fileBytes))
                            {
                                await _s3StorageService.UploadFileAsync(GetBucketName(), s3Key, stream);
                            }
                            
                            // Create attachment record in database
                            var attachment = new Attachment
                            {
                                Id = Guid.NewGuid(), // Explicitly set ID
                                FileName = originalFileName,
                                OriginalFileName = originalFileName,
                                FileExtension = Path.GetExtension(originalFileName),
                                FileSize = fileBytes.Length,
                                Root = $"{ownerName}/property/{propertyReference}", // Keep Root for folder organization
                                StorageHash = storageHash,  // Use StorageHash for S3 operations
                                PropertyId = entity.Id,
                                CompanyId = entity.CompanyId
                            };
                            attachment.BuildSearchTerms();
                            
                            // Use repository directly to save the attachment
                            var createdAttachmentResult = await _attachmentRepository.Create(attachment);
                            
                            // Set as default image if this is the default index (store for later)
                            if (i == 0 || (dto.DefaultImageId != null && dto.DefaultImageId == i.ToString()))
                            {
                                if (createdAttachmentResult.IsSuccess() && createdAttachmentResult.Data != null)
                                {
                                    defaultAttachmentId = createdAttachmentResult.Data.Id;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            // Continue with other images if one fails
                        }
                    }
                }
                
                // Update the property with the default attachment using repository method to avoid concurrency issues
                // This is necessary because _attachmentRepository.Create already called SaveChangesAsync
                if (defaultAttachmentId.HasValue)
                {
                    try
                    {
                        await _propertyRepository.UpdateDefaultAttachmentIdAsync(entity.Id, defaultAttachmentId.Value);
                        // Update the entity reference to reflect the change
                        entity.DefaultAttachmentId = defaultAttachmentId.Value;
                    }
                    catch (Exception ex)
                    {
                        // Continue processing
                    }
                }
                
                // Clear the temporary DTO
                _currentPropertyDto = null;
            }
            await base.InCreate_AfterInsertAsync(entity, createModel);
        }

        protected override async Task InUpdate_BeforUpdateAsync<TUpdateModel>(Property entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdatePropertyDto dto)
            {
                // Map all fields from DTO to entity
                _mapper.Map(dto, entity);
                
                // Store DTO for after update processing
                _currentUpdatePropertyDto = dto;
            }
            await base.InUpdate_BeforUpdateAsync(entity, updateModel);
        }

        protected override async Task InUpdate_AfterUpdateAsync<TUpdateModel>(Property entity, TUpdateModel updateModel)
        {
            if (_currentUpdatePropertyDto != null)
            {
                var dto = _currentUpdatePropertyDto;
                Guid? newDefaultAttachmentId = null;
                bool defaultAttachmentChanged = false;
                
                // Get owner name for folder structure
                var ownerName = await GetOwnerNameAsync(entity.ContactId);
                var propertyReference = SanitizeFolderName(entity.Identifier);
                
                // Handle attachments to delete
                if (dto.AttachmentsToDelete != null && dto.AttachmentsToDelete.Count > 0)
                {
                    foreach (var attachmentId in dto.AttachmentsToDelete)
                    {
                        try
                        {
                            // Get attachment to find its S3 key
                            var attachmentResult = await _attachmentService.GetByIdAsync<AttachmentDto>(attachmentId);
                            if (attachmentResult.IsSuccess() && attachmentResult.Data != null)
                            {
                                var attachment = attachmentResult.Data;
                                
                                // Delete from S3 using StorageHash
                                if (!string.IsNullOrEmpty(attachment.StorageHash))
                                {
                                    var s3Key = S3PathConstants.BuildAttachmentKey(
                                        entity.CompanyId.ToString(),
                                        attachment.StorageHash,
                                        attachment.FileName
                                    );
                                    await _s3StorageService.DeleteAsync(GetBucketName(), s3Key);
                                }
                                
                                // Delete from database (calls SaveChangesAsync internally)
                                await _attachmentService.DeleteAsync(attachmentId);
                                
                                // If this was the default attachment, clear it
                                if (entity.DefaultAttachmentId == attachmentId)
                                {
                                    newDefaultAttachmentId = null;
                                    defaultAttachmentChanged = true;
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            // Continue with other attachments
                        }
                    }
                }
                
                // Handle new images to add
                if (dto.ImagesToAdd != null && dto.ImagesToAdd.Count > 0)
                {
                    for (int i = 0; i < dto.ImagesToAdd.Count; i++)
                    {
                        var image = dto.ImagesToAdd[i];
                        
                        if (!string.IsNullOrEmpty(image.Base64Content) && IsValidBase64String(image.Base64Content))
                        {
                            try
                            {
                                var fileExtension = GetImageExtensionFromBase64(image.Base64Content);
                                var originalFileName = string.IsNullOrEmpty(image.FileName) 
                                    ? $"image_{Guid.NewGuid()}{fileExtension}" 
                                    : image.FileName;
                                
                                // Ensure the filename has an extension
                                if (!System.IO.Path.HasExtension(originalFileName))
                                {
                                    originalFileName = $"{originalFileName}{fileExtension}";
                                }

                                // Sanitize the filename to remove spaces and invalid characters
                                originalFileName = SanitizeFileName(originalFileName);

                                // Convert base64 to bytes first
                                var fileBytes = Convert.FromBase64String(image.Base64Content);

                                // Generate immutable storage hash based on CompanyId and file content
                                // This ensures same file + same company = same hash (works even when name changes)
                                var storageHash = GenerateStorageHash(entity.CompanyId, fileBytes);
                                
                                // Upload to S3 using StorageHash
                                var s3Key = S3PathConstants.BuildAttachmentKey(
                                    entity.CompanyId.ToString(),
                                    storageHash,
                                    originalFileName
                                );
                                
                                using (var stream = new System.IO.MemoryStream(fileBytes))
                                {
                                    await _s3StorageService.UploadFileAsync(GetBucketName(), s3Key, stream);
                                }
                                
                                // Create attachment record in database
                                var attachment = new Attachment
                                {
                                    Id = Guid.NewGuid(), // Explicitly set ID
                                    FileName = originalFileName,
                                    OriginalFileName = originalFileName,
                                    FileExtension = Path.GetExtension(originalFileName),
                                    FileSize = fileBytes.Length,
                                    Root = $"{ownerName}/property/{propertyReference}",  // Keep Root for folder organization
                                    StorageHash = storageHash,  // Use StorageHash for S3 operations
                                    PropertyId = entity.Id,
                                    CompanyId = entity.CompanyId
                                };
                                attachment.BuildSearchTerms();
                                
                                // Use repository directly to save the attachment
                                var createdAttachmentResult = await _attachmentRepository.Create(attachment);
                                
                                // If this image is marked as default, set it as the property's default attachment
                                // This takes precedence over dto.DefaultAttachmentId
                                if (image.IsDefault && createdAttachmentResult.IsSuccess() && createdAttachmentResult.Data != null)
                                {
                                    newDefaultAttachmentId = createdAttachmentResult.Data.Id;
                                    defaultAttachmentChanged = true;
                                }
                            }
                            catch (Exception ex)
                            {
                                // Continue processing
                            }
                        }
                    }
                }
                
                // Update default attachment if specified in DTO
                // Only process if no new image was marked as default (new images marked as default take precedence)
                if (!defaultAttachmentChanged && dto.DefaultAttachmentId.HasValue && dto.DefaultAttachmentId != entity.DefaultAttachmentId)
                {
                    newDefaultAttachmentId = dto.DefaultAttachmentId;
                    defaultAttachmentChanged = true;
                }
                
                // Update the property's default attachment using repository method to avoid concurrency issues
                // This is necessary because _attachmentRepository.Create/DeleteAsync already called SaveChangesAsync
                if (defaultAttachmentChanged)
                {
                    try
                    {
                        await _propertyRepository.UpdateDefaultAttachmentIdAsync(entity.Id, newDefaultAttachmentId);
                        // Update the entity reference to reflect the change
                        entity.DefaultAttachmentId = newDefaultAttachmentId;
                    }
                    catch (Exception ex)
                    {
                        // Continue processing
                    }
                }
                
                // Clear the temporary DTO
                _currentUpdatePropertyDto = null;
            }
            await base.InUpdate_AfterUpdateAsync(entity, updateModel);
        }

        // Store the includeRelated flag for use in InGet_AfterMappingAsync
        private bool _includeRelated = false;

        /// <summary>
        /// Override GetByIdAsync to support conditional loading of related entities
        /// </summary>
        public override async Task<Result<TOut>> GetByIdAsync<TOut>(Guid id)
        {
            _includeRelated = false; // Default to false for backward compatibility
            var entityResult = await _propertyRepository.GetByIdWithRelatedAsync(id, false);
            if (entityResult is null || entityResult.Data is null)
                return Result.Failure<TOut>();

            var mappedEntity = _mapper.Map<TOut>(entityResult.Data);

            /*hook after mapping the entity*/
            await InGet_AfterMappingAsync(entityResult.Data, mappedEntity);

            return Result.Success(mappedEntity);
        }

        /// <summary>
        /// Get a property by ID with optional related entities
        /// </summary>
        public async Task<Result<TOut>> GetByIdAsync<TOut>(Guid id, bool includeRelated)
        {
            _includeRelated = includeRelated;
            var entityResult = await _propertyRepository.GetByIdWithRelatedAsync(id, includeRelated);
            if (entityResult is null || entityResult.Data is null)
                return Result.Failure<TOut>();

            var mappedEntity = _mapper.Map<TOut>(entityResult.Data);

            /*hook after mapping the entity*/
            await InGet_AfterMappingAsync(entityResult.Data, mappedEntity);

            return Result.Success(mappedEntity);
        }

        protected override async Task InGet_AfterMappingAsync<TOut>(Property entity, TOut mappedEntity)
        {
            if (mappedEntity is PropertyDto dto)
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
                    catch (Exception ex)
                    {
                        dto.DefaultAttachmentUrl = null;
                    }
                }

                // Get owner name - use Contact from entity if loaded, otherwise query separately
                try
                {
                    if (entity.Contact != null)
                    {
                        // Use the Contact from the entity if it's loaded
                        dto.OwnerName = GetOwnerNameForDisplay(entity.Contact);
                    }
                    else
                    {
                        // Fallback to querying separately if Contact wasn't loaded
                        var ownerName = await GetOwnerNameForDisplayAsync(entity.ContactId);
                        dto.OwnerName = ownerName;
                    }
                }
                catch (Exception ex)
                {
                    dto.OwnerName = "Unknown Owner";
                }

                // Generate avatar URL for contact if it exists
                if (dto.Contact != null && !string.IsNullOrEmpty(dto.Contact.Avatar) && entity.Contact != null)
                {
                    try
                    {
                        var avatarUrl = await GenerateContactAvatarUrlAsync(entity.Contact);
                        if (!string.IsNullOrEmpty(avatarUrl))
                        {
                            dto.Contact.Avatar = avatarUrl;
                        }
                    }
                    catch (Exception ex)
                    {
                        // If avatar URL generation fails, leave avatar as is (filename)
                        _logger.LogWarning(ex, "Failed to generate avatar URL for contact {ContactId}", entity.Contact.Id);
                    }
                }

                // Get all attachments/images for this property
                try
                {
                    dto.Attachments = new List<AttachmentDetailsDto>();
                    var attachmentsResult = await _attachmentService.GetAllAttachmentsForPropertyAsync(entity.Id);
                    
                    if (attachmentsResult != null && attachmentsResult.Any())
                    {
                        foreach (var attachment in attachmentsResult)
                        {
                            try
                            {
                                if (!string.IsNullOrEmpty(attachment.StorageHash))
                                {
                                    // Build the S3 key from StorageHash
                                    var s3Key = S3PathConstants.BuildAttachmentKey(
                                        entity.CompanyId.ToString(),
                                        attachment.StorageHash,
                                        attachment.FileName
                                    );
                                    // Use cached URL from attachment entity
                                    var signedUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                        GetBucketName(), 
                                        s3Key, 
                                        attachment.Url, 
                                        attachment.UrlExpiresAt, 
                                        24);
                                
                                // Update cached URL if it was regenerated
                                if (signedUrl != attachment.Url)
                                {
                                    attachment.Url = signedUrl;
                                    attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                    await _attachmentRepository.Update(attachment);
                                }
                                
                                dto.Attachments.Add(new AttachmentDetailsDto
                                {
                                    Id = attachment.Id,
                                    Url = signedUrl,
                                    FileName = attachment.FileName
                                });
                                }
                            }
                            catch (Exception ex)
                            {
                                // Continue with other attachments
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    dto.Attachments = new List<AttachmentDetailsDto>();
                }

                // Only load related entities if includeRelated is true
                if (_includeRelated)
                {
                    // Ensure maintenances are sorted and not null
                    if (dto.Maintenances != null && dto.Maintenances.Count > 0)
                    {
                        dto.Maintenances = dto.Maintenances
                            .OrderByDescending(m => m.ScheduledDateTime)
                            .ToList();
                    }
                    else
                    {
                        dto.Maintenances = new List<PropertyMaintenanceSummaryDto>();
                    }

                    // Map leases from entity (already loaded in repository)
                    // Always initialize leases list, even if empty
                    dto.Leases = new List<LeaseDto>();
                    if (entity.Leases != null && entity.Leases.Any())
                    {
                        dto.Leases = _mapper.Map<List<LeaseDto>>(entity.Leases);
                        
                        // Manually set PropertyName and PropertyAddress for each lease
                        // since we can't include Property from Lease (would create a cycle)
                        // but we already have the Property entity loaded
                        foreach (var leaseDto in dto.Leases)
                        {
                            // Find the corresponding lease entity
                            var leaseEntity = entity.Leases.FirstOrDefault(l => l.Id == leaseDto.Id);
                            
                            leaseDto.PropertyName = entity.Name;
                            leaseDto.PropertyAddress = entity.Address;
                            
                            // Set tenant information from Contact if available
                            if (leaseEntity?.Contact != null)
                            {
                                // Set tenant phone (first phone from list)
                                if (leaseEntity.Contact.Phones != null && leaseEntity.Contact.Phones.Count > 0)
                                {
                                    leaseDto.TenantPhone = leaseEntity.Contact.Phones[0];
                                }
                                
                                // Set tenant identifier
                                if (!string.IsNullOrEmpty(leaseEntity.Contact.Identifier))
                                {
                                    leaseDto.TenantIdentifier = leaseEntity.Contact.Identifier;
                                }
                                
                                // Generate tenant avatar URL
                                if (!string.IsNullOrEmpty(leaseEntity.Contact.Avatar))
                                {
                                    try
                                    {
                                        var bucketName = GetBucketName();
                                        string key;

                                        // Use hash-based key if available (new avatars), otherwise fallback to folder-based (old avatars)
                                        if (!string.IsNullOrEmpty(leaseEntity.Contact.AvatarStorageHash))
                                        {
                                            // Use hash-based key (immutable, never changes even when name changes)
                                            key = S3PathConstants.BuildContactAvatarKey(
                                                leaseEntity.Contact.CompanyId.ToString(),
                                                leaseEntity.Contact.AvatarStorageHash,
                                                leaseEntity.Contact.Avatar
                                            );
                                        }
                                        else
                                        {
                                            // Fallback for old avatars without hash (backward compatibility)
                                            var contactFolder = GetContactFolderNameFromProperties(
                                                leaseEntity.Contact.FirstName,
                                                leaseEntity.Contact.LastName,
                                                leaseEntity.Contact.CompanyName,
                                                leaseEntity.Contact.IsACompany,
                                                leaseEntity.Contact.Id
                                            );
                                            key = S3PathConstants.BuildContactAvatarKeyWithFolder(
                                                leaseEntity.Contact.CompanyId.ToString(),
                                                contactFolder,
                                                leaseEntity.Contact.Avatar
                                            );
                                        }

                                        // Use cached URL (for avatars, we don't have an attachment entity, so pass null)
                                        leaseDto.TenantAvatarUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(bucketName, key, null, null, 24);
                                    }
                                    catch (Exception ex)
                                    {
                                        leaseDto.TenantAvatarUrl = null;
                                        _logger.LogWarning(ex, "Failed to generate tenant avatar URL for lease {LeaseId}", leaseDto.Id);
                                    }
                                }
                            }
                            
                            // Set PropertyImageUrl if default attachment exists
                            if (entity.DefaultAttachmentId.HasValue && string.IsNullOrEmpty(leaseDto.PropertyImageUrl))
                            {
                                try
                                {
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
                                            
                                            leaseDto.PropertyImageUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                GetBucketName(), 
                                                s3Key, 
                                                attachmentEntity.Url, 
                                                attachmentEntity.UrlExpiresAt, 
                                                24);
                                        }
                                        
                                        // Update cached URL if it was regenerated
                                        if (leaseDto.PropertyImageUrl != attachmentEntity.Url)
                                        {
                                            attachmentEntity.Url = leaseDto.PropertyImageUrl;
                                            attachmentEntity.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                            await _attachmentRepository.Update(attachmentEntity);
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    leaseDto.PropertyImageUrl = null;
                                }
                            }
                        }
                    }

                    // Map keys from entity (already loaded in repository)
                    // Always initialize keys list, even if empty
                    dto.Keys = new List<KeyDto>();
                    if (entity.Keys != null && entity.Keys.Any())
                    {
                        dto.Keys = _mapper.Map<List<KeyDto>>(entity.Keys);
                        
                        // Populate attachments and default attachment URL for each key
                        foreach (var keyDto in dto.Keys)
                        {
                            // Find the corresponding key entity
                            var keyEntity = entity.Keys.FirstOrDefault(k => k.Id == keyDto.Id);
                            
                            if (keyEntity != null)
                            {
                                // Generate default attachment URL if DefaultAttachmentId exists
                                if (keyEntity.DefaultAttachmentId.HasValue)
                                {
                                    try
                                    {
                                        var attachmentEntityResult = await _attachmentRepository.GetByIdAsync(keyEntity.DefaultAttachmentId.Value);
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
                                                
                                                keyDto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                    GetBucketName(), 
                                                    s3Key, 
                                                    attachmentEntity.Url, 
                                                    attachmentEntity.UrlExpiresAt, 
                                                    24);
                                                
                                                // Update cached URL if it was regenerated
                                                if (keyDto.DefaultAttachmentUrl != attachmentEntity.Url)
                                                {
                                                    attachmentEntity.Url = keyDto.DefaultAttachmentUrl;
                                                    attachmentEntity.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                                    await _attachmentRepository.Update(attachmentEntity);
                                                }
                                            }
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        keyDto.DefaultAttachmentUrl = null;
                                    }
                                }

                                // Get all attachments/images for this key
                                try
                                {
                                    keyDto.Attachments = new List<AttachmentDetailsDto>();
                                    var allAttachmentsResult = await _attachmentRepository.GetAllAsync();
                                    if (allAttachmentsResult.IsSuccess() && allAttachmentsResult.Data != null)
                                    {
                                        var keyAttachments = allAttachmentsResult.Data
                                            .Where(a => a.KeyId == keyEntity.Id && a.CompanyId == entity.CompanyId && !a.IsDeleted)
                                            .ToList();
                                        
                                        if (keyAttachments != null && keyAttachments.Any())
                                        {
                                            foreach (var attachment in keyAttachments)
                                            {
                                                try
                                                {
                                                    if (!string.IsNullOrEmpty(attachment.StorageHash))
                                                    {
                                                        var s3Key = S3PathConstants.BuildAttachmentKey(
                                                            entity.CompanyId.ToString(),
                                                            attachment.StorageHash,
                                                            attachment.FileName
                                                        );
                                                        
                                                        var signedUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                            GetBucketName(), 
                                                            s3Key, 
                                                            attachment.Url, 
                                                            attachment.UrlExpiresAt, 
                                                            24);
                                                        
                                                        // Update cached URL if it was regenerated
                                                        if (signedUrl != attachment.Url)
                                                        {
                                                            attachment.Url = signedUrl;
                                                            attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                                            await _attachmentRepository.Update(attachment);
                                                        }
                                                        
                                                        keyDto.Attachments.Add(new AttachmentDetailsDto
                                                        {
                                                            Id = attachment.Id,
                                                            Url = signedUrl,
                                                            FileName = attachment.FileName
                                                        });
                                                    }
                                                }
                                                catch (Exception ex)
                                                {
                                                    // Continue with other attachments
                                                }
                                            }
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    keyDto.Attachments = new List<AttachmentDetailsDto>();
                                }
                            }
                        }
                    }
                }
                else
                {
                    // Initialize empty collections when not including related entities
                    dto.Maintenances = new List<PropertyMaintenanceSummaryDto>();
                    dto.Leases = new List<LeaseDto>();
                    dto.Keys = new List<KeyDto>();
                    dto.Transactions = new List<TransactionDto>();
                }
            }
            await base.InGet_AfterMappingAsync(entity, mappedEntity);
        }

        protected override Task InPagedResult_BeforeListRetrievalAsync<IFilter>(IFilter filterOption)
        {
            filterOption.CompanyId = _session.CompanyId;
            return base.InPagedResult_BeforeListRetrievalAsync(filterOption);
        }

        public override async Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption)
        {
            // Call base implementation to get the paged result
            var result = await base.GetAsPagedResultAsync<TOut, IFilter>(filterOption);
            
            if (!result.IsSuccess() || result.Data == null)
            {
                return result;
            }

            // Post-process the DTOs to add image URLs and owner names
            if (typeof(TOut) == typeof(PropertyDto))
            {
                var paginatedList = result.Data;
                var dtos = paginatedList.Result as List<PropertyDto>;
                
                if (dtos != null && dtos.Count > 0)
                {
                    foreach (var dto in dtos)
                    {
                        // Only generate image URLs if pagination is NOT being ignored
                        // When Ignore=true (e.g., for dropdowns), skip expensive S3 calls
                        if (!filterOption.Ignore)
                        {
                            // Generate default attachment URL
                            // Priority: 1) Use DefaultAttachmentId if set, 2) Use first attachment if available
                            if (dto.DefaultAttachmentId.HasValue)
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
                                    else
                                    {
                                        // DefaultAttachmentId is set but attachment not found, fall back to first attachment
                                        List<Attachment> propertyAttachments = null;
                                        try
                                        {
                                            propertyAttachments = await _attachmentService.GetAllAttachmentsForPropertyAsync(dto.Id);
                                        }
                                        catch (Exception ex)
                                        {
                                            // Continue processing
                                        }
                                        
                                        if (propertyAttachments != null && propertyAttachments.Count > 0)
                                        {
                                            var firstAttachment = propertyAttachments.First();
                                            
                                            // Check if cached URL is still valid (with 1 hour buffer for safety)
                                            var bufferTime = TimeSpan.FromHours(1);
                                            var hasValidCache = !string.IsNullOrEmpty(firstAttachment.Url) 
                                                && firstAttachment.UrlExpiresAt.HasValue 
                                                && DateTimeOffset.UtcNow < firstAttachment.UrlExpiresAt.Value.Subtract(bufferTime);
                                            
                                            if (hasValidCache)
                                            {
                                                // Use cached URL directly without calling S3 service
                                                dto.DefaultAttachmentUrl = firstAttachment.Url;
                                            }
                                            else
                                            {
                                                // Cache is invalid or missing, generate new URL
                                                if (!string.IsNullOrEmpty(firstAttachment.StorageHash))
                                                {
                                                    var s3Key = S3PathConstants.BuildAttachmentKey(
                                                        dto.CompanyId.ToString(),
                                                        firstAttachment.StorageHash,
                                                        firstAttachment.FileName
                                                    );
                                                dto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                    GetBucketName(), 
                                                    s3Key, 
                                                    firstAttachment.Url, 
                                                    firstAttachment.UrlExpiresAt, 
                                                    24);
                                                if (dto.DefaultAttachmentUrl != firstAttachment.Url)
                                                {
                                                    firstAttachment.Url = dto.DefaultAttachmentUrl;
                                                    firstAttachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                                    await _attachmentRepository.Update(firstAttachment);
                                                }
                                                }
                                            }
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    // Try fallback to first attachment on error
                                    List<Attachment> propertyAttachments = null;
                                    try
                                    {
                                        propertyAttachments = await _attachmentService.GetAllAttachmentsForPropertyAsync(dto.Id);
                                    }
                                    catch
                                    {
                                        // Continue processing
                                    }
                                    
                                    if (propertyAttachments != null && propertyAttachments.Count > 0)
                                    {
                                        try
                                        {
                                            var firstAttachment = propertyAttachments.First();
                                            
                                            // Check if cached URL is still valid (with 1 hour buffer for safety)
                                            var bufferTime = TimeSpan.FromHours(1);
                                            var hasValidCache = !string.IsNullOrEmpty(firstAttachment.Url) 
                                                && firstAttachment.UrlExpiresAt.HasValue 
                                                && DateTimeOffset.UtcNow < firstAttachment.UrlExpiresAt.Value.Subtract(bufferTime);
                                            
                                            if (hasValidCache)
                                            {
                                                // Use cached URL directly without calling S3 service
                                                dto.DefaultAttachmentUrl = firstAttachment.Url;
                                            }
                                            else
                                            {
                                                // Cache is invalid or missing, generate new URL
                                                if (!string.IsNullOrEmpty(firstAttachment.StorageHash))
                                                {
                                                    var s3Key = S3PathConstants.BuildAttachmentKey(
                                                        dto.CompanyId.ToString(),
                                                        firstAttachment.StorageHash,
                                                        firstAttachment.FileName
                                                    );
                                                dto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                    GetBucketName(), 
                                                    s3Key, 
                                                    firstAttachment.Url, 
                                                    firstAttachment.UrlExpiresAt, 
                                                    24);
                                                if (dto.DefaultAttachmentUrl != firstAttachment.Url)
                                                {
                                                    firstAttachment.Url = dto.DefaultAttachmentUrl;
                                                    firstAttachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                                    await _attachmentRepository.Update(firstAttachment);
                                                }
                                                }
                                            }
                                        }
                                        catch
                                        {
                                            dto.DefaultAttachmentUrl = null;
                                        }
                                    }
                                    else
                                    {
                                        dto.DefaultAttachmentUrl = null;
                                    }
                                }
                            }
                            else
                            {
                                // No DefaultAttachmentId, need to get all attachments to find first one
                                List<Attachment> propertyAttachments = null;    
                                try
                                {
                                    propertyAttachments = await _attachmentService.GetAllAttachmentsForPropertyAsync(dto.Id);
                                }
                                catch (Exception ex)
                                {
                                    // Continue processing
                                }
                                
                                if (propertyAttachments != null && propertyAttachments.Count > 0)
                                {
                                    // Use first attachment as fallback - ensure we use cached URL
                                    try
                                    {
                                        var firstAttachment = propertyAttachments.First();
                                        
                                        // Check if cached URL is still valid (with 1 hour buffer for safety)
                                        var bufferTime = TimeSpan.FromHours(1);
                                        var hasValidCache = !string.IsNullOrEmpty(firstAttachment.Url) 
                                            && firstAttachment.UrlExpiresAt.HasValue 
                                            && DateTimeOffset.UtcNow < firstAttachment.UrlExpiresAt.Value.Subtract(bufferTime);
                                        
                                        if (hasValidCache)
                                        {
                                            // Use cached URL directly without calling S3 service
                                            dto.DefaultAttachmentUrl = firstAttachment.Url;
                                        }
                                        else
                                        {
                                            // Cache is invalid or missing, generate new URL
                                            if (!string.IsNullOrEmpty(firstAttachment.StorageHash))
                                            {
                                                var s3Key = S3PathConstants.BuildAttachmentKey(
                                                    dto.CompanyId.ToString(),
                                                    firstAttachment.StorageHash,
                                                    firstAttachment.FileName
                                                );
                                                dto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                    GetBucketName(), 
                                                    s3Key, 
                                                    firstAttachment.Url, 
                                                    firstAttachment.UrlExpiresAt, 
                                                    24);
                                            }
                                            // Update cached URL in repository if it was regenerated
                                            if (dto.DefaultAttachmentUrl != firstAttachment.Url)
                                            {
                                                firstAttachment.Url = dto.DefaultAttachmentUrl;
                                                firstAttachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                                await _attachmentRepository.Update(firstAttachment);
                                            }
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        dto.DefaultAttachmentUrl = null;
                                    }
                                }
                            }
                        }

                        // Get owner name - always retrieve this as it's not expensive
                        try
                        {
                            var ownerName = await GetOwnerNameForDisplayAsync(dto.ContactId);
                            dto.OwnerName = ownerName;
                        }
                        catch (Exception ex)
                        {
                            dto.OwnerName = "Unknown Owner";
                        }
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

        private async Task<string> GetOwnerNameAsync(Guid contactId)
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

        private string GetOwnerNameForDisplay(Contact contact)
        {
            if (contact == null)
                return "Unknown Owner";
            
            if (contact.IsACompany && !string.IsNullOrEmpty(contact.CompanyName))
            {
                return contact.CompanyName;
            }
            
            var fullName = $"{contact.FirstName} {contact.LastName}".Trim();
            if (!string.IsNullOrEmpty(fullName))
            {
                return fullName;
            }
            
            return "Unknown Owner";
        }

        private async Task<string> GetOwnerNameForDisplayAsync(Guid contactId)
        {
            try
            {
                var contactResult = await _contactRepository.GetByIdAsync(contactId);
                
                if (contactResult.IsSuccess() && contactResult.Data != null)
                {
                    return GetOwnerNameForDisplay(contactResult.Data);
                }
                
                return "Unknown Owner";
            }
            catch
            {
                return "Unknown Owner";
            }
        }

        private bool IsValidBase64String(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return false;

            try
            {
                Convert.FromBase64String(base64String);
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
            if (base64String.StartsWith("/9j/"))
                return ".jpg";
            if (base64String.StartsWith("iVBORw0KGgo"))
                return ".png";
            if (base64String.StartsWith("R0lGOD"))
                return ".gif";
            if (base64String.StartsWith("UklGR"))
                return ".webp";

            // Default to .jpg if format cannot be determined
            return ".jpg";
        }

        private long CalculateBase64FileSize(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
                return 0;

            // Count padding characters
            int padding = 0;
            if (base64String.EndsWith("=="))
                padding = 2;
            else if (base64String.EndsWith("="))
                padding = 1;

            // Calculate size in bytes
            long size = ((base64String.Length * 3) / 4) - padding;
            return size;
        }

        private string SanitizeFileName(string fileName)
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

        /// <summary>
        /// Generate avatar URL for a contact
        /// </summary>
        private async Task<string> GenerateContactAvatarUrlAsync(Contact contact)
        {
            if (string.IsNullOrEmpty(contact.Avatar))
                return string.Empty;

            try
            {
                var bucketName = GetBucketName();
                string key;

                // Use hash-based key if available (new avatars), otherwise fallback to folder-based (old avatars)
                if (!string.IsNullOrEmpty(contact.AvatarStorageHash))
                {
                    // Use hash-based key (immutable, never changes even when name changes)
                    key = S3PathConstants.BuildContactAvatarKey(
                        contact.CompanyId.ToString(),
                        contact.AvatarStorageHash,
                        contact.Avatar
                    );
                }
                else
                {
                    // Fallback for old avatars without hash (backward compatibility)
                    var contactFolder = GetContactFolderNameFromProperties(
                        contact.FirstName,
                        contact.LastName,
                        contact.CompanyName,
                        contact.IsACompany,
                        contact.Id
                    );
                    key = S3PathConstants.BuildContactAvatarKeyWithFolder(
                        contact.CompanyId.ToString(),
                        contactFolder,
                        contact.Avatar
                    );
                }

                // Use cached URL (for avatars, we don't have an attachment entity, so pass null)
                var avatarUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(bucketName, key, null, null, 24);
                return avatarUrl;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating avatar URL for contact {ContactId}", contact.Id);
                return string.Empty;
            }
        }

        /// <summary>
        /// Get contact folder name from contact properties (for backward compatibility with old avatars)
        /// </summary>
        private string GetContactFolderNameFromProperties(
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

            return SanitizeFolderName(contactName);
        }

        private string SanitizeFolderName(string folderName)
        {
            if (string.IsNullOrEmpty(folderName))
                return folderName;

            // Replace invalid characters and spaces with underscores
            var invalidChars = Path.GetInvalidPathChars();
            foreach (var c in invalidChars)
            {
                folderName = folderName.Replace(c, '_');
            }

            // Replace spaces with underscores
            folderName = folderName.Replace(' ', '_');

            // Remove any other potentially problematic characters
            folderName = System.Text.RegularExpressions.Regex.Replace(folderName, @"[^\w\-]", "_");

            return folderName;
        }


        #endregion
        
        #region Building Attachment Operations
        
        /// <summary>
        /// Update the building assignment for a property without affecting images or other data
        /// Set BuildingId to null to detach, or provide a Guid to attach
        /// </summary>
        public async Task<Result<PropertyDto>> UpdatePropertyBuildingAsync(UpdatePropertyBuildingDto dto)
        {
            try
            {
                // Validate that the property exists
                var propertyResult = await _propertyRepository.GetByIdAsync(dto.PropertyId);
                if (!propertyResult.IsSuccess() || propertyResult.Data == null)
                {
                    return Result.Failure<PropertyDto>();
                }
                
                var property = propertyResult.Data;
                
                // Ensure the property belongs to the current company
                if (property.CompanyId != _session.CompanyId)
                {
                    return Result.Failure<PropertyDto>();
                }
                
                // Update only the BuildingId using the dedicated repository method
                // This works for both attach (with BuildingId) and detach (with null)
                await _propertyRepository.UpdateBuildingIdAsync(dto.PropertyId, dto.BuildingId);
                
                // Get the updated property and return it as DTO
                var updatedPropertyResult = await GetByIdAsync<PropertyDto>(dto.PropertyId);
                return updatedPropertyResult;
            }
            catch (Exception ex)
            {
                return Result.Failure<PropertyDto>();
            }
        }

        public async Task<Result<PropertyDto>> UpdatePropertyVisibilityAsync(UpdatePropertyVisibilityDto dto)
        {
            try
            {
                var propertyResult = await _propertyRepository.GetByIdAsync(dto.PropertyId);
                if (!propertyResult.IsSuccess() || propertyResult.Data == null)
                {
                    return Result.Failure<PropertyDto>();
                }

                var property = propertyResult.Data;

                if (property.CompanyId != _session.CompanyId)
                {
                    return Result.Failure<PropertyDto>();
                }

                await _propertyRepository.UpdateVisibilityAsync(dto.PropertyId, dto.IsPublic, dto.IsPublicAdresse, dto.IsReservationShow);

                return await GetByIdAsync<PropertyDto>(dto.PropertyId);
            }
            catch (Exception ex)
            {
                return Result.Failure<PropertyDto>();
            }
        }

        public async Task<Result<PublicPropertyDto>> GetPublicPropertyByIdAsync(Guid propertyId)
        {
            try
            {
                var property = await _propertyRepository.GetPublicPropertyByIdAsync(propertyId);
                if (property == null)
                {
                    return Result.Failure<PublicPropertyDto>();
                }

                var dto = _mapper.Map<PublicPropertyDto>(property);
                dto.Attachments = new List<AttachmentDetailsDto>();
                dto.IsAddressPublic = property.IsPublicAdresse;
                dto.IsReservationShow = property.IsReservationShow;

                if (!property.IsPublicAdresse)
                {
                    dto.Address = null;
                }

                // Company information
                if (property.Company != null)
                {
                    if (string.IsNullOrWhiteSpace(dto.CompanyAddress))
                    {
                        var addressParts = new List<string>();
                        if (!string.IsNullOrWhiteSpace(property.Company.Address))
                        {
                            addressParts.Add(property.Company.Address);
                        }
                        if (!string.IsNullOrWhiteSpace(property.Company.City))
                        {
                            addressParts.Add(property.Company.City);
                        }

                        dto.CompanyAddress = addressParts.Any()
                            ? string.Join(", ", addressParts)
                            : null;
                    }

                    if (!string.IsNullOrEmpty(property.Company.Image))
                    {
                        try
                        {
                            if (property.Company.Image.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                            {
                                dto.CompanyLogoUrl = property.Company.Image;
                            }
                            else
                            {
                                // For company logos, use cached URL (no attachment entity, so pass null)
                                dto.CompanyLogoUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(GetBucketName(), property.Company.Image, null, null, 24);
                            }
                        }
                        catch
                        {
                            dto.CompanyLogoUrl = null;
                        }
                    }
                }

                // Load attachments and default image
                // For public properties, load attachments directly using property's CompanyId
                // instead of using _attachmentService which filters by session CompanyId
                try
                {
                    // Get all attachments for this property using the property's CompanyId
                    var allAttachmentsResult = await _attachmentRepository.GetAllAsync();
                    if (allAttachmentsResult.IsSuccess() && allAttachmentsResult.Data != null)
                    {
                        var attachments = allAttachmentsResult.Data
                            .Where(a => a.PropertyId == property.Id && a.CompanyId == property.CompanyId && !a.IsDeleted)
                            .ToList();

                        if (attachments != null && attachments.Any())
                        {
                            foreach (var attachment in attachments)
                            {
                                try
                                {
                                    if (!string.IsNullOrEmpty(attachment.StorageHash))
                                    {
                                        var s3Key = S3PathConstants.BuildAttachmentKey(
                                            property.CompanyId.ToString(),
                                            attachment.StorageHash,
                                            attachment.FileName
                                        );
                                        var signedUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                            GetBucketName(), 
                                            s3Key, 
                                            attachment.Url, 
                                            attachment.UrlExpiresAt, 
                                            24);
                                    if (signedUrl != attachment.Url)
                                    {
                                        attachment.Url = signedUrl;
                                        attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                        await _attachmentRepository.Update(attachment);
                                    }
                                    dto.Attachments.Add(new AttachmentDetailsDto
                                    {
                                        Id = attachment.Id,
                                        Url = signedUrl,
                                        FileName = attachment.FileName
                                    });
                                    }
                                }
                                catch
                                {
                                    // Ignore individual attachment errors
                                }
                            }
                        }
                    }
                }
                catch
                {
                    // Ignore attachment loading errors
                }

                // Determine default image URL
                if (property.DefaultAttachmentId.HasValue)
                {
                    try
                    {
                        // Get attachment entity directly from repository to access cached URL
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
                    catch
                    {
                        dto.DefaultAttachmentUrl = null;
                    }
                }
                else if (dto.Attachments != null && dto.Attachments.Count > 0)
                {
                    dto.DefaultAttachmentUrl = dto.Attachments.First().Url;
                }

                return Result.Success(dto);
            }
            catch (Exception)
            {
                return Result.Failure<PublicPropertyDto>();
            }
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

        #endregion

        /// <summary>
        /// Update the archive status of a property
        /// </summary>
        public async Task<Result<PropertyDto>> UpdateArchiveStatusAsync(UpdatePropertyArchiveStatusDto dto)
        {
            try
            {
                var propertyResult = await _propertyRepository.GetByIdAsync(dto.PropertyId);
                if (!propertyResult.IsSuccess() || propertyResult.Data == null)
                {
                    return Result.Failure<PropertyDto>();
                }

                var property = propertyResult.Data;

                // Ensure the property belongs to the current company
                if (property.CompanyId != _session.CompanyId)
                {
                    return Result.Failure<PropertyDto>();
                }

                // Update archive status
                property.IsArchived = dto.IsArchived;
                property.LastModifiedOn = DateTimeOffset.UtcNow;
                property.BuildSearchTerms();

                var updateResult = await _propertyRepository.Update(property);
                if (!updateResult.IsSuccess())
                {
                    return Result.Failure<PropertyDto>();
                }

                // Return updated property as DTO
                return await GetByIdAsync<PropertyDto>(dto.PropertyId);
            }
            catch (Exception ex)
            {
                return Result.Failure<PropertyDto>();
            }
        }
    }
}
