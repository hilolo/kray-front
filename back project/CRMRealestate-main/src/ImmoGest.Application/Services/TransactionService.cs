using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Auth.Interfaces;
using ImmoGest.Domain.Constants;
using Microsoft.Extensions.Configuration;
using ResultNet;

namespace ImmoGest.Application.Services
{
    public class TransactionService : DataServiceBase<Transaction>, ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IAttachmentService _attachmentService;
        private readonly IMapper _mapper;
        private readonly ISession _session;
        private readonly IS3StorageService _s3StorageService;
        private readonly IConfiguration _configuration;
        private readonly FileAttachmentHelper _fileHelper;

        // Store DTOs temporarily for after insert/update processing
        private CreateTransactionDto _currentTransactionDto;
        private UpdateTransactionDto _currentUpdateTransactionDto;

        public TransactionService(
            IMapper mapper,
            ITransactionRepository transactionRepository,
            IAttachmentRepository attachmentRepository,
            IAttachmentService attachmentService,
            ISession session,
            IS3StorageService s3StorageService,
            IConfiguration configuration,
            FileAttachmentHelper fileHelper)
            : base(mapper, transactionRepository)
        {
            _transactionRepository = transactionRepository;
            _attachmentRepository = attachmentRepository;
            _attachmentService = attachmentService;
            _mapper = mapper;
            _session = session;
            _s3StorageService = s3StorageService;
            _configuration = configuration;
            _fileHelper = fileHelper;
        }

        protected override async Task InCreate_BeforInsertAsync<TCreateModel>(Transaction entity, TCreateModel createModel)
        {
            if (createModel is CreateTransactionDto dto)
            {
                // Store DTO for after insert processing
                _currentTransactionDto = dto;

                // Set CompanyId from session
                entity.CompanyId = _session.CompanyId;

                // Set TransactionType to Manual (created from front)
                entity.TransactionType = TransactionType.Manual;

                // Set Status to Pending (default status for new transactions)
                entity.Status = TransactionStatus.Pending;

                // Calculate TotalAmount from payments
                if (dto.Payments != null && dto.Payments.Count > 0)
                {
                    entity.TotalAmount = dto.Payments.Sum(p => p.Amount * (1 + p.VatPercent / 100));
                }
                else
                {
                    entity.TotalAmount = 0;
                }

                // Build search terms
                entity.BuildSearchTerms();
            }

            await base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override async Task InCreate_AfterInsertAsync<TCreateModel>(Transaction entity, TCreateModel createModel)
        {
            if (_currentTransactionDto != null && _currentTransactionDto.Attachments != null && _currentTransactionDto.Attachments.Any())
            {
                var dto = _currentTransactionDto;

                foreach (var attachmentDto in dto.Attachments)
                {
                    try
                    {
                        if (!string.IsNullOrEmpty(attachmentDto.Base64Content))
                        {
                            var attachment = await CreateAttachmentFromBase64(
                                entity.Id,
                                entity.CompanyId,
                                entity.ContactId,
                                attachmentDto.FileName,
                                attachmentDto.Base64Content,
                                attachmentDto.Root ?? "transaction"
                            );

                            // Add to repository
                            await _attachmentRepository.Create(attachment);
                        }
                    }
                    catch (Exception ex)
                    {
                        // Continue with other attachments
                    }
                }
            }

            await base.InCreate_AfterInsertAsync(entity, createModel);
        }

        protected override async Task InUpdate_BeforUpdateAsync<TUpdateModel>(Transaction entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateTransactionDto dto)
            {
                Console.WriteLine($"[Backend Service] InUpdate_BeforUpdateAsync - Before mapping");
                Console.WriteLine($"[Backend Service] DTO - Category: {dto.Category}, RevenueType: {dto.RevenueType}, ExpenseType: {dto.ExpenseType}, Date: {dto.Date}");
                Console.WriteLine($"[Backend Service] Entity BEFORE - Category: {entity.Category}, RevenueType: {entity.RevenueType}, ExpenseType: {entity.ExpenseType}, Date: {entity.Date}");

                // Store DTO for after update processing
                _currentUpdateTransactionDto = dto;

                // Map all fields from DTO to entity (this is critical - it applies the mapping profile)
                _mapper.Map(dto, entity);

                // Explicitly update Category if provided (handle nullable enum properly)
                if (dto.Category.HasValue)
                {
                    entity.Category = dto.Category.Value;
                    
                    // Clear opposite type when Category is set
                    if (dto.Category.Value == TransactionCategory.Revenue)
                    {
                        entity.ExpenseType = null;
                    }
                    else if (dto.Category.Value == TransactionCategory.Expense)
                    {
                        entity.RevenueType = null;
                    }
                }

                // Explicitly update RevenueType if provided
                if (dto.RevenueType.HasValue)
                {
                    entity.RevenueType = dto.RevenueType.Value;
                }

                // Explicitly update ExpenseType if provided
                if (dto.ExpenseType.HasValue)
                {
                    entity.ExpenseType = dto.ExpenseType.Value;
                }

                // Explicitly update Date if provided
                if (dto.Date.HasValue)
                {
                    entity.Date = dto.Date.Value;
                }

                // Update TotalAmount if payments changed
                if (dto.Payments != null && dto.Payments.Count > 0)
                {
                    entity.TotalAmount = dto.Payments.Sum(p => p.Amount * (1 + p.VatPercent / 100));
                }

                // Update status if provided
                if (dto.Status.HasValue)
                {
                    entity.Status = dto.Status.Value;
                }

                // Build search terms
                entity.BuildSearchTerms();

                Console.WriteLine($"[Backend Service] InUpdate_BeforUpdateAsync - After mapping");
                Console.WriteLine($"[Backend Service] Entity AFTER - Category: {entity.Category}, RevenueType: {entity.RevenueType}, ExpenseType: {entity.ExpenseType}, Date: {entity.Date}");
            }

            await base.InUpdate_BeforUpdateAsync(entity, updateModel);
        }

