using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Auth.Interfaces;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using ResultNet;
using ImmoGest.Domain.Entities.Enums;
using ImmoGest.Domain.Constants;

namespace ImmoGest.Application.Services
{
    public class LeaseService : DataServiceBase<Lease>, ILeaseService
    {
        private readonly ILeaseRepository _leaseRepository;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IMapper _mapper;
        private readonly ISession _session;
        private readonly IS3StorageService _s3StorageService;
        private readonly IConfiguration _configuration;
        private readonly FileAttachmentHelper _fileHelper;

        public LeaseService(
            IMapper mapper,
            ILeaseRepository leaseRepository,
            IAttachmentRepository attachmentRepository,
            ISession session,
            IS3StorageService s3StorageService,
            IConfiguration configuration,
            FileAttachmentHelper fileHelper)
            : base(mapper, leaseRepository)
        {
            _leaseRepository = leaseRepository;
            _attachmentRepository = attachmentRepository;
            _mapper = mapper;
            _session = session;
            _s3StorageService = s3StorageService;
            _configuration = configuration;
            _fileHelper = fileHelper;
        }

        protected override async Task InCreate_BeforInsertAsync<TCreateModel>(Lease entity, TCreateModel createModel)
        {
            if (createModel is CreateLeaseDto dto)
            {
                // Set CompanyId
                entity.CompanyId = _session.CompanyId;

                // Calculate and set status based on dates
                entity.Status = CalculateLeaseStatus(dto.TenancyStart, dto.TenancyEnd);

                // Handle attachments if provided
                if (dto.Attachments != null && dto.Attachments.Any())
                {
                    var attachments = new List<Attachment>();
                    foreach (var attachmentDto in dto.Attachments)
                    {
                        try
                        {
                            var attachment = await CreateAttachmentFromBase64(
                                entity.Id,
                                entity.CompanyId,
                                entity.ContactId,
                                attachmentDto.FileName,
                                attachmentDto.Base64Content
                            );
                            attachments.Add(attachment);
                        }
                        catch (Exception ex)
                        {
                            // Continue with other attachments
                        }
                    }
                    entity.Attachments = attachments;
                }
            }
        }

