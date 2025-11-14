using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using ResultNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ImmoGest.Infrastructure.Repositories
{
    public class NavigationRepository : Repository<NavigationItem>, INavigationRepository
    {
        public NavigationRepository(ApplicationDbContext dbContext) : base(dbContext)
        {
        }

        public async Task<Result<List<NavigationItem>>> GetHierarchicalAsync()
        {
            try
            {
                // Note: Deleted items are automatically filtered by global query filter
                var items = await DbSet
                    .Where(x => x.IsActive)
                    .Include(x => x.Children.Where(c => c.IsActive))
                    .OrderBy(x => x.Order)
                    .ToListAsync();

                // Filter out items that have parents (only return root items)
                var rootItems = items.Where(x => x.ParentId == null).ToList();

                return Result.Success(rootItems);
            }
            catch (Exception ex)
            {
                return Result.Failure<List<NavigationItem>>();
            }
        }
    }
}
