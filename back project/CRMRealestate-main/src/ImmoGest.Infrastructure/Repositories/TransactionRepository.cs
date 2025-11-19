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
using ImmoGest.Domain.Entities.Enums;
using System.Collections.Generic;

namespace ImmoGest.Infrastructure.Repositories
{
    public class TransactionRepository : Repository<Transaction>, ITransactionRepository
    {
        public TransactionRepository(ApplicationDbContext context) : base(context)
        {
        }

        /// <summary>
        /// Override GetById to return a tracked entity for updates
        /// </summary>
        public override async Task<Result<Transaction>> GetById(Guid id)
        {
            // Return tracked entity (without AsNoTracking) for updates
            // Include all related entities like in list queries
            var entity = await DbSet
                .Include(t => t.Property)
                .Include(t => t.Contact)
                .Include(t => t.Lease)
                    .ThenInclude(l => l.Contact)
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(e => e.Id == id);

            return entity != null
                ? Result.Success<Transaction>(entity)
                : Result.Failure<Transaction>();
        }

        /// <summary>
        /// Override GetByIdAsync to include attachments (for read operations)
        /// </summary>
        public override async Task<Result<Transaction>> GetByIdAsync(Guid id)
        {
            // Load transaction with all related entities including attachments (using AsNoTracking for read operations)
            var entity = await DbSet
                .AsNoTracking()
                .Include(t => t.Property)
                .Include(t => t.Contact)
                .Include(t => t.Lease)
                    .ThenInclude(l => l.Contact)
                .Include(t => t.Attachments)
                .FirstOrDefaultAsync(e => e.Id == id);

            return entity != null
                ? Result.Success<Transaction>(entity)
                : Result.Failure<Transaction>();
        }

        protected override IQueryable<Transaction> SetPagedResultFilterOptions<IFilter>(IQueryable<Transaction> query, IFilter filterOption)
        {
            // Always include related entities for transaction lists
            query = query
                .Include(t => t.Property)
                .Include(t => t.Contact)
                .Include(t => t.Lease)
                    .ThenInclude(l => l.Contact)
                .Include(t => t.Reservation)
                .Include(t => t.Attachments);

            if (filterOption is GetTransactionsFilter filter)
            {
                // Filter by company
                if (filter.CompanyId.HasValue)
                {
                    query = query.Where(t => t.CompanyId == filter.CompanyId.Value);
                }

                // Filter by category
                if (filter.Category.HasValue)
                {
                    query = query.Where(t => t.Category == filter.Category.Value);
                }

                // Filter by revenue types (if provided and category is Revenue)
                if (filter.RevenueTypes != null && filter.RevenueTypes.Count > 0)
                {
                    query = query.Where(t => t.Category == TransactionCategory.Revenue && 
                                             t.RevenueType.HasValue && 
                                             filter.RevenueTypes.Contains(t.RevenueType.Value));
                }

                // Filter by expense types (if provided and category is Expense)
                if (filter.ExpenseTypes != null && filter.ExpenseTypes.Count > 0)
                {
                    query = query.Where(t => t.Category == TransactionCategory.Expense && 
                                             t.ExpenseType.HasValue && 
                                             filter.ExpenseTypes.Contains(t.ExpenseType.Value));
                }

                // Filter by status
                if (filter.Status.HasValue)
                {
                    query = query.Where(t => t.Status == filter.Status.Value);
                }

                // Filter by transaction type
                if (filter.TransactionType.HasValue)
                {
                    query = query.Where(t => t.TransactionType == filter.TransactionType.Value);
                }

                // Filter by property
                if (filter.PropertyId.HasValue)
                {
                    query = query.Where(t => t.PropertyId == filter.PropertyId.Value);
                }

                // Filter by contact
                if (filter.ContactId.HasValue)
                {
                    query = query.Where(t => t.ContactId == filter.ContactId.Value);
                }

                // Filter by lease
                if (filter.LeaseId.HasValue)
                {
                    query = query.Where(t => t.LeaseId == filter.LeaseId.Value);
                }

                // Filter by date range
                if (filter.DateFrom.HasValue)
                {
                    query = query.Where(t => t.Date >= filter.DateFrom.Value);
                }

                if (filter.DateTo.HasValue)
                {
                    query = query.Where(t => t.Date <= filter.DateTo.Value);
                }

                // Filter by search term
                if (!string.IsNullOrEmpty(filter.SearchTerm))
                {
                    var searchTerm = filter.SearchTerm.ToUpper();
                    // Try to parse search term as decimal for amount search
                    decimal searchAmount = 0;
                    bool isNumericSearch = decimal.TryParse(filter.SearchTerm, out searchAmount);
                    
                    query = query.Where(t => 
                        t.SearchTerms.Contains(searchTerm) ||
                        t.Description.Contains(filter.SearchTerm) ||
                        (t.Property != null && (t.Property.Name.Contains(filter.SearchTerm) || t.Property.Identifier.Contains(filter.SearchTerm) || (t.Property.Address != null && t.Property.Address.Contains(filter.SearchTerm)))) ||
                        (t.Contact != null && (t.Contact.FirstName.Contains(filter.SearchTerm) || t.Contact.LastName.Contains(filter.SearchTerm) || t.Contact.CompanyName.Contains(filter.SearchTerm) || (t.Contact.Identifier != null && t.Contact.Identifier.Contains(filter.SearchTerm)))) ||
                        (t.OtherContactName != null && t.OtherContactName.Contains(filter.SearchTerm)) ||
                        (isNumericSearch && t.TotalAmount == searchAmount) ||
                        (isNumericSearch && t.TotalAmount.ToString().Contains(filter.SearchTerm))
                    );
                }
            }

            return base.SetPagedResultFilterOptions(query, filterOption);
        }
    }
}

