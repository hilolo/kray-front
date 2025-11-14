using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Auth.Interfaces;
using Microsoft.EntityFrameworkCore;
using ResultNet;

namespace ImmoGest.Application.Services
{
    public class MaintenanceService : DataServiceBase<Maintenance>, IMaintenanceService
    {
        private readonly IMaintenanceRepository _maintenanceRepository;
        private readonly IContactRepository _contactRepository;
        private readonly IPropertyRepository _propertyRepository;
        private readonly IAttachmentRepository _attachmentRepository;
        private readonly IMapper _mapper;
        private readonly ISession _session;
        private readonly FileAttachmentHelper _fileHelper;

        public MaintenanceService(
            IMapper mapper,
            IMaintenanceRepository maintenanceRepository,
            IContactRepository contactRepository,
            IPropertyRepository propertyRepository,
            IAttachmentRepository attachmentRepository,
            ISession session,
            FileAttachmentHelper fileHelper)
            : base(mapper, maintenanceRepository)
        {
            _maintenanceRepository = maintenanceRepository;
            _contactRepository = contactRepository;
            _propertyRepository = propertyRepository;
            _attachmentRepository = attachmentRepository;
            _mapper = mapper;
            _session = session;
            _fileHelper = fileHelper;
        }

        protected override async Task InCreate_BeforInsertAsync<TCreateModel>(Maintenance entity, TCreateModel createModel)
        {
            if (createModel is CreateMaintenanceDto dto)
            {
                // Validate that the contact is a service type
                var contactResult = await _contactRepository.GetByIdAsync(dto.ContactId);
                if (contactResult.IsSuccess() && contactResult.Data != null)
                {
                    if (contactResult.Data.Type != ContactType.Service)
                    {
                        throw new InvalidOperationException("Contact must be of Service type for maintenance requests.");
                    }
                }
                else
                {
                    throw new InvalidOperationException("Contact not found.");
                }

                // Set CompanyId from session if not provided
                if (!dto.CompanyId.HasValue || dto.CompanyId.Value == Guid.Empty)
                {
                    entity.CompanyId = _session.CompanyId;
                }
            }

            await base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override async Task InUpdate_BeforUpdateAsync<TUpdateModel>(Maintenance entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateMaintenanceDto dto)
            {
                // Validate that the contact is a service type
                var contactResult = await _contactRepository.GetByIdAsync(dto.ContactId);
                if (contactResult.IsSuccess() && contactResult.Data != null)
                {
                    if (contactResult.Data.Type != ContactType.Service)
                    {
                        throw new InvalidOperationException("Contact must be of Service type for maintenance requests.");
                    }
                }
                else
                {
                    throw new InvalidOperationException("Contact not found.");
                }

                // Map the DTO to the entity using AutoMapper
                _mapper.Map(dto, entity);
            }

            await base.InUpdate_BeforUpdateAsync(entity, updateModel);
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
            var entityQueryResult = _maintenanceRepository.GetAllFilter(filterOption);

            // Check the result
            if (!entityQueryResult.IsSuccess())
                return Result.Failure<PaginatedList<TOut>>();

            // Get the entities as a list (with pagination applied)
            var paginatedEntities = await entityQueryResult.Data.ToPaginatedListAsync(filterOption.CurrentPage, filterOption.PageSize, filterOption.Ignore);
            
            // Map entities to DTOs
            var maintenanceDtos = _mapper.Map<List<MaintenanceDto>>(paginatedEntities.Result);

            // Post-process the DTOs to add property image URLs (requires S3 URL generation)
            // All other fields (PropertyName, PropertyAddress, OwnerName, OwnerPhone, CompanyName, ContactName, etc.) are handled by AutoMapper
            if (typeof(TOut) == typeof(MaintenanceDto))
            {
                for (int i = 0; i < maintenanceDtos.Count; i++)
                {
                    var dto = maintenanceDtos[i];
                    var entity = paginatedEntities.Result[i];

                    try
                    {
                        // Generate property image URL if default attachment exists
                        if (entity.Property != null && entity.Property.DefaultAttachmentId.HasValue)
                        {
                            try
                            {
                                var attachmentResult = await _attachmentRepository.GetByIdAsync(entity.Property.DefaultAttachmentId.Value);
                                if (attachmentResult.IsSuccess() && attachmentResult.Data != null)
                                {
                                    var attachment = attachmentResult.Data;
                                    // Use helper to generate URL
                                    dto.PropertyImageUrl = await _fileHelper.GenerateAttachmentUrlAsync(
                                        entity.CompanyId,
                                        attachment,
                                        24
                                    );
                                }
                            }
                            catch (Exception)
                            {
                                dto.PropertyImageUrl = null;
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        // Continue with other maintenances
                    }
                }
            }

            // Create the paginated result with the DTOs
            var result = new PaginatedList<TOut>
            {
                CurrentPage = paginatedEntities.CurrentPage,
                TotalPages = paginatedEntities.TotalPages,
                TotalItems = paginatedEntities.TotalItems,
                Result = maintenanceDtos as List<TOut>
            };

            return Result.Success(result);
        }

        public override async Task<Result<TOut>> GetByIdAsync<TOut>(Guid id)
        {
            // Call base method
            var result = await base.GetByIdAsync<TOut>(id);
            
            if (!result.IsSuccess())
                return result;

            // Add property image URL if the result is MaintenanceDto (requires S3 URL generation)
            // All other fields (PropertyName, PropertyAddress, OwnerName, OwnerPhone, CompanyName, ContactName, etc.) are handled by AutoMapper
            if (result.Data is MaintenanceDto dto)
            {
                var entityResult = await _maintenanceRepository.GetByIdAsync(id);
                if (entityResult != null && entityResult.IsSuccess() && entityResult.Data != null)
                {
                    var maintenance = entityResult.Data;
                    
                    // Generate property image URL if default attachment exists
                    if (maintenance.Property != null && maintenance.Property.DefaultAttachmentId.HasValue)
                    {
                        try
                        {
                            var attachmentResult = await _attachmentRepository.GetByIdAsync(maintenance.Property.DefaultAttachmentId.Value);
                            if (attachmentResult.IsSuccess() && attachmentResult.Data != null)
                            {
                                var attachment = attachmentResult.Data;
                                // Use helper to generate URL
                                dto.PropertyImageUrl = await _fileHelper.GenerateAttachmentUrlAsync(
                                    maintenance.CompanyId,
                                    attachment,
                                    24
                                );
                            }
                        }
                        catch (Exception)
                        {
                            dto.PropertyImageUrl = null;
                        }
                    }
                }
            }

            return result;
        }

        public async Task<Result> UpdateStatusAsync(Guid maintenanceId, MaintenanceStatus status)
        {
            var entityResult = await _maintenanceRepository.GetByIdAsync(maintenanceId);
            if (!entityResult.IsSuccess() || entityResult.Data == null)
                return Result.Failure();

            var maintenance = entityResult.Data;
            maintenance.Status = status;

            var updateResult = await _maintenanceRepository.Update(maintenance);
            if (updateResult.IsSuccess())
                return Result.Success();

            return Result.Failure();
        }
    }
}

