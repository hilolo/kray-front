namespace ImmoGest.Application.Services
{
    using AutoMapper;
    using global::ImmoGest.Application.Interfaces;
    using global::ImmoGest.Domain.Core.Interfaces;
    using global::ImmoGest.Domain.Repositories;
    using ImmoGest.Application.DTOs;
    using ImmoGest.Application.DTOs.User;
    using ImmoGest.Application.Filters;
    using ImmoGest.Domain;
    using ImmoGest.Domain.Core.Entities;
    using Microsoft.Extensions.Logging;
    using ResultNet;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;

    public class DataServiceBase<TEntity> : IDataService<TEntity> where TEntity : class
    {
        private readonly IMapper _mapper;
        private readonly IRepository<TEntity> _repository;

        public DataServiceBase(IMapper mapper, IRepository<TEntity> repository)
        {
            _mapper = mapper;
            _repository = repository;
        }
        public virtual async Task<Result<TOut>> CreateAsync<TOut, TCreateModel>(TCreateModel createModel) where TCreateModel : class
        {
            var entity = _mapper.Map<TEntity>(createModel);

            /* Hook : validating the entity */
            await InCreate_ValidateEntityAsync(entity);

            /* Hook : before inserting into database */
            await InCreate_BeforInsertAsync(entity, createModel);

            // recored history

            var addResult = await _repository.Create(entity);


            /* Hook : after inserting the entity */
            await InCreate_AfterInsertAsync(entity, createModel);

            // map and return the created entity
            return Result.Success(_mapper.Map<TOut>(addResult.Data));
        }
        public virtual async Task<Result<TOut>> UpdateAsync<TOut, TUpdateModel>(Guid id, TUpdateModel updateModel) where TUpdateModel : class
        {
            // get the entity by id
            var entity = await _repository.GetById(id);
            if (entity is null)
                return Result.Failure<TOut>().WithCode(MessageCode.NotFound);

            /* Hook: validating the entity */
            await InUpdate_ValidateEntityAsync(entity, updateModel);

            /* Hook : before inserting into database */
            await InUpdate_BeforUpdateAsync(entity, updateModel);

            // update the entity
            var updateResult = await _repository.Update(entity);
            if (updateResult.IsFailure())
                return Result.Failure<TOut>();

            /* Hook : before inserting into database */
            await InUpdate_AfterUpdateAsync(entity, updateModel);


            return Result.Success(_mapper.Map<TOut>(updateResult.Data));
        }
        public virtual async Task<Result> DeleteAsync(Guid id)
        {
            var entity = await _repository.GetById(id);
            if (entity is null)
                return Result.Failure().WithCode(MessageCode.NotFound);

            /* Hook : before deleting the entity */
            await InDelete_BeforDeleteAsync(entity);

            // delete the entity
            var deleteResult = _repository.Delete(id);
            if (deleteResult.Result.IsSuccess())
                return deleteResult.Result;

            /*hook: after a successful delete*/
            await InDelete_AfterDeleteAsync(entity);

            return deleteResult.Result;
        }
        public virtual async Task<Result<TOut>> GetByIdAsync<TOut>(Guid id)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity is null || entity.Data is null)
                return Result.Failure<TOut>();

            var mappedEntity = _mapper.Map<TOut>(entity.Data);

            /*hook after mapping the entity*/
            await InGet_AfterMappingAsync(entity.Data, mappedEntity);

            return Result.Success(mappedEntity);
        }
        public virtual async Task<Result<List<TOut>>> GetAllAsync<TOut>()
        {
            var entities = await _repository.GetAllAsync();
            return Result<List<TOut>>.Success(_mapper.Map<List<TOut>>(entities));
        }
        public virtual async Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption) where IFilter : IFilterOptions
        {
            /* Hook: before retrieving the result */
            await InPagedResult_BeforeListRetrievalAsync(filterOption);

            // retrieve paged list result
            var result = _repository.GetAllFilter(filterOption);

            // check the result
            if (!result.IsSuccess())
                return Result.Failure<PaginatedList<TOut>>(); 

            // map and return the result
            return Result.Success<PaginatedList<TOut>>(await _mapper.ProjectTo<TOut>(result.Data).ToPaginatedListAsync(filterOption.CurrentPage, filterOption.PageSize, filterOption.Ignore));
        }

        #region Hooks Create
        /// <summary>
        /// use this method to apply all necessary validation to the entity
        /// if one of your validation has failed throw an exception of type <see cref="ArtinoveValidationException"/>
        /// if everything is good and nothing failed just return;
        /// </summary>
        /// <param name="entity">the entity instant to validate</param>
        protected virtual Task InCreate_ValidateEntityAsync(TEntity entity)
            => Task.CompletedTask;

        /// <summary>
        /// this hook will be called before the entity is inserted to the database
        /// </summary>
        /// <typeparam name="TCreateModel">the create model type</typeparam>
        /// <param name="entity">the entity instant</param>
        /// <param name="createModel">the entity creation model</param>
        protected virtual Task InCreate_BeforInsertAsync<TCreateModel>(TEntity entity, TCreateModel createModel) where TCreateModel : class
            => Task.CompletedTask;

        /// <summary>
        /// this hook will be called after the entity is inserted to the database successfully
        /// </summary>
        /// <typeparam name="TCreateModel">the create model type</typeparam>
        /// <param name="entity">the entity instant</param>
        /// <param name="createModel">the entity creation model</param>
        protected virtual Task InCreate_AfterInsertAsync<TCreateModel>(TEntity entity, TCreateModel createModel) where TCreateModel : class
            => Task.CompletedTask;

        #endregion

        #region Hooks Update

        /// <summary>
        /// use this method to apply all necessary validation to the entity
        /// if one of your validation has failed throw an exception of type <see cref="ArtinoveValidationException"/>
        /// if everything is good and nothing failed just return;
        /// </summary>
        /// <param name="entity">the entity instant to validate</param>
        protected virtual Task InUpdate_ValidateEntityAsync<TUpdateModel>(TEntity entity, TUpdateModel updateModel) where TUpdateModel : class
            => Task.CompletedTask;

        /// <summary>
        /// this hook will be called before the entity is updated in database
        /// </summary>
        /// <param name="entity">the entity instant</param>
        protected virtual Task InUpdate_BeforUpdateAsync<TUpdateModel>(TEntity entity, TUpdateModel updateModel) where TUpdateModel : class
            => Task.CompletedTask;

        /// <summary>
        /// this hook will be called after the entity is updated in database
        /// </summary>
        /// <param name="entity">the entity instant</param>
        protected virtual Task InUpdate_AfterUpdateAsync<TUpdateModel>(TEntity entity, TUpdateModel updateModel) where TUpdateModel : class
            => Task.CompletedTask;

        #endregion

        #region Hooks Delete

        /// <summary>
        /// use this method to apply all necessary validation to the entity
        /// if one of your validation has failed throw an exception of type <see cref="ArtinoveValidationException"/>
        /// if everything is good and nothing failed just return;
        /// </summary>
        /// <param name="entity">the entity instant to validate</param>
        protected virtual Task InDelete_BeforDeleteAsync(TEntity entity)
            => Task.CompletedTask;

        /// <summary>
        /// after a successful delete of an entity
        /// </summary>
        /// <param name="entity">the entity instant</param>
        protected virtual Task InDelete_AfterDeleteAsync(TEntity entity)
            => Task.CompletedTask;

        #endregion

        #region Hooks Get

        /// <summary>
        /// after mapping the entity
        /// </summary>
        /// <typeparam name="TOut">the output Type</typeparam>
        /// <param name="entity">the entity instant</param>
        /// <param name="mappedEntity">the mapped entity instant</param>
        protected virtual Task InGet_AfterMappingAsync<TOut>(TEntity entity, TOut mappedEntity)
            => Task.CompletedTask;

        /// <summary>
        /// before the paged list retrieved
        /// </summary>
        /// <typeparam name="IFilter">the type of the filter</typeparam>
        /// <param name="filterOption">the filter options instant</param>
        protected virtual Task InPagedResult_BeforeListRetrievalAsync<IFilter>(IFilter filterOption)
            where IFilter : IFilterOptions => Task.CompletedTask;

        #endregion

        #region Helper Methods

        /// <summary>
        /// Sanitizes a folder name by removing invalid characters and converting to UPPERCASE
        /// Used for consistent S3 folder naming across contacts and properties
        /// </summary>
        /// <param name="name">The name to sanitize</param>
        /// <returns>Sanitized uppercase folder name</returns>
        protected string SanitizeFolderName(string name)
        {
            if (string.IsNullOrEmpty(name))
                return "UNNAMED";
            
            // Remove or replace invalid characters for folder names
            var invalidChars = System.IO.Path.GetInvalidFileNameChars();
            var sanitized = new string(name.Select(c => 
                invalidChars.Contains(c) ? '-' : c
            ).ToArray());
            
            // Remove spaces and convert to UPPERCASE for consistency
            sanitized = sanitized.Replace(" ", "-").ToUpperInvariant();
            
            return string.IsNullOrEmpty(sanitized) ? "UNNAMED" : sanitized;
        }

        #endregion

    }
}
