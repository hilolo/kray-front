using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Application.Filters;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using ResultNet;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ImmoGest.Infrastructure.Repositories
{
    public class MaintenanceRepository : Repository<Maintenance>, IMaintenanceRepository
    {
        public MaintenanceRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Result<Maintenance>> GetByIdAsync(Guid id)
        {
            // Load maintenance with all related entities
            var maintenance = await DbSet
                .AsNoTracking()
                .Include(m => m.Property)
                    .ThenInclude(p => p.DefaultAttachment)
                .Include(m => m.Property)
                    .ThenInclude(p => p.Contact)
                .Include(m => m.Contact)
                .Include(m => m.Company)
                .FirstOrDefaultAsync(e => e.Id == id);

            return Result.Success<Maintenance>(maintenance);
        }

        protected override IQueryable<Maintenance> SetPagedResultFilterOptions<IFilter>(IQueryable<Maintenance> query, IFilter filterOption)
        {
            // IMPORTANT: Always include Property, Contact, and Company for maintenance lists
            // Also include Property.DefaultAttachment for property images and Property.Contact for owner information
            query = query
                .Include(m => m.Property)
                    .ThenInclude(p => p.DefaultAttachment)
                .Include(m => m.Property)
                    .ThenInclude(p => p.Contact)
                .Include(m => m.Contact)
                .Include(m => m.Company);
            
            if (filterOption is GetMaintenancesFilter filter)
            {
                // Filter by property
                if (filter.PropertyId.HasValue)
                {
                    query = query.Where(m => m.PropertyId == filter.PropertyId.Value);
                }

                // Filter by contact
                if (filter.ContactId.HasValue)
                {
                    query = query.Where(m => m.ContactId == filter.ContactId.Value);
                }

                // Filter by status
                if (filter.Status.HasValue)
                {
                    query = query.Where(m => m.Status == filter.Status.Value);
                }

                // Filter by priority
                if (filter.Priority.HasValue)
                {
                    query = query.Where(m => m.Priority == filter.Priority.Value);
                }

                // Filter by date range
                if (filter.StartDate.HasValue)
                {
                    query = query.Where(m => m.ScheduledDateTime >= filter.StartDate.Value);
                }
                if (filter.EndDate.HasValue)
                {
                    query = query.Where(m => m.ScheduledDateTime <= filter.EndDate.Value);
                }
            }

            return base.SetPagedResultFilterOptions(query, filterOption);
        }
    }
}

