using ImmoGest.Domain.Core.Entities;
using ResultNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Core.Interfaces
{
    public interface IRepository<TEntity> : IDisposable where TEntity : class
    {
        Task<Result<TEntity>> GetById(Guid id);
        Task<Result<TEntity>> Create(TEntity entity);
        Result<IQueryable<TEntity>> GetAllFilter<IFilter>(IFilter filterOption) where IFilter : IFilterOptions;
        Task<Result<List<TEntity>>> GetAllAsync();
        Task<Result<TEntity>> GetByIdAsync(Guid id);
        Task<Result<TEntity>> Update(TEntity entity);
        Task<Result> Delete(Guid id);
        Task<Result> SaveChangesAsync();
    }
}
