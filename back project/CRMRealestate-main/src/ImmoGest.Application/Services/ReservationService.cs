using System;
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
using ResultNet;
using ImmoGest.Domain.Entities.Enums;
using ImmoGest.Domain.Constants;

namespace ImmoGest.Application.Services
{
    public class ReservationService : DataServiceBase<Reservation>, IReservationService
    {
        private readonly IReservationRepository _reservationRepository;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IMapper _mapper;
        private readonly ISession _session;
        private readonly IS3StorageService _s3StorageService;
        private readonly IConfiguration _configuration;
        private readonly FileAttachmentHelper _fileHelper;

        public ReservationService(
            IMapper mapper,
            IReservationRepository reservationRepository,
            IAttachmentRepository attachmentRepository,
            ISession session,
            IS3StorageService s3StorageService,
            IConfiguration configuration,
            FileAttachmentHelper fileHelper)
            : base(mapper, reservationRepository)
        {
            _reservationRepository = reservationRepository;
            _attachmentRepository = attachmentRepository;
            _mapper = mapper;
            _session = session;
            _s3StorageService = s3StorageService;
            _configuration = configuration;
            _fileHelper = fileHelper;
        }

        protected override async Task InUpdate_ValidateEntityAsync<TUpdateModel>(Reservation entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateReservationDto dto)
            {
                // Block status Approved and Pending when editing
                if (dto.Status == ReservationStatus.Approved)
                {
                    throw new InvalidOperationException("Cannot set reservation status to Approved when editing. Use the status update endpoint instead.");
                }

                if (dto.Status == ReservationStatus.Pending)
                {
                    throw new InvalidOperationException("Cannot set reservation status to Pending when editing.");
                }
            }

            await base.InUpdate_ValidateEntityAsync(entity, updateModel);
        }

