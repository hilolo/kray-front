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
    public class ReservationRepository : Repository<Reservation>, IReservationRepository
    {
        public ReservationRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Result<Reservation>> GetByIdAsync(Guid id)
        {
            // Load reservation with all related entities including attachments
            var reservation = await DbSet
                .AsNoTracking()
                .Include(v => v.Contact)
                .Include(v => v.Property)
                .Include(v => v.Attachments)
                .FirstOrDefaultAsync(e => e.Id == id);

            return Result.Success<Reservation>(reservation);
        }

        protected override IQueryable<Reservation> SetPagedResultFilterOptions<IFilter>(IQueryable<Reservation> query, IFilter filterOption)
        {
            // IMPORTANT: Always include Contact and Property (with DefaultAttachment) for reservation lists
            query = query
                .Include(v => v.Contact)
                .Include(v => v.Property)
                    .ThenInclude(p => p.DefaultAttachment)
                .Include(v => v.Attachments);
            
            // Check for GetReservationsFilter
            if (filterOption is GetReservationsFilter reservationsFilter)
            {
                // Filter by company
                if (reservationsFilter.CompanyId.HasValue)
                {
                    query = query.Where(v => v.CompanyId == reservationsFilter.CompanyId.Value);
                }

                // Filter by contact
                if (reservationsFilter.ContactId.HasValue)
                {
                    query = query.Where(v => v.ContactId == reservationsFilter.ContactId.Value);
                }

                // Filter by property
                if (reservationsFilter.PropertyId.HasValue)
                {
                    query = query.Where(v => v.PropertyId == reservationsFilter.PropertyId.Value);
                }

                // Filter by status
                if (reservationsFilter.Status.HasValue)
                {
                    query = query.Where(v => v.Status == reservationsFilter.Status.Value);
                }

                // Filter by archived status - default to false if not specified
                if (reservationsFilter.IsArchived.HasValue)
                {
                    query = query.Where(v => v.IsArchived == reservationsFilter.IsArchived.Value);
                }
                else
                {
                    // Default: only show non-archived reservations
                    query = query.Where(v => !v.IsArchived);
                }

                // Filter by date range - show reservations that overlap with the date range
                // A reservation overlaps if: startDate <= rangeEnd AND endDate >= rangeStart
                if (reservationsFilter.StartDateFrom.HasValue && reservationsFilter.StartDateTo.HasValue)
                {
                    // Reservation overlaps with the range if:
                    // - Reservation starts before or on the range end date AND
                    // - Reservation ends after or on the range start date
                    query = query.Where(v => 
                        v.StartDate <= reservationsFilter.StartDateTo.Value && 
                        v.EndDate >= reservationsFilter.StartDateFrom.Value);
                }
                else if (reservationsFilter.StartDateFrom.HasValue)
                {
                    // Only start date specified - show reservations that end on or after this date
                    query = query.Where(v => v.EndDate >= reservationsFilter.StartDateFrom.Value);
                }
                else if (reservationsFilter.StartDateTo.HasValue)
                {
                    // Only end date specified - show reservations that start on or before this date
                    query = query.Where(v => v.StartDate <= reservationsFilter.StartDateTo.Value);
                }
            }

            return base.SetPagedResultFilterOptions(query, filterOption);
        }

        public async Task<List<Reservation>> GetOverlappingReservationsAsync(Guid propertyId, DateTime startDate, DateTime endDate, Guid? excludeReservationId = null)
        {
            // Normalize input dates to midnight (00:00:00) for consistent comparison
            var normalizedStartDate = startDate.Date;
            var normalizedEndDate = endDate.Date;
            
            // Two reservations overlap if they share actual days (not just touching on boundaries)
            // Use exclusive end date logic: a reservation that ends exactly when another starts does NOT overlap
            // This allows same-day checkout/checkin: if reservation A ends on day X at time T, 
            // reservation B can start on day X at the same time T
            // Overlap logic: existing reservation overlaps with new reservation if:
            // 1. Existing starts before new ends (r.StartDate < endDate) - strictly less than
            // 2. Existing ends after new starts (r.EndDate > startDate) - strictly greater than
            // Example: Existing ends 2025-11-16T00:00:00, New starts 2025-11-16T00:00:00 → NO overlap ✓
            
            var query = DbSet
                .AsNoTracking()
                .Include(r => r.Contact)
                .Include(r => r.Property)
                .Where(r => r.PropertyId == propertyId
                    && !r.IsDeleted
                    && r.StartDate < normalizedEndDate
                    && r.EndDate > normalizedStartDate);

            // Exclude the current reservation if updating
            if (excludeReservationId.HasValue)
            {
                query = query.Where(r => r.Id != excludeReservationId.Value);
            }

            // Exclude cancelled reservations
            query = query.Where(r => r.Status != Domain.Entities.Enums.ReservationStatus.Cancelled);

            return await query.ToListAsync();
        }
    }
}

