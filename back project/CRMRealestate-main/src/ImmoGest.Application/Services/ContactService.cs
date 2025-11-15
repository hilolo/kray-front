using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Auth.Interfaces;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using ResultNet;
using ImmoGest.Domain.Constants;
using System.Security.Cryptography;
using System.Text;

namespace ImmoGest.Application.Services
{
    public class ContactService : DataServiceBase<Contact>, IContactService
    {
        private readonly IContactRepository _contactRepository;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly ILeaseRepository _leaseRepository;
        private readonly IBankRepository _bankRepository;
        private readonly IMapper _mapper;
        private readonly ISession _session;
        private readonly IS3StorageService _s3StorageService;
        private readonly IConfiguration _configuration;
        private readonly FileAttachmentHelper _fileHelper;

        public ContactService(
            IMapper mapper,
            IContactRepository contactRepository,
            IAttachmentRepository attachmentRepository,
            IPropertyRepository propertyRepository,
            ILeaseRepository leaseRepository,
            IBankRepository bankRepository,
            ISession session,
            IS3StorageService s3StorageService,
            IConfiguration configuration,
            FileAttachmentHelper fileHelper)
            : base(mapper, contactRepository)
        {
            _contactRepository = contactRepository;
            _attachmentRepository = attachmentRepository;
            _propertyRepository = propertyRepository;
            _leaseRepository = leaseRepository;
            _bankRepository = bankRepository;
            _mapper = mapper;
            _session = session;
            _s3StorageService = s3StorageService;
            _configuration = configuration;
            _fileHelper = fileHelper;
        }

