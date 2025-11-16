using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Application.Filters;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ImmoGest.Infrastructure.Repositories
{
    public class BuildingRepository : Repository<Building>, IBuildingRepository
    {
        public BuildingRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Building>> GetAllWithPropertiesAsync()
        {
            return await DbSet
                .Include(b => b.Properties)
                .Include(b => b.DefaultAttachment)
                .ToListAsync();
        }

        public async Task<Building> GetByIdWithPropertiesAsync(Guid id)
        {
            return await DbSet
                .Include(b => b.Properties)
                .Include(b => b.DefaultAttachment)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task UpdateDefaultAttachmentIdAsync(Guid buildingId, Guid? defaultAttachmentId)
        {
            // Get a fresh instance of the building from the database
            var building = await DbSet.FindAsync(buildingId);
            if (building != null)
            {
                building.DefaultAttachmentId = defaultAttachmentId;
                DbSet.Update(building);
                await Db.SaveChangesAsync();
            }
        }

        public async Task<int> CountPropertiesAsync(Guid buildingId)
        {
            return await Db.Set<Property>()
                .Where(p => p.BuildingId == buildingId && !p.IsDeleted)
                .CountAsync();
        }

        protected override IQueryable<Building> SetPagedResultFilterOptions<IFilter>(IQueryable<Building> query, IFilter filterOption)
        {
            if (filterOption is GetBuildingesFilter filter)
            {
                // Filter by company
                if (filter.CompanyId.HasValue)
                {
                    query = query.Where(b => b.CompanyId == filter.CompanyId.Value);
                }

                // Filter by IsArchived - default to false if not specified
                if (filter.IsArchived.HasValue)
                {
                    query = query.Where(b => b.IsArchived == filter.IsArchived.Value);
                }
                else
                {
                    // Default: only show non-archived buildings
                    query = query.Where(b => !b.IsArchived);
                }
            }

            return base.SetPagedResultFilterOptions(query, filterOption);
        }
    }
}

