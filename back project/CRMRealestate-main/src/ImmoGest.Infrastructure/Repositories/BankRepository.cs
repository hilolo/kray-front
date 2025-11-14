using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Application.Filters;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace ImmoGest.Infrastructure.Repositories
{
    public class BankRepository : Repository<Bank>, IBankRepository
    {
        public BankRepository(ApplicationDbContext context) : base(context)
        {
        }

        protected override IQueryable<Bank> SetPagedResultFilterOptions<IFilter>(IQueryable<Bank> query, IFilter filterOption)
        {
            if (filterOption is GetBanksFilter filter)
            {
                // Filter by company
                if (filter.CompanyId.HasValue)
                {
                    query = query.Where(b => b.CompanyId == filter.CompanyId.Value);
                }

                // Filter by contact
                if (filter.ContactId.HasValue)
                {
                    query = query.Where(b => b.ContactId == filter.ContactId.Value);
                }
            }

            // Include related entities
            query = query.Include(b => b.Company)
                         .Include(b => b.Contact);

            return base.SetPagedResultFilterOptions(query, filterOption);
        }
    }
}

