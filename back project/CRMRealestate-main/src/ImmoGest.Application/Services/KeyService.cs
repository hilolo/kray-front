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
using ResultNet;

namespace ImmoGest.Application.Services
{
    public class KeyService : DataServiceBase<Key>, IKeyService
    {
        private readonly IKeyRepository _keyRepository;
        private readonly IMapper _mapper;

        public KeyService(
            IMapper mapper,
            IKeyRepository keyRepository)
            : base(mapper, keyRepository)
        {
            _mapper = mapper;
            _keyRepository = keyRepository;
        }

        protected override Task InCreate_BeforInsertAsync<TCreateModel>(Key entity, TCreateModel createModel)
        {
            entity.BuildSearchTerms();
            return base.InCreate_BeforInsertAsync(entity, createModel);
        }

        protected override Task InUpdate_BeforUpdateAsync<TUpdateModel>(Key entity, TUpdateModel updateModel)
        {
            // Map the update model to the entity
            if (updateModel is UpdateKeyDto updateDto)
            {
                entity.Name = updateDto.Name;
                entity.Description = updateDto.Description;
                entity.PropertyId = updateDto.PropertyId;
            }
            
            entity.BuildSearchTerms();
            return base.InUpdate_BeforUpdateAsync(entity, updateModel);
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

        public override async Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption)
        {
            // Hook: before retrieving the result
            await InPagedResult_BeforeListRetrievalAsync(filterOption);

            // Retrieve paged list result - this returns an IQueryable with Include statements applied by the repository
            var entityQueryResult = _keyRepository.GetAllFilter(filterOption);

            // Check the result
            if (!entityQueryResult.IsSuccess())
                return Result.Failure<PaginatedList<TOut>>();

            // Get the entities as a list (with pagination applied)
            // The Include statements from SetPagedResultFilterOptions should be applied here
            var paginatedEntities = await entityQueryResult.Data.ToPaginatedListAsync(filterOption.CurrentPage, filterOption.PageSize, filterOption.Ignore);
            
            // Map entities to DTOs
            var keyDtos = _mapper.Map<List<KeyDto>>(paginatedEntities.Result);

            // Post-process the DTOs to manually map Property (to avoid circular reference issues)
            if (typeof(TOut) == typeof(KeyDto))
            {
                for (int i = 0; i < keyDtos.Count; i++)
                {
                    var dto = keyDtos[i];
                    var entity = paginatedEntities.Result[i];

                    // Manually map Property if it exists
                    if (entity.Property != null)
                    {
                        dto.Property = _mapper.Map<PropertyDto>(entity.Property);
                        
                        // Map Building if it exists
                        if (entity.Property.Building != null && dto.Property != null)
                        {
                            dto.Property.Building = new PropertyBuildingDto
                            {
                                Id = entity.Property.Building.Id,
                                Name = entity.Property.Building.Name
                            };
                        }
                        
                        // Set OwnerName from Contact if available
                        if (entity.Property.Contact != null && dto.Property != null)
                        {
                            dto.Property.OwnerName = $"{entity.Property.Contact.FirstName} {entity.Property.Contact.LastName}".Trim();
                        }
                    }
                }
            }

            // Create paginated result with mapped DTOs
            var paginatedResult = new PaginatedList<TOut>
            {
                CurrentPage = paginatedEntities.CurrentPage,
                TotalPages = paginatedEntities.TotalPages,
                TotalItems = paginatedEntities.TotalItems,
                Result = keyDtos.Cast<TOut>().ToList()
            };

            return Result.Success<PaginatedList<TOut>>(paginatedResult);
        }
    }
}

