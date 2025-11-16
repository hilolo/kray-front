using System;
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
using ImmoGest.Domain;

namespace ImmoGest.Application.Services
{
    public class TaskService : DataServiceBase<TaskItem>, ITaskService
    {
        private readonly ITaskRepository _taskRepository;
        private readonly IMapper _mapper;
        private readonly ISession _session;

        public TaskService(
            IMapper mapper,
            ITaskRepository taskRepository,
            ISession session)
            : base(mapper, taskRepository)
        {
            _taskRepository = taskRepository;
            _mapper = mapper;
            _session = session;
        }

        protected override async System.Threading.Tasks.Task InCreate_BeforInsertAsync<TCreateModel>(TaskItem entity, TCreateModel createModel)
        {
            // Set CompanyId from session
            entity.CompanyId = _session.CompanyId;
            
            // Set default status to ToDo if not provided
            if (createModel is CreateTaskDto dto && dto.Status == null)
            {
                entity.Status = ImmoGest.Domain.Entities.Enums.TaskStatus.ToDo;
            }
            else if (entity.Status == 0) // If status is default enum value (0)
            {
                entity.Status = ImmoGest.Domain.Entities.Enums.TaskStatus.ToDo;
            }
            
            await base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override async System.Threading.Tasks.Task InGet_AfterMappingAsync<TOut>(TaskItem entity, TOut mappedEntity)
        {
            if (mappedEntity is TaskDto dto)
            {
                // Populate assigned user name
                if (entity.AssignedUser != null)
                {
                    dto.AssignedUserName = entity.AssignedUser.Name;
                }

                // Populate contact name and identifier
                if (entity.ContactId.HasValue && entity.Contact != null)
                {
                    dto.ContactName = entity.Contact.IsACompany 
                        ? entity.Contact.CompanyName 
                        : $"{entity.Contact.FirstName} {entity.Contact.LastName}";
                    dto.ContactIdentifier = entity.Contact.Identifier;
                }

                // Populate property name, identifier, and address
                if (entity.PropertyId.HasValue && entity.Property != null)
                {
                    dto.PropertyName = entity.Property.Name ?? entity.Property.Identifier;
                    dto.PropertyIdentifier = entity.Property.Identifier;
                    dto.PropertyAddress = entity.Property.Address;
                }

                // Map dates
                dto.CreatedAt = entity.CreatedOn.DateTime;
                dto.UpdatedAt = entity.LastModifiedOn?.DateTime;
            }
            await base.InGet_AfterMappingAsync(entity, mappedEntity);
        }

        protected override async System.Threading.Tasks.Task InUpdate_BeforUpdateAsync<TUpdateModel>(TaskItem entity, TUpdateModel updateModel)
        {
            if (updateModel is UpdateTaskDto dto)
            {
                // Ensure the task belongs to the current company
                if (entity.CompanyId != _session.CompanyId)
                {
                    throw new UnauthorizedAccessException("Task does not belong to the current company");
                }

                // Map all fields from DTO to entity
                _mapper.Map(dto, entity);
                
                // Set LastModifiedOn timestamp
                entity.LastModifiedOn = DateTimeOffset.UtcNow;
            }
            
            await base.InUpdate_BeforUpdateAsync(entity, updateModel);
        }

        protected override System.Threading.Tasks.Task InPagedResult_BeforeListRetrievalAsync<IFilter>(IFilter filterOption)
        {
            filterOption.CompanyId = _session.CompanyId;
            return base.InPagedResult_BeforeListRetrievalAsync(filterOption);
        }

        public override async System.Threading.Tasks.Task<Result<TOut>> UpdateAsync<TOut, TUpdateModel>(Guid id, TUpdateModel updateModel)
        {
            // Call base update method
            var result = await base.UpdateAsync<TOut, TUpdateModel>(id, updateModel);
            
            // If update was successful and result is TaskDto, populate related entity names
            if (result.IsSuccess() && result.Data != null && typeof(TOut) == typeof(TaskDto))
            {
                var dto = result.Data as TaskDto;
                if (dto != null)
                {
                    // Reload entity with includes to get related entity names
                    var entityResult = await _taskRepository.GetByIdAsync(dto.Id);
                    if (entityResult.IsSuccess() && entityResult.Data != null)
                    {
                        var entity = entityResult.Data;
                        
                        // Populate related entity names
                        if (entity.AssignedUser != null)
                        {
                            dto.AssignedUserName = entity.AssignedUser.Name;
                        }
                        if (entity.Contact != null)
                        {
                            dto.ContactName = entity.Contact.IsACompany 
                                ? entity.Contact.CompanyName 
                                : $"{entity.Contact.FirstName} {entity.Contact.LastName}";
                            dto.ContactIdentifier = entity.Contact.Identifier;
                        }
                        if (entity.Property != null)
                        {
                            dto.PropertyName = entity.Property.Name ?? entity.Property.Identifier;
                            dto.PropertyIdentifier = entity.Property.Identifier;
                            dto.PropertyAddress = entity.Property.Address;
                        }
                        
                        // Update dates
                        dto.CreatedAt = entity.CreatedOn.DateTime;
                        dto.UpdatedAt = entity.LastModifiedOn?.DateTime;
                    }
                }
            }
            
            return result;
        }

        public override async System.Threading.Tasks.Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption)
        {
            // Call base implementation to get the paged result
            var result = await base.GetAsPagedResultAsync<TOut, IFilter>(filterOption);

            if (!result.IsSuccess() || result.Data == null)
                return result;

            // Post-process the DTOs to add related entity names
            if (typeof(TOut) == typeof(TaskDto))
            {
                var paginatedList = result.Data;
                var dtos = paginatedList.Result as System.Collections.Generic.List<TaskDto>;

                if (dtos != null && dtos.Count > 0)
                {
                    // The repository already includes related entities, so we can access them
                    // But we need to reload with includes for the DTOs
                    foreach (var dto in dtos)
                    {
                        // Get the entity with includes to populate names
                        var entityResult = await _taskRepository.GetByIdAsync(dto.Id);
                        if (entityResult.IsSuccess() && entityResult.Data != null)
                        {
                            var entity = entityResult.Data;
                            
                            // Related entities should already be loaded by the repository's GetAllFilter method
                            // which includes AssignedUser, Contact, and Property

                            // Populate names
                            if (entity.AssignedUser != null)
                            {
                                dto.AssignedUserName = entity.AssignedUser.Name;
                            }
                            if (entity.Contact != null)
                            {
                                dto.ContactName = entity.Contact.IsACompany 
                                    ? entity.Contact.CompanyName 
                                    : $"{entity.Contact.FirstName} {entity.Contact.LastName}";
                                dto.ContactIdentifier = entity.Contact.Identifier;
                            }
                            if (entity.Property != null)
                            {
                                dto.PropertyName = entity.Property.Name ?? entity.Property.Identifier;
                                dto.PropertyIdentifier = entity.Property.Identifier;
                                dto.PropertyAddress = entity.Property.Address;
                            }
                        }
                    }
                }
            }

            return result;
        }