        protected override async Task InUpdate_BeforUpdateAsync<TUpdateModel>(Lease entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateLeaseDto dto)
            {
                // Update status based on new dates
                entity.Status = CalculateLeaseStatus(dto.TenancyStart, dto.TenancyEnd);

                // Handle attachments to add
                if (dto.AttachmentsToAdd != null && dto.AttachmentsToAdd.Any())
                {
                    foreach (var attachmentDto in dto.AttachmentsToAdd)
                    {
                        try
                        {
                            var attachment = await CreateAttachmentFromBase64(
                                entity.Id,
                                entity.CompanyId,
                                entity.ContactId,
                                attachmentDto.FileName,
                                attachmentDto.Base64Content
                            );
                            
                            // Add to repository
                            await _attachmentRepository.Create(attachment);
                        }
                        catch (Exception ex)
                        {
                            // Continue with other attachments
                        }
                    }
                }

                // Handle attachments to delete
                if (dto.AttachmentsToDelete != null && dto.AttachmentsToDelete.Any())
                {
                    foreach (var attachmentId in dto.AttachmentsToDelete)
                    {
                        try
                        {
                            var attachmentResult = await _attachmentRepository.GetByIdAsync(attachmentId);
                            if (attachmentResult != null && attachmentResult.Data != null)
                            {
                                var attachment = attachmentResult.Data;
                                if (attachment.LeaseId == entity.Id)
                                {
                                    // Delete from S3 using FileAttachmentHelper
                                    await _fileHelper.DeleteAttachmentByEntityAsync(
                                        entity.CompanyId,
                                        attachment
                                    );

                                    // Soft delete from repository
                                    await _attachmentRepository.Delete(attachmentId);
                                }
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

        protected override async Task InDelete_BeforDeleteAsync(Lease entity)
        {
            // Delete all attachments when deleting a lease
            if (entity.Attachments != null && entity.Attachments.Any())
            {
                foreach (var attachment in entity.Attachments)
                {
                    try
                    {
                        // Delete from S3 using FileAttachmentHelper
                        await _fileHelper.DeleteAttachmentByEntityAsync(
                            entity.CompanyId,
                            attachment
                        );
                    }
                    catch (Exception ex)
                    {
                        // Continue with other attachments
                    }
                }
            }
        }

        private async Task<Attachment> CreateAttachmentFromBase64(
            Guid leaseId,
            Guid companyId,
            Guid contactId,
            string fileName,
            string base64Content)
        {
            // Get contact folder name using helper
            var contactName = await _fileHelper.GetOwnerNameAsync(contactId);
            
            // Use the proper path structure: {contactName}/leasing
            var root = S3PathConstants.GetLeaseAttachmentsPath(contactName);
            
            // Use FileAttachmentHelper to create attachment with the proper path
            var attachment = await _fileHelper.CreateAttachmentFromBase64Async(
                companyId,
                base64Content,
                fileName,
                root,
                leaseId
            );

            // Set the LeaseId for the relationship
            attachment.LeaseId = leaseId;

            return attachment;
        }

        private LeasingStatus CalculateLeaseStatus(DateTime startDate, DateTime endDate)
        {
            var now = DateTime.UtcNow;

            if (now < startDate)
            {
                return LeasingStatus.Pending;
            }
            else if (now > endDate)
            {
                return LeasingStatus.Expired;
            }
            else
            {
                return LeasingStatus.Active;
            }
        }

        protected override Task InPagedResult_BeforeListRetrievalAsync<IFilter>(IFilter filterOption)
        {
            filterOption.CompanyId = _session.CompanyId;
            return base.InPagedResult_BeforeListRetrievalAsync(filterOption);
        }

        public override async Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption)
        {
            // Hook: before retrieving the result
            await InPagedResult_BeforeListRetrievalAsync(filterOption);

            // Retrieve paged list result - this returns an IQueryable with Include statements applied by the repository
            var entityQueryResult = _leaseRepository.GetAllFilter(filterOption);

            // Check the result
            if (!entityQueryResult.IsSuccess())
                return Result.Failure<PaginatedList<TOut>>();

            // Get the entities as a list (with pagination applied)
            // The Include statements from SetPagedResultFilterOptions should be applied here
            var paginatedEntities = await entityQueryResult.Data.ToPaginatedListAsync(filterOption.CurrentPage, filterOption.PageSize, filterOption.Ignore);
            
            // Map entities to DTOs
            var leaseDtos = _mapper.Map<List<LeaseDto>>(paginatedEntities.Result);

            // Post-process the DTOs to add image URLs
            if (typeof(TOut) == typeof(LeaseDto))
            {
                for (int i = 0; i < leaseDtos.Count; i++)
                {
                    var dto = leaseDtos[i];
                    var entity = paginatedEntities.Result[i];

                    try
                    {
                        // Only generate image URLs if pagination is NOT being ignored
                        // When Ignore=true (e.g., for dropdowns), skip expensive S3 calls
                        if (!filterOption.Ignore)
                        {
                            // Generate property image URL
                            if (entity.Property != null && entity.Property.DefaultAttachmentId.HasValue)
                            {
                                try
                                {
                                    var attachmentResult = await _attachmentRepository.GetByIdAsync(entity.Property.DefaultAttachmentId.Value);
                                    if (attachmentResult.IsSuccess() && attachmentResult.Data != null)                                  
                                    {
                                        var attachment = attachmentResult.Data;
                                        // Use helper to generate URL with constants
                                        dto.PropertyImageUrl = await _fileHelper.GenerateAttachmentUrlAsync(
                                            entity.CompanyId,
                                            attachment,
                                            24
                                        );
                                    }
                                }
                                catch (Exception ex)
                                {
                                    dto.PropertyImageUrl = null;
                                }
                            }

                            // Generate tenant avatar URL
                            if (entity.Contact != null && !string.IsNullOrEmpty(entity.Contact.Avatar))
                            {
                                try
                                {
                                    var bucketName = GetBucketName();
                                    string key;

                                    // Use hash-based key if available (new avatars), otherwise fallback to folder-based (old avatars)
                                    if (!string.IsNullOrEmpty(entity.Contact.AvatarStorageHash))
                                    {
                                        // Use hash-based key (immutable, never changes even when name changes)
                                        key = S3PathConstants.BuildContactAvatarKey(
                                            entity.Contact.CompanyId.ToString(),
                                            entity.Contact.AvatarStorageHash,
                                            entity.Contact.Avatar
                                        );
                                    }
                                    else
                                    {
                                        // Fallback for old avatars without hash (backward compatibility)
                                        var contactFolder = _fileHelper.GetContactFolderNameFromProperties(
                                            entity.Contact.FirstName,
                                            entity.Contact.LastName,
                                            entity.Contact.CompanyName,
                                            entity.Contact.IsACompany,
                                            entity.Contact.Id
                                        );
                                        key = S3PathConstants.BuildContactAvatarKeyWithFolder(
                                            entity.Contact.CompanyId.ToString(),
                                            contactFolder,
                                            entity.Contact.Avatar
                                        );
                                    }

                                    // Use cached URL (for avatars, we don't have an attachment entity, so pass null)
                                    dto.TenantAvatarUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(bucketName, key, null, null, 24);
                                }
                                catch (Exception ex)
                                {
                                    dto.TenantAvatarUrl = null;
                                }
                            }
                        }

                        // Set PropertyName and PropertyAddress - always retrieve as it's not expensive
                        if (entity.Property != null)
                        {
                            dto.PropertyName = entity.Property.Name;
                            dto.PropertyAddress = entity.Property.Address;
                        }

                        // Set tenant phone (first phone from list) - always retrieve as it's not expensive
                        if (entity.Contact != null && entity.Contact.Phones != null && entity.Contact.Phones.Count > 0)
                        {
                            dto.TenantPhone = entity.Contact.Phones[0];
                        }

                        // Set attachment count - always retrieve as it's not expensive
                        dto.AttachmentCount = entity.Attachments?.Count ?? 0;
                    }
                    catch (Exception ex)
                    {
                        // Continue with other leases
                    }
                }
            }

            // Create the paginated result with the DTOs
            var result = new PaginatedList<TOut>
            {
                CurrentPage = paginatedEntities.CurrentPage,
                TotalPages = paginatedEntities.TotalPages,
                TotalItems = paginatedEntities.TotalItems,
                Result = leaseDtos as List<TOut>
            };

            return Result.Success(result);
        }

        private string GetBucketName()
        {
            return _configuration["AWS:BucketName"] ?? "immogest-files";
        }

        /// <summary>
        /// Override to add attachment URL generation after retrieving by ID
        /// </summary>
        public override async Task<Result<TOut>> GetByIdAsync<TOut>(Guid id)
        {
            // Call base method
            var result = await base.GetByIdAsync<TOut>(id);
            
            if (!result.IsSuccess())
                return result;

            // Generate attachment URLs if the result is LeaseDto
            if (result.Data is LeaseDto dto)
            {
                // Get the entity to access attachments
                var entityResult = await _leaseRepository.GetByIdAsync(id);
                if (entityResult != null && entityResult.IsSuccess() && entityResult.Data != null)
                {
                    var lease = entityResult.Data;
                    
                    // Set attachment count
                    dto.AttachmentCount = lease.Attachments?.Count ?? 0;
                    
                    // Generate attachment URLs if attachments exist
                    if (lease.Attachments != null && lease.Attachments.Any())
                    {
                        dto.Attachments = new List<AttachmentDto>();
                        
                        foreach (var attachment in lease.Attachments)
                        {
                            try
                            {
                                // Use helper to generate URL
                                var attachmentUrl = await _fileHelper.GenerateAttachmentUrlAsync(
                                    lease.CompanyId,
                                    attachment,
                                    24
                                );
                                
                                dto.Attachments.Add(new AttachmentDto
                                {
                                    Id = attachment.Id,
                                    FileName = attachment.FileName,
                                    OriginalFileName = attachment.OriginalFileName,
                                    FileExtension = attachment.FileExtension,
                                    FileSize = attachment.FileSize,
                                    Url = attachmentUrl,
                                    CreatedAt = attachment.CreatedOn.DateTime
                                });
                            }
                            catch (Exception ex)
                            {
                                // Continue with other attachments
                            }
                        }
                    }
                }
            }

            return result;
        }

        public async Task<Result> ArchiveLeaseAsync(Guid leaseId)
        {
            var entityResult = await _leaseRepository.GetByIdAsync(leaseId);
            if (!entityResult.IsSuccess() || entityResult.Data == null)
                return Result.Failure();

            var lease = entityResult.Data;
            lease.IsArchived = true;
            lease.Status = LeasingStatus.Terminated; // Set status to Terminated when archived

            var updateResult = await _leaseRepository.Update(lease);
            if (updateResult.IsSuccess())
                return Result.Success();

            return Result.Failure();
        }

        public async Task<Result> ActivateLeaseAsync(Guid leaseId)
        {
            var entityResult = await _leaseRepository.GetByIdAsync(leaseId);
            if (!entityResult.IsSuccess() || entityResult.Data == null)
                return Result.Failure();

            var lease = entityResult.Data;
            lease.IsArchived = false;
            // Recalculate status based on dates
            lease.Status = CalculateLeaseStatus(lease.TenancyStart, lease.TenancyEnd);

            var updateResult = await _leaseRepository.Update(lease);
            if (updateResult.IsSuccess())
                return Result.Success();

            return Result.Failure();
        }

        /// <summary>
        /// Get overlapping leases for a property within a date range
        /// </summary>
        public async Task<Result<List<LeaseDto>>> GetOverlappingLeasesAsync(Guid propertyId, DateTime tenancyStart, DateTime tenancyEnd, Guid? excludeLeaseId = null)
        {
            try
            {
                var overlappingLeases = await _leaseRepository.GetOverlappingLeasesAsync(propertyId, tenancyStart, tenancyEnd, excludeLeaseId);
                
                // Filter by company
                overlappingLeases = overlappingLeases
                    .Where(l => l.CompanyId == _session.CompanyId)
                    .ToList();

                var leaseDtos = _mapper.Map<List<LeaseDto>>(overlappingLeases);

                return Result.Success(leaseDtos);
            }
            catch (Exception ex)
            {
                return Result.Failure<List<LeaseDto>>();
            }
        }
    }
}

