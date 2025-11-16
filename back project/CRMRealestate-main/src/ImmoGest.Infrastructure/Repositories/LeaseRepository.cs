using ImmoGest.Application.DTOs;
using ImmoGest.Application.Filters;
using ImmoGest.Domain.Core.Interfaces;
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
    public class LeaseRepository : Repository<Lease>, ILeaseRepository
    {
        public LeaseRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Result<Lease>> GetByIdAsync(Guid id)
        {
            // Load lease with all related entities including attachments
            var lease = await DbSet
                .AsNoTracking()
                .Include(l => l.Contact)
                .Include(l => l.Property)
                .Include(l => l.Attachments)
                .FirstOrDefaultAsync(e => e.Id == id);

            return Result.Success<Lease>(lease);
        }

        protected override IQueryable<Lease> SetPagedResultFilterOptions<IFilter>(IQueryable<Lease> query, IFilter filterOption)
        {
            // IMPORTANT: Always include Contact and Property for lease lists
            query = query
                .Include(l => l.Contact)
                .Include(l => l.Property)
                .Include(l => l.Attachments);
            
            // Check for GetLeasesFilter (used by the API controller)
            if (filterOption is GetLeasesFilter leasesFilter)
            {
                // Filter by company
                if (leasesFilter.CompanyId.HasValue)
                {
                    query = query.Where(l => l.CompanyId == leasesFilter.CompanyId.Value);
                }

                // Filter by property
                if (leasesFilter.PropertyId.HasValue)
                {
                    query = query.Where(l => l.PropertyId == leasesFilter.PropertyId.Value);
                }

                // Filter by client/contact
                if (leasesFilter.ContactId.HasValue)
                {
                    query = query.Where(l => l.ContactId == leasesFilter.ContactId.Value);
                }

                // Filter by status
                if (leasesFilter.Status.HasValue)
                {
                    query = query.Where(l => l.Status == leasesFilter.Status.Value);
                }

                // Filter by archived status - default to false if not specified
                if (leasesFilter.IsArchived.HasValue)
                {
                    query = query.Where(l => l.IsArchived == leasesFilter.IsArchived.Value);
                }
                else
                {
                    // Default: only show non-archived leases
                    query = query.Where(l => !l.IsArchived);
                }
            }
            // Also check for GetRentalesFilter (legacy/alternative filter)
            else if (filterOption is GetRentalesFilter rentalesFilter)
            {
                // Filter by company
                if (rentalesFilter.CompanyId.HasValue)
                {
                    query = query.Where(l => l.CompanyId == rentalesFilter.CompanyId.Value);
                }

                // Filter by property
                if (rentalesFilter.PropertyId.HasValue)
                {
                    query = query.Where(l => l.PropertyId == rentalesFilter.PropertyId.Value);
                }

                // Filter by client/contact
                if (rentalesFilter.ClientId.HasValue)
                {
                    query = query.Where(l => l.ContactId == rentalesFilter.ClientId.Value);
                }
            }

            return base.SetPagedResultFilterOptions(query, filterOption);
        }

        public async Task<List<Lease>> GetOverlappingLeasesAsync(Guid propertyId, DateTime tenancyStart, DateTime tenancyEnd, Guid? excludeLeaseId = null)
        {
            var query = DbSet
                .AsNoTracking()
                .Include(l => l.Contact)
                .Include(l => l.Property)
                .Where(l => l.PropertyId == propertyId
                    && !l.IsDeleted
                    && !l.IsArchived  // Exclude archived leases
                    && l.TenancyStart <= tenancyEnd
                    && l.TenancyEnd >= tenancyStart);

            // Exclude the current lease if updating
            if (excludeLeaseId.HasValue)
            {
                query = query.Where(l => l.Id != excludeLeaseId.Value);
            }

            return await query.ToListAsync();
        }
    }
} 