        protected override async Task InCreate_BeforInsertAsync<TCreateModel>(Reservation entity, TCreateModel createModel)
        {
            if (createModel is CreateReservationDto dto)
            {
                // Normalize dates to midnight (00:00:00) for consistency
                var normalizedStartDate = dto.StartDate.Date; // Gets date at 00:00:00
                var normalizedEndDate = dto.EndDate.Date; // Gets date at 00:00:00
                
                entity.StartDate = normalizedStartDate;
                entity.EndDate = normalizedEndDate;

                // Set CompanyId
                entity.CompanyId = _session.CompanyId;

                // Set request date
                entity.RequestDate = DateTime.UtcNow;

                // Calculate duration using normalized dates
                entity.DurationDays = (normalizedEndDate - normalizedStartDate).Days + 1;
                entity.NumberOfNights = entity.DurationDays; // Same as duration days

                // Set initial status
                entity.Status = ReservationStatus.Pending;

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

        protected override async Task InUpdate_BeforUpdateAsync<TUpdateModel>(Reservation entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateReservationDto dto)
            {
                // Normalize dates to midnight (00:00:00) for consistency
                var normalizedStartDate = dto.StartDate.Date; // Gets date at 00:00:00
                var normalizedEndDate = dto.EndDate.Date; // Gets date at 00:00:00
                
                entity.StartDate = normalizedStartDate;
                entity.EndDate = normalizedEndDate;

                // Recalculate duration using normalized dates
                entity.DurationDays = (normalizedEndDate - normalizedStartDate).Days + 1;
                entity.NumberOfNights = entity.DurationDays; // Same as duration days

                // Update approval information if status changed to Approved
                if (dto.Status == ReservationStatus.Approved && entity.Status != ReservationStatus.Approved)
                {
                    entity.ApprovalDate = DateTime.UtcNow;
                    if (dto.ApprovedBy.HasValue)
                    {
                        entity.ApprovedBy = dto.ApprovedBy.Value;
                    }
                }

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
                                if (attachment.ReservationId == entity.Id)
                                {
                                    // Delete from S3 using StorageHash
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

        protected override async Task InDelete_BeforDeleteAsync(Reservation entity)
        {
            // Delete all attachments when deleting a reservation
            if (entity.Attachments != null && entity.Attachments.Any())
            {
                foreach (var attachment in entity.Attachments)
                {
                    try
                    {
                        // Delete from S3 using StorageHash
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
            Guid reservationId,
            Guid companyId,
            Guid contactId,
            string fileName,
            string base64Content)
        {
            // Get contact folder name using helper (this will fetch contact info)
            var contactName = await _fileHelper.GetOwnerNameAsync(contactId);
            
            // Use the new path structure: {contactName}/reservation
            var root = S3PathConstants.GetReservationAttachmentsPath(contactName);
            
            // Use FileAttachmentHelper to create attachment with the new path
            var attachment = await _fileHelper.CreateAttachmentFromBase64Async(
                companyId,
                base64Content,
                fileName,
                root,
                reservationId
            );

            // Set the ReservationId for the relationship
            attachment.ReservationId = reservationId;

            return attachment;
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

            // Retrieve paged list result
            var entityQueryResult = _reservationRepository.GetAllFilter(filterOption);

            // Check the result
            if (!entityQueryResult.IsSuccess())
                return Result.Failure<PaginatedList<TOut>>();

            // Get the entities as a list (with pagination applied)
            var paginatedEntities = await entityQueryResult.Data.ToPaginatedListAsync(filterOption.CurrentPage, filterOption.PageSize, filterOption.Ignore);
            
            // Map entities to DTOs
            var reservationDtos = _mapper.Map<List<ReservationDto>>(paginatedEntities.Result);

            // Post-process the DTOs to add avatar URLs
            if (typeof(TOut) == typeof(ReservationDto))
            {
                for (int i = 0; i < reservationDtos.Count; i++)
                {
                    var dto = reservationDtos[i];
                    var entity = paginatedEntities.Result[i];

                    try
                    {
                        // Generate property image URL (always generate, not just when pagination is not ignored)
                        if (entity.Property != null && entity.Property.DefaultAttachmentId.HasValue)
                        {
                            try
                            {
                                var attachmentResult = await _attachmentRepository.GetByIdAsync(entity.Property.DefaultAttachmentId.Value);
                                if (attachmentResult.IsSuccess() && attachmentResult.Data != null)                                  
                                {
                                    var attachment = attachmentResult.Data;
                                    var bucketName = GetBucketName();
                                    if (!string.IsNullOrEmpty(attachment.StorageHash))
                                    {
                                        var s3Key = S3PathConstants.BuildAttachmentKey(
                                            entity.CompanyId.ToString(),
                                            attachment.StorageHash,
                                            attachment.FileName
                                        );
                                        
                                        // Use S3StorageService to generate URL (same approach as PropertyService)
                                        dto.PropertyImageUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                            bucketName, 
                                            s3Key, 
                                            attachment.Url, 
                                            attachment.UrlExpiresAt, 
                                            24);
                                        
                                        // Update cached URL if it was regenerated
                                        if (dto.PropertyImageUrl != attachment.Url)
                                        {
                                            attachment.Url = dto.PropertyImageUrl;
                                            attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                            await _attachmentRepository.Update(attachment);
                                        }
                                    }
                                }
                                else
                                {
                                    dto.PropertyImageUrl = null;
                                }
                            }
                            catch (Exception ex)
                            {
                                dto.PropertyImageUrl = null;
                            }
                        }
                        else
                        {
                            dto.PropertyImageUrl = null;
                        }

                        // Only generate image URLs if pagination is NOT being ignored
                        // When Ignore=true (e.g., for dropdowns), skip expensive S3 calls
                        if (!filterOption.Ignore)
                        {
                            // Generate contact avatar URL
                            if (entity.Contact != null && !string.IsNullOrEmpty(entity.Contact.Avatar))
                            {
                                try
                                {
                                    var bucketName = _fileHelper.GetBucketName();
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
                                    dto.ContactAvatarUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(bucketName, key, null, null, 24);
                                }
                                catch (Exception ex)
                                {
                                    dto.ContactAvatarUrl = null;
                                }
                            }
                        }

                        // Set contact phone (first phone from list) - always retrieve as it's not expensive
                        if (entity.Contact != null && entity.Contact.Phones != null && entity.Contact.Phones.Count > 0)
                        {
                            dto.ContactPhone = entity.Contact.Phones[0];
                        }

                        // Set attachment count - always retrieve as it's not expensive
                        dto.AttachmentCount = entity.Attachments?.Count ?? 0;
                    }
                    catch (Exception ex)
                    {
                        // Continue with other reservations
                    }
                }
            }

            // Create the paginated result with the DTOs
            var result = new PaginatedList<TOut>
            {
                CurrentPage = paginatedEntities.CurrentPage,
                TotalPages = paginatedEntities.TotalPages,
                TotalItems = paginatedEntities.TotalItems,
                Result = reservationDtos as List<TOut>
            };

            return Result.Success(result);
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

            // Generate attachment URLs if the result is ReservationDto
            if (result.Data is ReservationDto dto)
            {
                // Get the entity to access attachments
                var entityResult = await _reservationRepository.GetByIdAsync(id);
                if (entityResult != null && entityResult.IsSuccess() && entityResult.Data != null)
                {
                    var reservation = entityResult.Data;
                    
                    // Generate property image URL
                    if (reservation.Property != null && reservation.Property.DefaultAttachmentId.HasValue)
                    {
                        try
                        {
                            var attachmentResult = await _attachmentRepository.GetByIdAsync(reservation.Property.DefaultAttachmentId.Value);
                            if (attachmentResult.IsSuccess() && attachmentResult.Data != null)
                            {
                                var attachment = attachmentResult.Data;
                                var bucketName = GetBucketName();
                                var s3Key = $"companies/{reservation.CompanyId}/attachments/{attachment.Root}/{attachment.FileName}";
                                
                                // Use S3StorageService to generate URL (same approach as PropertyService)
                                dto.PropertyImageUrl = await _s3StorageService.GetOrGenerateCachedUrlAsync(
                                    bucketName, 
                                    s3Key, 
                                    attachment.Url, 
                                    attachment.UrlExpiresAt, 
                                    24);
                                
                                // Update cached URL if it was regenerated
                                if (dto.PropertyImageUrl != attachment.Url)
                                {
                                    attachment.Url = dto.PropertyImageUrl;
                                    attachment.UrlExpiresAt = DateTimeOffset.UtcNow.AddHours(24);
                                    await _attachmentRepository.Update(attachment);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            dto.PropertyImageUrl = null;
                        }
                    }
                    
                    // Set attachment count
                    dto.AttachmentCount = reservation.Attachments?.Count ?? 0;
                    
                    // Generate attachment URLs if attachments exist
                    if (reservation.Attachments != null && reservation.Attachments.Any())
                    {
                        dto.Attachments = new List<AttachmentDto>();
                        
                        foreach (var attachment in reservation.Attachments)
                        {
                            try
                            {
                                // Use helper to generate URL
                                var attachmentUrl = await _fileHelper.GenerateAttachmentUrlAsync(
                                    reservation.CompanyId,
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


        public async Task<Result> ArchiveReservationAsync(Guid reservationId)
        {
            var entityResult = await _reservationRepository.GetByIdAsync(reservationId);
            if (!entityResult.IsSuccess() || entityResult.Data == null)
                return Result.Failure();

            var reservation = entityResult.Data;
            reservation.IsArchived = true;

            var updateResult = await _reservationRepository.Update(reservation);
            if (updateResult.IsSuccess())
                return Result.Success();

            return Result.Failure();
        }

        public async Task<Result> ActivateReservationAsync(Guid reservationId)
        {
            var entityResult = await _reservationRepository.GetByIdAsync(reservationId);
            if (!entityResult.IsSuccess() || entityResult.Data == null)
                return Result.Failure();

            var reservation = entityResult.Data;
            reservation.IsArchived = false;

            var updateResult = await _reservationRepository.Update(reservation);
            if (updateResult.IsSuccess())
                return Result.Success();

            return Result.Failure();
        }

        public async Task<Result> UpdateStatusAsync(Guid reservationId, ReservationStatus status)
        {
            var entityResult = await _reservationRepository.GetByIdAsync(reservationId);
            if (!entityResult.IsSuccess() || entityResult.Data == null)
                return Result.Failure();

            var reservation = entityResult.Data;
            reservation.Status = status;

            var updateResult = await _reservationRepository.Update(reservation);
            if (updateResult.IsSuccess())
                return Result.Success();

            return Result.Failure();
        }

        /// <summary>
        /// Get overlapping reservations for a property within a date range
        /// </summary>
        public async Task<Result<List<ReservationDto>>> GetOverlappingReservationsAsync(Guid propertyId, DateTime startDate, DateTime endDate, Guid? excludeReservationId = null)
        {
            try
            {
                var overlappingReservations = await _reservationRepository.GetOverlappingReservationsAsync(propertyId, startDate, endDate, excludeReservationId);
                
                // Filter by company
                overlappingReservations = overlappingReservations
                    .Where(r => r.CompanyId == _session.CompanyId)
                    .ToList();

                var reservationDtos = _mapper.Map<List<ReservationDto>>(overlappingReservations);

                return Result.Success(reservationDtos);
            }
            catch (Exception ex)
            {
                return Result.Failure<List<ReservationDto>>();
            }
        }

        private string GetBucketName()
        {
            return _configuration["AWS:BucketName"] ?? "immogest-files";
        }
    }
}

