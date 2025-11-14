using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Application.Filters;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using ResultNet;

namespace ImmoGest.Infrastructure.Repositories
{
    public class KeyRepository : Repository<Key>, IKeyRepository
    {
        public KeyRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Result<Key>> GetByIdAsync(Guid id)
        {
            var entity = await DbSet
                .AsNoTracking()
                .Include(k => k.Property)
                    .ThenInclude(p => p.Building)
                .Include(k => k.Property)
                    .ThenInclude(p => p.Contact)
                .FirstOrDefaultAsync(e => e.Id == id);

            return entity != null
                ? Result.Success<Key>(entity)
                : Result.Failure<Key>();
        }

        public override Result<IQueryable<Key>> GetAllFilter<IFilter>(IFilter filterOption)
        {
            var query = DbSet.AsNoTracking()
                .Include(k => k.Property)
                    .ThenInclude(p => p.Building)
                .Include(k => k.Property)
                    .ThenInclude(p => p.Contact)
                .AsQueryable();

            // Apply search query filter - search in key fields and property fields
            if (!string.IsNullOrEmpty(filterOption.SearchQuery))
            {
                var searchTerm = filterOption.SearchQuery.ToUpper();
                query = query.Where(k => 
                    k.SearchTerms.Contains(searchTerm) ||
                    (k.Property != null && (
                        k.Property.Name.ToUpper().Contains(searchTerm) ||
                        k.Property.Identifier.ToUpper().Contains(searchTerm) ||
                        (!string.IsNullOrEmpty(k.Property.Address) && k.Property.Address.ToUpper().Contains(searchTerm))
                    ))
                );
            }

            query = SetPagedResultFilterOptions(query, filterOption);

            return Result.Success<IQueryable<Key>>(query);
        }

        protected override IQueryable<Key> SetPagedResultFilterOptions<IFilter>(IQueryable<Key> query, IFilter filterOption)
        {
            if (filterOption is GetKeysFilter filter)
            {
                // Filter by property
                if (filter.PropertyId.HasValue)
                {
                    query = query.Where(k => k.PropertyId == filter.PropertyId.Value);
                }
            }

            // Include related entities (if not already included)
            // EF Core handles duplicate includes gracefully, so this is safe
            query = query.Include(k => k.Property)
                         .ThenInclude(p => p.Building);

            return base.SetPagedResultFilterOptions(query, filterOption);
        }
    }
}