        protected override async Task InCreate_BeforInsertAsync<TCreateModel>(Contact entity, TCreateModel createModel)
        {
            if (createModel is CreateContactDto dto)
            {
                // Generate a new Guid for the entity if it's empty (needed for S3 path)
                if (entity.Id == Guid.Empty)
                {
                    entity.Id = Guid.NewGuid();
                }
                
                // EF Core Value Converter handles Phones serialization automatically

                // Set CompanyId first (needed for S3 path)
                entity.CompanyId = _session.CompanyId;

                // Handle avatar upload if provided (same logic as update)
                if (!string.IsNullOrEmpty(dto.Avatar) && IsValidBase64String(dto.Avatar))
                {
                    try
                    {
                        var fileExtension = GetImageExtensionFromBase64(dto.Avatar);

                        // Convert base64 to bytes first
                        var fileBytes = Convert.FromBase64String(dto.Avatar);

                        // Generate immutable storage hash based on CompanyId and file content
                        // This ensures same file + same company = same hash (works even when name changes)
                        var avatarStorageHash = GenerateAvatarStorageHash(entity.CompanyId, fileBytes);
                        entity.AvatarStorageHash = avatarStorageHash;

                        // Generate unique filename based on hash to ensure consistency
                        var uniqueFileName = $"{avatarStorageHash.Substring(0, 8)}{fileExtension}";

                        // Build S3 key using hash instead of folder name
                        var bucketName = GetBucketName();
                        var s3Key = S3PathConstants.BuildContactAvatarKey(
                            entity.CompanyId.ToString(),
                            avatarStorageHash,
                            uniqueFileName
                        );

                        // Upload to S3 using the hash-based key
                        using (var stream = new MemoryStream(fileBytes))
                        {
                            await _s3StorageService.UploadFileAsync(bucketName, s3Key, stream);
                        }
                        
                        // Store only the filename (not the full path)
                        entity.Avatar = uniqueFileName;
                    }
                    catch (Exception ex)
                    {
                        // Continue without avatar if upload fails
                        entity.Avatar = null;
                        entity.AvatarStorageHash = null;
                    }
                }
                else
                {
                    entity.Avatar = null;
                    entity.AvatarStorageHash = null;
                }

                // Handle attachments upload if provided
                if (dto.Attachments != null && dto.Attachments.Count > 0)
                {
                    entity.Attachments = new List<Attachment>();
                    
                    foreach (var docDto in dto.Attachments)
                    {
                        if (!string.IsNullOrEmpty(docDto.Base64Content) && IsValidBase64String(docDto.Base64Content))
                        {
                            try
                            {
                                var fileExtension = GetFileExtensionFromBase64(docDto.Base64Content);
                                var originalFileName = string.IsNullOrEmpty(docDto.FileName) ? $"document{fileExtension}" : docDto.FileName;
                                
                                // Ensure the filename has an extension
                                if (!Path.HasExtension(originalFileName))
                                {
                                    originalFileName = $"{originalFileName}{fileExtension}";
                                }

                                // Calculate file size from base64
                                var fileSize = CalculateBase64FileSize(docDto.Base64Content);

                                // Convert base64 to bytes first
                                var fileBytes = Convert.FromBase64String(docDto.Base64Content);

                                // Generate immutable storage hash based on CompanyId and file content
                                // This ensures same file + same company = same hash (works even when name changes)
                                var storageHash = GenerateStorageHash(entity.CompanyId, fileBytes);

                                // Upload to S3 using unified path structure (similar to property)
                                var contactFolder = _fileHelper.GetContactFolderNameFromProperties(
                            entity.FirstName,
                            entity.LastName,
                            entity.CompanyName,
                            entity.IsACompany,
                            entity.Id
                        );
                                var root = S3PathConstants.GetContactAttachmentsPath(contactFolder);
                                
                                // Build S3 key using StorageHash (immutable, never changes)
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
                                
                                var document = new Attachment
                                {
                                    Id = Guid.NewGuid(),
                                    FileName = originalFileName,
                                    OriginalFileName = originalFileName,
                                    FileExtension = fileExtension,
                                    FileSize = fileSize,
                                    Root = S3PathConstants.GetContactAttachmentsPath(contactFolder),
                                    StorageHash = storageHash,  // Use StorageHash for S3 operations
                                    ContactId = entity.Id,
                                    CompanyId = entity.CompanyId
                                };
                                document.BuildSearchTerms();
                                
                                entity.Attachments.Add(document);
                            }
                            catch (Exception ex)
                            {
                                // Continue with other documents if one fails
                            }
                        }
                    }
                }
            }
            await base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override async Task InUpdate_BeforUpdateAsync<TUpdateModel>(Contact entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateContactDto dto)
            {
                // Store the current avatar filename before mapping
                var currentAvatar = entity.Avatar;
                
                // Map all fields from DTO to entity
                _mapper.Map(dto, entity);
                
                // Restore the avatar filename - we'll handle avatar updates separately
                entity.Avatar = currentAvatar;
                
                // Get the avatar value from DTO
                var newAvatarBase64 = dto.Avatar;

                // Handle avatar deletion (when RemoveAvatar flag is true)
                if (dto.RemoveAvatar == true && string.IsNullOrEmpty(newAvatarBase64))
                {
                    if (!string.IsNullOrEmpty(entity.Avatar))
                    {
                        try
                        {
                            var bucketName = GetBucketName();
                            
                            // Use hash-based key if available, otherwise fallback to folder-based (for old avatars)
                            string oldAvatarKey;
                            if (!string.IsNullOrEmpty(entity.AvatarStorageHash))
                            {
                                oldAvatarKey = S3PathConstants.BuildContactAvatarKey(
                                    entity.CompanyId.ToString(),
                                    entity.AvatarStorageHash,
                                    entity.Avatar
                                );
                            }
                            else
                            {
                                // Fallback for old avatars without hash
                                var contactFolder = _fileHelper.GetContactFolderNameFromProperties(
                                    entity.FirstName,
                                    entity.LastName,
                                    entity.CompanyName,
                                    entity.IsACompany,
                                    entity.Id
                                );
                                oldAvatarKey = S3PathConstants.BuildContactAvatarKeyWithFolder(
                                    entity.CompanyId.ToString(),
                                    contactFolder,
                                    entity.Avatar
                                );
                            }

                            await _s3StorageService.DeleteAsync(bucketName, oldAvatarKey);
                        }
                        catch (Exception deleteEx)
                        {
                            // Continue even if deletion fails
                        }
                    }
                    entity.Avatar = null;
                    entity.AvatarStorageHash = null;
                }
                // Handle avatar update if provided as base64 string
                else if (!string.IsNullOrEmpty(newAvatarBase64) && IsValidBase64String(newAvatarBase64))
                {
                    try
                    {
                        var bucketName = GetBucketName();
                        
                        // Delete old avatar if it exists
                        if (!string.IsNullOrEmpty(entity.Avatar))
                        {
                            try
                            {
                                // Use hash-based key if available, otherwise fallback to folder-based (for old avatars)
                                string oldAvatarKey;
                                if (!string.IsNullOrEmpty(entity.AvatarStorageHash))
                                {
                                    oldAvatarKey = S3PathConstants.BuildContactAvatarKey(
                                        entity.CompanyId.ToString(),
                                        entity.AvatarStorageHash,
                                        entity.Avatar
                                    );
                                }
                                else
                                {
                                    // Fallback for old avatars without hash
                                    var contactFolder = _fileHelper.GetContactFolderNameFromProperties(
                                        entity.FirstName,
                                        entity.LastName,
                                        entity.CompanyName,
                                        entity.IsACompany,
                                        entity.Id
                                    );
                                    oldAvatarKey = S3PathConstants.BuildContactAvatarKeyWithFolder(
                                        entity.CompanyId.ToString(),
                                        contactFolder,
                                        entity.Avatar
                                    );
                                }
                                
                                await _s3StorageService.DeleteAsync(bucketName, oldAvatarKey);
                            }
                            catch (Exception deleteEx)
                            {
                                // Continue with upload even if deletion fails
                            }
                        }

                        // Convert base64 to bytes first
                        var fileBytes = Convert.FromBase64String(newAvatarBase64);

                        // Generate immutable storage hash based on CompanyId and file content
                        // This ensures same file + same company = same hash (works even when name changes)
                        var avatarStorageHash = GenerateAvatarStorageHash(entity.CompanyId, fileBytes);
                        entity.AvatarStorageHash = avatarStorageHash;

                        // Upload new avatar using hash-based key
                        var fileExtension = GetImageExtensionFromBase64(newAvatarBase64);
                        var uniqueFileName = $"{avatarStorageHash.Substring(0, 8)}{fileExtension}";
                        
                        var s3Key = S3PathConstants.BuildContactAvatarKey(
                            entity.CompanyId.ToString(),
                            avatarStorageHash,
                            uniqueFileName
                        );

                        // Upload to S3 using the hash-based key
                        using (var stream = new MemoryStream(fileBytes))
                        {
                            await _s3StorageService.UploadFileAsync(bucketName, s3Key, stream);
                        }

                        // Store only the filename (not the full path)
                        entity.Avatar = uniqueFileName;
                    }
                    catch (Exception ex)
                    {
                        // Keep existing avatar if update fails
                        entity.Avatar = currentAvatar;
                    }
                }
                // If Avatar is null or empty string (not edited), preserve existing avatar
                // Frontend sends "" instead of null when image is not edited
                else
                {
                    entity.Avatar = currentAvatar;
                }

                // Initialize Documents collection if null
                if (entity.Attachments == null)
                {
                    entity.Attachments = new List<Attachment>();
                }

                // Handle document deletions (by ID) - Soft Delete in DB + Hard Delete from S3
                if (dto.AttachmentsToDelete != null && dto.AttachmentsToDelete.Any())
                {
                    // Collect documents to soft delete
                    var documentsToSoftDelete = new List<Attachment>();
                    
                    foreach (var documentId in dto.AttachmentsToDelete)
                    {
                        // Find the document in the tracked collection
                        var docToDelete = entity.Attachments.FirstOrDefault(d => d.Id == documentId);
                        if (docToDelete != null)
                        {
                            try
                            {
                                // Delete file from S3 (hard delete)
                                var bucketName = GetBucketName();
                                var contactFolder = _fileHelper.GetContactFolderNameFromProperties(
                            entity.FirstName,
                            entity.LastName,
                            entity.CompanyName,
                            entity.IsACompany,
                            entity.Id
                        );
                                if (!string.IsNullOrEmpty(docToDelete.StorageHash))
                                {
                                    var docKey = S3PathConstants.BuildAttachmentKey(
                                        entity.CompanyId.ToString(),
                                        docToDelete.StorageHash,
                                        docToDelete.FileName
                                    );
                                    await _s3StorageService.DeleteAsync(bucketName, docKey);
                                }
                                
                                // Add to soft delete list
                                documentsToSoftDelete.Add(docToDelete);
                            }
                            catch (Exception deleteEx)
                            {
                                // Continue with soft delete even if S3 deletion fails
                                documentsToSoftDelete.Add(docToDelete);
                            }
                        }
                    }
                    
                    // Soft delete documents in database (sets IsDeleted = true)
                    // Files are deleted from S3 above
                    // The overridden Update method will save all changes in one transaction
                    if (documentsToSoftDelete.Any())
                    {
                        _contactRepository.DeleteContactAttachments(documentsToSoftDelete);
                    }
                }

                // Handle document additions
                if (dto.AttachmentsToAdd != null && dto.AttachmentsToAdd.Any())
                {
                    
                    foreach (var docDto in dto.AttachmentsToAdd)
                    {
                        if (!string.IsNullOrEmpty(docDto.Base64Content) && IsValidBase64String(docDto.Base64Content))
                        {
                            try
                            {
                                var fileExtension = GetFileExtensionFromBase64(docDto.Base64Content);
                                var originalFileName = string.IsNullOrEmpty(docDto.FileName) ? $"document{fileExtension}" : docDto.FileName;
                                
                                // Ensure the filename has an extension
                                if (!Path.HasExtension(originalFileName))
                                {
                                    originalFileName = $"{originalFileName}{fileExtension}";
                                }

                                // Calculate file size from base64
                                var fileSize = CalculateBase64FileSize(docDto.Base64Content);

                                // Convert base64 to bytes first
                                var fileBytes = Convert.FromBase64String(docDto.Base64Content);

                                // Generate immutable storage hash based on CompanyId and file content
                                // This ensures same file + same company = same hash (works even when name changes)
                                var storageHash = GenerateStorageHash(entity.CompanyId, fileBytes);

                                // Upload to S3 using unified path structure (similar to property)
                                var contactFolder = _fileHelper.GetContactFolderNameFromProperties(
                            entity.FirstName,
                            entity.LastName,
                            entity.CompanyName,
                            entity.IsACompany,
                            entity.Id
                        );
                                var root = S3PathConstants.GetContactAttachmentsPath(contactFolder);
                                
                                // Build S3 key using StorageHash (immutable, never changes)
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
                                
                                var document = new Attachment
                                {
                                    Id = Guid.NewGuid(),
                                    FileName = originalFileName,
                                    OriginalFileName = originalFileName,
                                    FileExtension = fileExtension,
                                    FileSize = fileSize,
                                    Root = S3PathConstants.GetContactAttachmentsPath(contactFolder),
                                    StorageHash = storageHash,  // Use StorageHash for S3 operations
                                    ContactId = entity.Id,
                                    CompanyId = entity.CompanyId
                                };
                                document.BuildSearchTerms();
                                
                                entity.Attachments.Add(document);
                            }
                            catch (Exception ex)
                            {
                                // Continue with other documents
                            }
                        }
                    }
                }
                
                // FINAL SAFETY CHECK: Ensure avatar is never null/empty unless explicitly removed
                // This prevents any edge cases where avatar might have been accidentally cleared
                if (string.IsNullOrEmpty(entity.Avatar) && !string.IsNullOrEmpty(currentAvatar) && dto.RemoveAvatar != true)
                {
                    // Avatar was accidentally cleared - restore it
                    entity.Avatar = currentAvatar;
                }
            }
            await base.InUpdate_BeforUpdateAsync(entity, updateModel);
        }

