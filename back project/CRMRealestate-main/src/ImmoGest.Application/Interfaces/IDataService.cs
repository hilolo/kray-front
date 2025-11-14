using ImmoGest.Application.DTOs;
using ImmoGest.Domain.Core.Interfaces;
using ResultNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Application.Interfaces
{
    public interface IDataService<TEntity>
    {
        Task<Result<TOut>> CreateAsync<TOut, TCreateModel>(TCreateModel createModel) where TCreateModel : class;
        Task<Result<TOut>> UpdateAsync<TOut, TUpdateModel>(Guid id, TUpdateModel updateModel) where TUpdateModel : class;
        Task<Result> DeleteAsync(Guid id);
        Task<Result<TOut>> GetByIdAsync<TOut>(Guid id);
        Task<Result<List<TOut>>> GetAllAsync<TOut>();
        Task<Result<PaginatedList<TOut>>> GetAsPagedResultAsync<TOut, IFilter>(IFilter filterOption) where IFilter : IFilterOptions;
    }
}