        public async System.Threading.Tasks.Task<Result<TaskDto>> UpdateStatusAsync(Guid id, ImmoGest.Domain.Entities.Enums.TaskStatus status)
        {
            var entityResult = await _taskRepository.GetById(id);
            if (!entityResult.IsSuccess() || entityResult.Data == null)
            {
                return Result.Failure<TaskDto>().WithCode(MessageCode.NotFound);
            }

            var entity = entityResult.Data;

            // Ensure the task belongs to the current company
            if (entity.CompanyId != _session.CompanyId)
            {
                return Result.Failure<TaskDto>().WithCode(MessageCode.NotFound);
            }

            // Update status
            entity.Status = status;
            entity.LastModifiedOn = DateTimeOffset.UtcNow;

            var updateResult = await _taskRepository.Update(entity);
            if (updateResult.IsFailure())
            {
                return Result.Failure<TaskDto>();
            }

            // Map to DTO
            var dto = _mapper.Map<TaskDto>(updateResult.Data);
            
            // Populate related entity names
            if (updateResult.Data.AssignedUser != null)
            {
                dto.AssignedUserName = updateResult.Data.AssignedUser.Name;
            }
            if (updateResult.Data.Contact != null)
            {
                dto.ContactName = updateResult.Data.Contact.IsACompany 
                    ? updateResult.Data.Contact.CompanyName 
                    : $"{updateResult.Data.Contact.FirstName} {updateResult.Data.Contact.LastName}";
                dto.ContactIdentifier = updateResult.Data.Contact.Identifier;
            }
            if (updateResult.Data.Property != null)
            {
                dto.PropertyName = updateResult.Data.Property.Name ?? updateResult.Data.Property.Identifier;
                dto.PropertyIdentifier = updateResult.Data.Property.Identifier;
                dto.PropertyAddress = updateResult.Data.Property.Address;
            }

            dto.CreatedAt = updateResult.Data.CreatedOn.DateTime;
            dto.UpdatedAt = updateResult.Data.LastModifiedOn?.DateTime;

            return Result.Success(dto);
        }
    }
}