        // Store the includeRelated flag for use in InGet_AfterMappingAsync
        private bool _includeRelated = false;

        /// <summary>
        /// Override GetByIdAsync to support conditional loading of related entities
        /// </summary>
        public override async Task<Result<TOut>> GetByIdAsync<TOut>(Guid id)
        {
            _includeRelated = false; // Default to false for backward compatibility
            return await base.GetByIdAsync<TOut>(id);
        }

        /// <summary>
        /// Get a contact by ID with optional related entities
        /// </summary>
        public async Task<Result<TOut>> GetByIdAsync<TOut>(Guid id, bool includeRelated)
        {
            _includeRelated = includeRelated;
            return await base.GetByIdAsync<TOut>(id);
        }

        protected override async Task InGet_AfterMappingAsync<TOut>(Contact entity, TOut mappedEntity)
        {
            if (mappedEntity is ContactDto dto)
            {
                // EF Core Value Converter handles Phones deserialization automatically

                // Set document count
                dto.AttachmentCount = entity.Attachments?.Count ?? 0;

                // Generate avatar URL if avatar exists
                if (!string.IsNullOrEmpty(entity.Avatar))
                {
                    try
                    {
                        var avatarUrl = await GenerateAvatarUrlAsync(entity);
                        dto.Avatar = avatarUrl;
                    }
                    catch (Exception ex)
                    {
                        dto.Avatar = string.Empty;
                    }
                }

                // Generate document URLs
                if (entity.Attachments != null && entity.Attachments.Any())
                {
                    dto.Attachments = new List<AttachmentDto>();
                    foreach (var doc in entity.Attachments)
                    {
                        try
                        {
                            var documentUrl = await GenerateDocumentUrlAsync(entity, doc);
                            dto.Attachments.Add(new AttachmentDto
                            {
                                Id = doc.Id,
                                FileName = doc.FileName,
                                OriginalFileName = doc.OriginalFileName,
                                FileExtension = doc.FileExtension,
                                FileSize = doc.FileSize,
                                Url = documentUrl,
                                CreatedAt = doc.CreatedOn.DateTime
                            });
                        }
                        catch (Exception ex)
                        {
                            // Continue with other documents
                        }
                    }
                }

                // Only load related entities if includeRelated is true
                if (_includeRelated)
                {
                    // Load related Properties
                    var propertiesFilter = new GetPropertiesFilter
                    {
                        ContactId = entity.Id,
                        Ignore = true,
                        CompanyId = entity.CompanyId
                    };
                    var propertiesQueryResult = _propertyRepository.GetAllFilter(propertiesFilter);
                    if (propertiesQueryResult.IsSuccess())
                    {
                        var properties = await propertiesQueryResult.Data
                            .ToListAsync();
                        dto.Properties = _mapper.Map<List<PropertyDto>>(properties);
                        
                        // Generate default attachment URLs for properties
                        foreach (var property in properties)
                        {
                            var propertyDto = dto.Properties.FirstOrDefault(p => p.Id == property.Id);
                            if (propertyDto != null && property.DefaultAttachmentId.HasValue)
                            {
                                try
                                {
                                    // Get the default attachment
                                    var attachmentResult = await _attachmentRepository.GetByIdAsync(property.DefaultAttachmentId.Value);
                                    if (attachmentResult.IsSuccess() && attachmentResult.Data != null)
                                    {
                                    var attachment = attachmentResult.Data;
                                    if (!string.IsNullOrEmpty(attachment.StorageHash))
                                    {
                                        var s3Key = S3PathConstants.BuildAttachmentKey(
                                            property.CompanyId.ToString(),
                                            attachment.StorageHash,
                                            attachment.FileName
                                        );
                                        
                                        // Always regenerate URL to ensure it uses the correct StorageHash-based key
                                        // Check if cached URL matches the expected key structure, if not, force regeneration
                                        bool shouldRegenerate = string.IsNullOrEmpty(attachment.Url) || 
                                                               !attachment.Url.Contains(attachment.StorageHash) ||
                                                               !attachment.UrlExpiresAt.HasValue ||
                                                               attachment.UrlExpiresAt.Value <= DateTimeOffset.UtcNow;
                                        
                                        if (shouldRegenerate)
                                        {
                                            // Force regeneration by passing null for cached URL
                                            propertyDto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                GetBucketName(),
                                                s3Key,
                                                null, // Force regeneration
                                                null,
                                                24);
                                            
                                            // Update cached URL in attachment entity
                                            attachment.Url = propertyDto.DefaultAttachmentUrl;
                                            attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                            await _attachmentRepository.Update(attachment);
                                        }
                                        else
                                        {
                                            // Use cached URL if it's valid and matches the key structure
                                            propertyDto.DefaultAttachmentUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                GetBucketName(),
                                                s3Key,
                                                attachment.Url,
                                                attachment.UrlExpiresAt,
                                                24);
                                            
                                            // Update cached URL if it was regenerated
                                            if (propertyDto.DefaultAttachmentUrl != attachment.Url)
                                            {
                                                attachment.Url = propertyDto.DefaultAttachmentUrl;
                                                attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                                await _attachmentRepository.Update(attachment);
                                            }
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
                        dto.Properties = new List<PropertyDto>();
                    }

                    // Load related Leases
                    // For Owners: Get leases for properties they own
                    // For Tenants: Get leases where they are the tenant
                    var allLeases = new List<Lease>();
                    
                    if (entity.Type == Domain.Entities.Enums.ContactType.Owner || entity.Type == Domain.Entities.Enums.ContactType.Pro)
                    {
                        // Owner: Get leases for properties owned by this contact
                        if (dto.Properties != null && dto.Properties.Any())
                        {
                            var propertyIds = dto.Properties.Select(p => p.Id).ToList();
                            
                            // Query leases for each property (since GetLeasesFilter only accepts single PropertyId)
                            foreach (var propertyId in propertyIds)
                            {
                                var propertyLeasesFilter = new GetLeasesFilter
                                {
                                    PropertyId = propertyId,
                                    Ignore = true,
                                    CompanyId = entity.CompanyId
                                };
                                var propertyLeasesResult = _leaseRepository.GetAllFilter(propertyLeasesFilter);
                                if (propertyLeasesResult.IsSuccess())
                                {
                                    var propertyLeases = await propertyLeasesResult.Data.ToListAsync();
                                    allLeases.AddRange(propertyLeases);
                                }
                            }
                        }
                    }
                    else if (entity.Type == Domain.Entities.Enums.ContactType.Tenant)
                    {
                        // Tenant: Get leases where this contact is the tenant
                        var tenantLeasesFilter = new GetLeasesFilter
                        {
                            ContactId = entity.Id,
                            Ignore = true,
                            CompanyId = entity.CompanyId
                        };
                        var tenantLeasesResult = _leaseRepository.GetAllFilter(tenantLeasesFilter);
                        if (tenantLeasesResult.IsSuccess())
                        {
                            var tenantLeases = await tenantLeasesResult.Data.ToListAsync();
                            allLeases.AddRange(tenantLeases);
                        }
                    }
                    
                    // Remove duplicates (in case of any edge cases)
                    allLeases = allLeases.GroupBy(l => l.Id).Select(g => g.First()).ToList();
                    
                    // Map to DTOs
                    dto.Leases = _mapper.Map<List<LeaseDto>>(allLeases) ?? new List<LeaseDto>();
                    
                    // Populate lease property names, images, and tenant information
                    foreach (var lease in allLeases)
                    {
                        var leaseDto = dto.Leases.FirstOrDefault(l => l.Id == lease.Id);
                        if (leaseDto != null)
                        {
                            // Get the property
                            if (lease.PropertyId != Guid.Empty)
                            {
                                var propertyResult = await _propertyRepository.GetByIdAsync(lease.PropertyId);
                                if (propertyResult.IsSuccess() && propertyResult.Data != null)
                                {
                                    var property = propertyResult.Data;
                                    leaseDto.PropertyName = property.Name ?? property.Identifier;
                                    leaseDto.PropertyAddress = property.Address;
                                    
                                    // Set PropertyImageUrl if default attachment exists
                                    if (property.DefaultAttachmentId.HasValue)
                                    {
                                        try
                                        {
                                            var attachmentResult = await _attachmentRepository.GetByIdAsync(property.DefaultAttachmentId.Value);
                                            if (attachmentResult.IsSuccess() && attachmentResult.Data != null)
                                            {
                                                var attachment = attachmentResult.Data;
                                                if (!string.IsNullOrEmpty(attachment.StorageHash))
                                                {
                                                    var s3Key = S3PathConstants.BuildAttachmentKey(
                                                        property.CompanyId.ToString(),
                                                        attachment.StorageHash,
                                                        attachment.FileName
                                                    );
                                                    
                                                    // Always regenerate URL to ensure it uses the correct StorageHash-based key
                                                    // Check if cached URL matches the expected key structure, if not, force regeneration
                                                    bool shouldRegenerate = string.IsNullOrEmpty(attachment.Url) || 
                                                                           !attachment.Url.Contains(attachment.StorageHash) ||
                                                                           !attachment.UrlExpiresAt.HasValue ||
                                                                           attachment.UrlExpiresAt.Value <= DateTimeOffset.UtcNow;
                                                    
                                                    if (shouldRegenerate)
                                                    {
                                                        // Force regeneration by passing null for cached URL
                                                        leaseDto.PropertyImageUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                            GetBucketName(),
                                                            s3Key,
                                                            null, // Force regeneration
                                                            null,
                                                            24);
                                                        
                                                        // Update cached URL in attachment entity
                                                        attachment.Url = leaseDto.PropertyImageUrl;
                                                        attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                                        await _attachmentRepository.Update(attachment);
                                                    }
                                                    else
                                                    {
                                                        // Use cached URL if it's valid and matches the key structure
                                                        leaseDto.PropertyImageUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                                            GetBucketName(),
                                                            s3Key,
                                                            attachment.Url,
                                                            attachment.UrlExpiresAt,
                                                            24);
                                                        
                                                        // Update cached URL if it was regenerated
                                                        if (leaseDto.PropertyImageUrl != attachment.Url)
                                                        {
                                                            attachment.Url = leaseDto.PropertyImageUrl;
                                                            attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                                            await _attachmentRepository.Update(attachment);
                                                        }
                                                    }
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
                            
                            // Get the tenant (contact) information
                            if (lease.ContactId != Guid.Empty)
                            {
                                var tenantResult = await _contactRepository.GetByIdAsync(lease.ContactId);
                                if (tenantResult.IsSuccess() && tenantResult.Data != null)
                                {
                                    var tenant = tenantResult.Data;
                                    
                                    // Set tenant name
                                    if (tenant.IsACompany && !string.IsNullOrEmpty(tenant.CompanyName))
                                    {
                                        leaseDto.TenantName = tenant.CompanyName;
                                    }
                                    else
                                    {
                                        var fullName = $"{tenant.FirstName} {tenant.LastName}".Trim();
                                        leaseDto.TenantName = !string.IsNullOrEmpty(fullName) ? fullName : tenant.Identifier;
                                    }
                                    
                                    // Set tenant email
                                    leaseDto.TenantEmail = tenant.Email;
                                    
                                    // Set tenant phone (first phone if available)
                                    if (tenant.Phones != null && tenant.Phones.Any())
                                    {
                                        leaseDto.TenantPhone = tenant.Phones.First();
                                    }
                                    
                                    // Set tenant avatar URL if available
                                    if (!string.IsNullOrEmpty(tenant.Avatar))
                                    {
                                        try
                                        {
                                            var avatarUrl = await GenerateAvatarUrlAsync(tenant);
                                            leaseDto.TenantAvatarUrl = avatarUrl;
                                        }
                                        catch (Exception ex)
                                        {
                                            leaseDto.TenantAvatarUrl = null;
                                        }
                                    }
                                }
                            }
                        }
                    }

                    // Load related Banks
                    var banksFilter = new GetBanksFilter
                    {
                        ContactId = entity.Id,
                        Ignore = true,
                        CompanyId = entity.CompanyId
                    };
                    var banksQueryResult = _bankRepository.GetAllFilter(banksFilter);
                    if (banksQueryResult.IsSuccess())
                    {
                        var banks = await banksQueryResult.Data
                            .ToListAsync();
                        dto.Banks = _mapper.Map<List<BankDto>>(banks);
                    }
                    else
                    {
                        dto.Banks = new List<BankDto>();
                    }
                }
                else
                {
                    // Initialize empty collections when not including related entities
                    dto.Properties = new List<PropertyDto>();
                    dto.Leases = new List<LeaseDto>();
                    dto.Banks = new List<BankDto>();
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
        /// Override to add avatar URL and document URL generation after create
        /// </summary>
        public override async Task<Result<TOut>> CreateAsync<TOut, TCreateModel>(TCreateModel createModel)
        {
            // Call base create method
            var result = await base.CreateAsync<TOut, TCreateModel>(createModel);
            
            if (!result.IsSuccess())
            {
                return result;
            }

            // Generate avatar URL and document URLs if the result is ContactDto
            if (result.Data is ContactDto dto)
            {
                // Get the created entity to access the Avatar filename and Documents
                var entityResult = await _contactRepository.GetByIdAsync(dto.Id);
                if (entityResult != null && entityResult.IsSuccess() && entityResult.Data != null)
                {
                    var contact = entityResult.Data;
                    
                    // Set document count
                    dto.AttachmentCount = contact.Attachments?.Count ?? 0;
                    
                    // Generate avatar URL if avatar exists
                    if (!string.IsNullOrEmpty(contact.Avatar))
                    {
                        try
                        {
                            var avatarUrl = await GenerateAvatarUrlAsync(contact);
                            dto.Avatar = avatarUrl;
                        }
                        catch (Exception ex)
                        {
                            dto.Avatar = string.Empty;
                        }
                    }
                    else
                    {
                        dto.Avatar = string.Empty;
                    }

                    // Generate document URLs if documents exist
                    if (contact.Attachments != null && contact.Attachments.Any())
                    {
                        dto.Attachments = new List<AttachmentDto>();
                        
                        foreach (var doc in contact.Attachments)
                        {
                            try
                            {
                                var documentUrl = await GenerateDocumentUrlAsync(contact, doc);
                                dto.Attachments.Add(new AttachmentDto
                                {
                                    Id = doc.Id,
                                    FileName = doc.FileName,
                                    OriginalFileName = doc.OriginalFileName,
                                    FileExtension = doc.FileExtension,
                                    FileSize = doc.FileSize,
                                    Url = documentUrl,
                                    CreatedAt = doc.CreatedOn.DateTime
                                });
                            }
                            catch (Exception ex)
                            {
                                // Continue with other documents
                            }
                        }
                    }
                }
            }

            return result;
        }

        /// <summary>
        /// Override to add avatar URL and document URL generation after update
        /// </summary>
        public override async Task<Result<TOut>> UpdateAsync<TOut, TUpdateModel>(Guid id, TUpdateModel updateModel)
        {
            // Call base update method
            var result = await base.UpdateAsync<TOut, TUpdateModel>(id, updateModel);
            
            if (!result.IsSuccess())
                return result;

            // Generate avatar URL and document URLs if the result is ContactDto
            if (result.Data is ContactDto dto)
            {
                // Get the updated entity to access the Avatar filename and Documents
                var entityResult = await _contactRepository.GetByIdAsync(id);
                if (entityResult.IsSuccess() && entityResult.Data != null)
                {
                    var contact = entityResult.Data;
                    
                    // Set document count
                    dto.AttachmentCount = contact.Attachments?.Count ?? 0;
                    
                    // Generate avatar URL if avatar exists
                    if (!string.IsNullOrEmpty(contact.Avatar))
                    {
                        try
                        {
                            dto.Avatar = await GenerateAvatarUrlAsync(contact);
                        }
                        catch (Exception ex)
                        {
                            dto.Avatar = string.Empty;
                        }
                    }
                    else
                    {
                        dto.Avatar = string.Empty;
                    }

                    // Generate document URLs if documents exist
                    if (contact.Attachments != null && contact.Attachments.Any())
                    {
                        dto.Attachments = new List<AttachmentDto>();
                        
                        foreach (var doc in contact.Attachments)
                        {
                            try
                            {
                                var documentUrl = await GenerateDocumentUrlAsync(contact, doc);
                                dto.Attachments.Add(new AttachmentDto
                                {
                                    Id = doc.Id,
                                    FileName = doc.FileName,
                                    OriginalFileName = doc.OriginalFileName,
                                    FileExtension = doc.FileExtension,
                                    FileSize = doc.FileSize,
                                    Url = documentUrl,
                                    CreatedAt = doc.CreatedOn.DateTime
                                });
                            }
                            catch (Exception ex)
                            {
                                // Continue with other documents
                            }
                        }
                    }
                    else
                    {
                        dto.Attachments = new List<AttachmentDto>();
                    }
                }
            }

            return result;
        }

        /// <summary>
        /// Override to add avatar URL generation for paged results
        /// </summary>
        public override async Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption)
        {
            // Hook: before retrieving the result
            await InPagedResult_BeforeListRetrievalAsync(filterOption);

            // retrieve paged list result
            var entityQueryResult = _contactRepository.GetAllFilter(filterOption);

            // check the result
            if (!entityQueryResult.IsSuccess())
                return Result.Failure<PaginatedList<TOut>>();

            // Get the entities as a list (with pagination applied)
            var paginatedEntities = await entityQueryResult.Data.ToPaginatedListAsync(filterOption.CurrentPage, filterOption.PageSize, filterOption.Ignore);
            
            // Map entities to DTOs
            var contactDtos = _mapper.Map<List<ContactDto>>(paginatedEntities.Result);

            // Generate avatar URLs and set document count for each contact
            for (int i = 0; i < contactDtos.Count; i++)
            {
                var contactDto = contactDtos[i];
                var entity = paginatedEntities.Result[i];
                
                // Set document count
                contactDto.AttachmentCount = entity.Attachments?.Count ?? 0;
                
                // Only generate avatar URLs if pagination is NOT being ignored
                // When Ignore=true (e.g., for dropdowns), skip expensive S3 calls
                if (!filterOption.Ignore && !string.IsNullOrEmpty(entity.Avatar))
                {
                    try
                    {
                        contactDto.Avatar = await GenerateAvatarUrlAsync(entity);
                    }
                    catch (Exception ex)
                    {
                        contactDto.Avatar = string.Empty;
                    }
                }
                else
                {
                    contactDto.Avatar = string.Empty;
                }
            }

            // Create the paginated result with the DTOs
            var result = new PaginatedList<TOut>
            {
                CurrentPage = paginatedEntities.CurrentPage,
                TotalPages = paginatedEntities.TotalPages,
                TotalItems = paginatedEntities.TotalItems,
                Result = contactDtos as List<TOut>
            };

            return Result.Success(result);
        }

        public async Task<Result<List<ContactDto>>> GetAllContactsAsync()
        {
            var contactsResult = await _contactRepository.GetAllAsync();
            if (contactsResult.IsFailure())
                return Result.Failure<List<ContactDto>>();

            var contactDtos = _mapper.Map<List<ContactDto>>(contactsResult.Data);

            foreach (var contactDto in contactDtos)
            {
                var originalContact = contactsResult.Data.Find(c => c.Id == contactDto.Id);
                if (originalContact != null)
                {
                    // EF Core Value Converter handles Phones deserialization automatically

                    // Generate avatar URL
                    if (!string.IsNullOrEmpty(originalContact.Avatar))
                    {
                        try
                        {
                            contactDto.Avatar = await GenerateAvatarUrlAsync(originalContact);
                        }
                        catch (Exception ex)
                        {
                            contactDto.Avatar = string.Empty;
                        }
                    }
                }
            }

            return Result.Success(contactDtos);
        }

        #region Helper Methods

        private string GetBucketName()
        {
            return _configuration["AWS:BucketName"] ?? "immogest-files";
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

        private string ExtractFileNameFromUrl(string url)
        {
            try
            {
                // Extract filename from URL
                var uri = new Uri(url);
                var pathSegments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

                // The filename is always the last segment in the path
                // Path structure: companies/{companyId}/{contactId}/avatar/{filename}
                if (pathSegments.Length > 0)
                {
                    var lastSegment = pathSegments[pathSegments.Length - 1];
                    return lastSegment;
                }

                // Fallback: generate a unique filename
                return GenerateUniqueFileName();
            }
            catch (Exception ex)
            {
                // If URL parsing fails, generate a unique filename
                return GenerateUniqueFileName();
            }
        }

        private string GenerateUniqueFileName()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 26)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private string GetFileExtensionFromBase64(string base64String)
        {
            // Check for common file format headers in base64
            // Images
            if (base64String.StartsWith("/9j/"))
                return ".jpg";
            if (base64String.StartsWith("iVBORw0KGgo"))
                return ".png";
            if (base64String.StartsWith("R0lGOD"))
                return ".gif";
            if (base64String.StartsWith("UklGR"))
                return ".webp";
            
            // PDFs
            if (base64String.StartsWith("JVBERi0"))
                return ".pdf";
            
            // Office documents
            if (base64String.StartsWith("UEsDBBQ"))
                return ".docx"; // Could also be xlsx, pptx
            
            // Default to generic file extension
            return ".file";
        }

        private long CalculateBase64FileSize(string base64String)
        {
            // Calculate the actual file size from base64 string
            // Base64 encoding increases the size by approximately 33%
            // Formula: (base64Length * 3) / 4 - padding
            
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

        /// <summary>
        /// Generate document URL for a contact attachment
        /// </summary>
        private async Task<string> GenerateDocumentUrlAsync(Contact contact, Attachment document)
        {
            if (string.IsNullOrEmpty(document.FileName))
                return string.Empty;

            if (string.IsNullOrEmpty(document.StorageHash))
            {
                // Fallback for old attachments without StorageHash (should not happen after migration)
                return string.Empty;
            }

            try
            {
                var bucketName = GetBucketName();
                
                // Use StorageHash for S3 key generation (immutable, never changes)
                var key = S3PathConstants.BuildAttachmentKey(
                    contact.CompanyId.ToString(),
                    document.StorageHash,
                    document.FileName
                );

                // Use cached URL from attachment entity
                var url = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                    bucketName, 
                    key, 
                    document.Url, 
                    document.UrlExpiresAt, 
                    24);
                
                // Update cached URL if it was regenerated
                if (url != document.Url)
                {
                    document.Url = url;
                    document.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                    await _attachmentRepository.Update(document);
                }
                
                return url;
            }
            catch
            {
                // Silently return empty string to prevent exposing internal details
                return string.Empty;
            }
        }

        /// <summary>
        /// Generate immutable storage hash for avatar based on CompanyId and file content
        /// This ensures same file + same company = same hash (works even when name changes)
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="fileBytes">File content as byte array</param>
        /// <returns>SHA256 hash as hexadecimal string</returns>
        private string GenerateAvatarStorageHash(Guid companyId, byte[] fileBytes)
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
        /// Generate avatar URL for a contact using StorageHash (immutable, never changes)
        /// </summary>
        private async Task<string> GenerateAvatarUrlAsync(Contact contact)
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
                    var contactFolder = _fileHelper.GetContactFolderNameFromProperties(
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
                return string.Empty;
            }
        }

        #endregion

        /// <summary>
        /// Update the archive status of a contact
        /// </summary>
        public async Task<Result<ContactDto>> UpdateArchiveStatusAsync(UpdateContactArchiveStatusDto dto)
        {
            try
            {
                var contactResult = await _contactRepository.GetById(dto.ContactId);
                if (!contactResult.IsSuccess() || contactResult.Data == null)
                {
                    return Result.Failure<ContactDto>();
                }

                var contact = contactResult.Data;

                // Ensure the contact belongs to the current company
                if (contact.CompanyId != _session.CompanyId)
                {
                    return Result.Failure<ContactDto>();
                }

                // Update archive status
                contact.IsArchived = dto.IsArchived;
                contact.LastModifiedOn = DateTimeOffset.UtcNow;
                contact.BuildSearchTerms();

                var updateResult = await _contactRepository.Update(contact);
                if (!updateResult.IsSuccess())
                {
                    return Result.Failure<ContactDto>();
                }

                // Return updated contact as DTO
                return await GetByIdAsync<ContactDto>(dto.ContactId);
            }
            catch (Exception ex)
            {
                return Result.Failure<ContactDto>();
            }
        }
    }
}
