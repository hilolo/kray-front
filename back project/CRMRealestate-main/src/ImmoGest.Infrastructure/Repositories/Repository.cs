using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ImmoGest.Domain;
using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using ResultNet;

namespace ImmoGest.Infrastructure.Repositories
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity : Entity
    {
        public Repository(ApplicationDbContext dbContext)
        {
            Db = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            DbSet = Db.Set<TEntity>();
        }

        #region CRUD operations
        protected ApplicationDbContext Db { get; }
        protected DbSet<TEntity> DbSet { get; }
        public virtual async Task<Result<TEntity>> GetById(Guid id)
        {
            TEntity entity = await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            return entity != null
                ? Result.Success<TEntity>(entity)
                : Result.Failure<TEntity>();
        }

        public virtual async Task<Result<TEntity>> Create(TEntity entity)
        {
            entity.BuildSearchTerms();
            await DbSet.AddAsync(entity);
            await Db.SaveChangesAsync();
            return Result.Success<TEntity>(entity);
        }
        public virtual Result<IQueryable<TEntity>> GetAllFilter<IFilter>(IFilter filterOption) where IFilter : IFilterOptions
        {
            var query =  DbSet.AsNoTracking();

            if (!string.IsNullOrEmpty(filterOption.SearchQuery))
                query = query.Where(e => e.SearchTerms.Contains(filterOption.SearchQuery.ToUpper()));

            query = SetPagedResultFilterOptions(query, filterOption);

            return Result.Success<IQueryable<TEntity>>(query);
        }
        public virtual async Task<Result<List<TEntity>>> GetAllAsync()
          => Result.Success<List<TEntity>>(await DbSet.AsNoTracking().ToListAsync());
        public virtual async Task<Result<TEntity>> GetByIdAsync(Guid id)
        => Result.Success<TEntity>(await DbSet
                        .AsNoTracking()
                        .FirstOrDefaultAsync(e => e.Id == id));
        public virtual async Task<Result<TEntity>> Update(TEntity entity)
        {
            entity.BuildSearchTerms();
            await UpdateAsync(entity);
            await Db.SaveChangesAsync();
            return Result.Success<TEntity>(entity);
        }
        public virtual async Task<Result> Delete(Guid id)
        {
            var entity = await DbSet.FindAsync(id);

            if (entity is IDeletable deletable)
            {
                deletable.IsDeleted = true;

                // update the entity
                var result = DbSet.Update(entity);
                await Db.SaveChangesAsync();

                return Result.Success();
            }

            DbSet.Remove(entity);
            await Db.SaveChangesAsync();
            return Result.Success();
        }
        public virtual async Task<Result> SaveChangesAsync() => await Db.SaveChangesAsync() == 0 ? Result.Success() : Result.Failure();

        #endregion

        #region common
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        protected virtual void Dispose(bool disposing)
        {
            if (disposing) Db.Dispose();
        }
        public virtual async Task<Result<TEntity>> UpdateAsync(TEntity entity, bool setDefaultData = true)
        {
            try
            {
                var entry = DbSet.Update(entity);
                return entry.Entity;
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Result.Failure<TEntity>();
            }
            catch (Exception ex)
            {
                return Result.Failure<TEntity>();
            }

        }
        protected virtual IQueryable<TEntity> SetPagedResultFilterOptions<IFilter>(IQueryable<TEntity> query, IFilter filterOption) where IFilter : IFilterOptions => query;
        #endregion

    }
}