        protected override async Task InUpdate_AfterUpdateAsync<TUpdateModel>(Transaction entity, TUpdateModel updateModel)
        {
            if (_currentUpdateTransactionDto != null)
            {
                var dto = _currentUpdateTransactionDto;

                // Handle attachments to add
                if (dto.AttachmentsToAdd != null && dto.AttachmentsToAdd.Any())
                {
                    foreach (var attachmentDto in dto.AttachmentsToAdd)
                    {
                        try
                        {
                            if (!string.IsNullOrEmpty(attachmentDto.Base64Content))
                            {
                                var attachment = await CreateAttachmentFromBase64(
                                    entity.Id,
                                    entity.CompanyId,
                                    entity.ContactId,
                                    attachmentDto.FileName,
                                    attachmentDto.Base64Content,
                                    attachmentDto.Root ?? "transaction"
                                );

                                // Add to repository
                                await _attachmentRepository.Create(attachment);
                            }
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
                            if (attachmentResult.IsSuccess() && attachmentResult.Data != null)
                            {
                                var attachment = attachmentResult.Data;
                                if (attachment.TransactionId == entity.Id)
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

            await base.InUpdate_AfterUpdateAsync(entity, updateModel);
        }

        protected override async Task InDelete_BeforDeleteAsync(Transaction entity)
        {
            // Delete all attachments when deleting a transaction
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

            await base.InDelete_BeforDeleteAsync(entity);
        }

        protected override Task InPagedResult_BeforeListRetrievalAsync<IFilter>(IFilter filterOption)
        {
            if (filterOption is GetTransactionsFilter filter)
            {
                // Set CompanyId from session if not provided
                if (!filter.CompanyId.HasValue)
                {
                    filter.CompanyId = _session.CompanyId;
                }

                // Map Type to Category if Type is provided but Category is not
                if (filter.Type.HasValue && !filter.Category.HasValue)
                {
                    filter.Category = filter.Type.Value;
                }

                // Map SearchQuery to SearchTerm if SearchQuery is provided but SearchTerm is not
                if (!string.IsNullOrEmpty(filter.SearchQuery) && string.IsNullOrEmpty(filter.SearchTerm))
                {
                    filter.SearchTerm = filter.SearchQuery;
                }
            }

            return base.InPagedResult_BeforeListRetrievalAsync(filterOption);
        }

        public override async Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption)
        {
            // Hook: before retrieving the result
            await InPagedResult_BeforeListRetrievalAsync(filterOption);

            // Retrieve paged list result
            var entityQueryResult = _transactionRepository.GetAllFilter(filterOption);

            // Check the result
            if (!entityQueryResult.IsSuccess())
                return Result.Failure<PaginatedList<TOut>>();

            // Get the entities as a list (with pagination applied)
            var paginatedEntities = await entityQueryResult.Data.ToPaginatedListAsync(filterOption.CurrentPage, filterOption.PageSize, filterOption.Ignore);

            // Map entities to DTOs based on output type
            if (typeof(TOut) == typeof(TransactionListDto))
            {
                // Map to simplified list DTO
                var listDtos = paginatedEntities.Result.Select(entity => new TransactionListDto
                {
                    Id = entity.Id,
                    Category = entity.Category,
                    Type = entity.Category, // Map Category to Type for frontend compatibility
                    RevenueType = entity.RevenueType,
                    ExpenseType = entity.ExpenseType,
                    Status = entity.Status,
                    Date = entity.Date,
                    CreatedAt = entity.Date, // Use Date field for CreatedAt in list view (transaction date, not creation date)
                    ContactName = entity.Contact != null
                        ? (entity.Contact.IsACompany ? entity.Contact.CompanyName : $"{entity.Contact.FirstName} {entity.Contact.LastName}".Trim())
                        : "",
                    TotalAmount = entity.TotalAmount,
                    Description = entity.Description,
                    PropertyId = entity.PropertyId,
                    PropertyName = entity.Property != null ? entity.Property.Name : "",
                    PropertyIdentifier = entity.Property != null ? entity.Property.Identifier : "",
                    PropertyAddress = entity.Property != null ? entity.Property.Address : "",
                    OwnerName = entity.Property != null && entity.Property.Contact != null
                        ? (entity.Property.Contact.IsACompany ? entity.Property.Contact.CompanyName : $"{entity.Property.Contact.FirstName} {entity.Property.Contact.LastName}".Trim())
                        : "",
                    CompanyId = entity.CompanyId
                }).ToList();

                var result = new PaginatedList<TOut>
                {
                    CurrentPage = paginatedEntities.CurrentPage,
                    TotalPages = paginatedEntities.TotalPages,
                    TotalItems = paginatedEntities.TotalItems,
                    Result = listDtos as List<TOut>
                };

                return Result.Success(result);
            }
            else
            {
                // Map to full TransactionDto
                var transactionDtos = _mapper.Map<List<TransactionDto>>(paginatedEntities.Result);

                // Post-process DTOs to add related entity information
                for (int i = 0; i < transactionDtos.Count; i++)
                {
                    var dto = transactionDtos[i];
                    var entity = paginatedEntities.Result[i];

                    // Set property information
                    if (entity.Property != null)
                    {
                        dto.PropertyName = entity.Property.Name;
                        dto.PropertyAddress = entity.Property.Address;
                    }

                    // Set contact information
                    if (entity.Contact != null)
                    {
                        dto.ContactName = entity.Contact.IsACompany
                            ? entity.Contact.CompanyName
                            : $"{entity.Contact.FirstName} {entity.Contact.LastName}".Trim();
                    }

                    // Set lease information
                    if (entity.Lease != null && entity.Lease.Contact != null)
                    {
                        dto.LeaseTenantName = entity.Lease.Contact.IsACompany
                            ? entity.Lease.Contact.CompanyName
                            : $"{entity.Lease.Contact.FirstName} {entity.Lease.Contact.LastName}".Trim();
                    }

                    // Set attachment count
                    dto.AttachmentCount = entity.Attachments?.Count ?? 0;

                    // Generate attachment URLs if attachments exist
                    if (entity.Attachments != null && entity.Attachments.Any())
                    {
                        dto.Attachments = new List<AttachmentDto>();
                        foreach (var attachment in entity.Attachments)
                        {
                            try
                            {
                                var attachmentUrl = await _fileHelper.GenerateAttachmentUrlAsync(
                                    entity.CompanyId,
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

                var result = new PaginatedList<TOut>
                {
                    CurrentPage = paginatedEntities.CurrentPage,
                    TotalPages = paginatedEntities.TotalPages,
                    TotalItems = paginatedEntities.TotalItems,
                    Result = transactionDtos as List<TOut>
                };

                return Result.Success(result);
            }
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

            // Generate attachment URLs if the result is TransactionDto
            if (result.Data is TransactionDto dto)
            {
                // Get the entity to access attachments
                var entityResult = await _transactionRepository.GetByIdAsync(id);
                if (entityResult.IsSuccess() && entityResult.Data != null)
                {
                    var transaction = entityResult.Data;

                    // Set property information
                    if (transaction.Property != null)
                    {
                        dto.PropertyName = transaction.Property.Name;
                        dto.PropertyAddress = transaction.Property.Address;
                    }

                    // Set contact information
                    if (transaction.Contact != null)
                    {
                        dto.ContactName = transaction.Contact.IsACompany
                            ? transaction.Contact.CompanyName
                            : $"{transaction.Contact.FirstName} {transaction.Contact.LastName}".Trim();
                    }

                    // Set lease information
                    if (transaction.Lease != null && transaction.Lease.Contact != null)
                    {
                        dto.LeaseTenantName = transaction.Lease.Contact.IsACompany
                            ? transaction.Lease.Contact.CompanyName
                            : $"{transaction.Lease.Contact.FirstName} {transaction.Lease.Contact.LastName}".Trim();
                    }

                    // Set attachment count
                    dto.AttachmentCount = transaction.Attachments?.Count ?? 0;

                    // Generate attachment URLs if attachments exist
                    if (transaction.Attachments != null && transaction.Attachments.Any())
                    {
                        dto.Attachments = new List<AttachmentDto>();
                        foreach (var attachment in transaction.Attachments)
                        {
                            try
                            {
                                var attachmentUrl = await _fileHelper.GenerateAttachmentUrlAsync(
                                    transaction.CompanyId,
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

        private async Task<Attachment> CreateAttachmentFromBase64(
            Guid transactionId,
            Guid companyId,
            Guid contactId,
            string fileName,
            string base64Content,
            string root)
        {
            // Get contact folder name using helper
            var contactName = await _fileHelper.GetOwnerNameAsync(contactId);

            // Use the path structure: {contactName}/transaction
            var attachmentRoot = $"{contactName}/transaction";

            // Use FileAttachmentHelper to create attachment
            var attachment = await _fileHelper.CreateAttachmentFromBase64Async(
                companyId,
                base64Content,
                fileName,
                attachmentRoot,
                transactionId
            );

            // Set the TransactionId for the relationship
            attachment.TransactionId = transactionId;

            return attachment;
        }

        private string GetBucketName()
        {
            return _configuration["AWS:BucketName"] ?? "immogest-files";
        }

        /// <summary>
        /// Update transaction status
        /// </summary>
        public async Task<Result<TransactionDto>> UpdateStatusAsync(Guid id, TransactionStatus status)
        {
            try
            {
                // Get transaction using GetById (which doesn't use AsNoTracking, so entity can be tracked for update)
                var transactionResult = await _transactionRepository.GetById(id);
                if (!transactionResult.IsSuccess() || transactionResult.Data == null)
                {
                    return Result.Failure<TransactionDto>().WithMessage("Transaction not found");
                }

                var transaction = transactionResult.Data;

                // Check if user has access to this transaction's company
                if (transaction.CompanyId != _session.CompanyId)
                {
                    return Result.Failure<TransactionDto>().WithMessage("Access denied");
                }

                // Update only the status field directly
                transaction.Status = status;
                
                // Build search terms (in case status change affects search)
                transaction.BuildSearchTerms();

                // Update the entity
                var updateResult = await _transactionRepository.Update(transaction);
                if (!updateResult.IsSuccess())
                {
                    return Result.Failure<TransactionDto>().WithMessage("Error updating transaction status");
                }

                // Map to DTO and return
                var dto = _mapper.Map<TransactionDto>(updateResult.Data);
                return Result.Success(dto);
            }
            catch (Exception ex)
            {
                return Result.Failure<TransactionDto>().WithMessage($"Error updating transaction status: {ex.Message}");
            }
        }
    }
}

