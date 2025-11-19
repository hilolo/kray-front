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
    public class ContactRepository : Repository<Contact>, IContactRepository
    {
        public ContactRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Result<Contact>> GetById(Guid id)
        {
            // Load with tracking for updates, include ALL Documents (including soft-deleted ones)
            // We need to ignore query filters here because we might be updating documents to set IsDeleted = true
            // If we don't ignore the filter, EF Core can't find those documents to update them
            var contact = await DbSet
                .IgnoreQueryFilters()
                .Include(c => c.Attachments)
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            return contact != null
                ? Result.Success<Contact>(contact)
                : Result.Failure<Contact>();
        }

        public override async Task<Result<Contact>> GetByIdAsync(Guid id)
        {
            // Load contact with non-deleted documents only (query filter automatically excludes soft-deleted documents)
            var contact = await DbSet
                .AsNoTracking()
                .Include(c => c.Attachments)
                .FirstOrDefaultAsync(e => e.Id == id);

            return Result.Success<Contact>(contact);
        }

        /// <summary>
        /// Get contact by ID with optional related entities
        /// </summary>
        public async Task<Result<Contact>> GetByIdWithRelatedAsync(Guid id, bool includeRelated)
        {
            if (includeRelated)
            {
                // Include all related entities (for detail mode)
                var contact = await DbSet
                    .AsNoTracking()
                    .Include(c => c.Attachments)
                    .Include(c => c.Transactions)
                        .ThenInclude(t => t.Property)
                    .Include(c => c.Transactions)
                        .ThenInclude(t => t.Lease)
                        .ThenInclude(l => l.Contact)
                    .Include(c => c.Transactions)
                        .ThenInclude(t => t.Reservation)
                        .ThenInclude(r => r.Property)
                    .Include(c => c.Transactions)
                        .ThenInclude(t => t.Reservation)
                        .ThenInclude(r => r.Contact)
                    .Include(c => c.Transactions)
                        .ThenInclude(t => t.Attachments)
                    .FirstOrDefaultAsync(e => e.Id == id);

                return contact != null
                    ? Result.Success<Contact>(contact)
                    : Result.Failure<Contact>();
            }
            else
            {
                // Don't include related entities (for edit mode) - call base method
                return await base.GetByIdAsync(id);
            }
        }

        public void DeleteContactAttachments(List<Attachment> attachments)
        {
            if (attachments == null || !attachments.Any())
            {
                return;
            }

            // Soft delete: mark attachments as deleted instead of removing them
            // Don't save changes here - let the main Update operation handle it
            foreach (var doc in attachments)
            {
                doc.IsDeleted = true;
            }
        }

        public override async Task<Result<Contact>> Update(Contact entity)
        {
            // Build search terms
            entity.BuildSearchTerms();
            
            // Detach ALL tracked entities (Contact and Attachments) to avoid conflicts
            // This is crucial because we might have loaded the entity for display earlier
            var trackedContact = Db.ChangeTracker.Entries<Contact>()
                .FirstOrDefault(e => e.Entity.Id == entity.Id);
            
            if (trackedContact != null && trackedContact.State != Microsoft.EntityFrameworkCore.EntityState.Detached)
            {
                Db.Entry(trackedContact.Entity).State = Microsoft.EntityFrameworkCore.EntityState.Detached;
            }
            
            // Detach all tracked Attachment entities that belong to this contact
            var trackedDocuments = Db.ChangeTracker.Entries<Attachment>()
                .Where(e => e.Entity.ContactId == entity.Id && e.State != Microsoft.EntityFrameworkCore.EntityState.Detached)
                .ToList();
            
            if (trackedDocuments.Any())
            {
                foreach (var trackedDoc in trackedDocuments)
                {
                    Db.Entry(trackedDoc.Entity).State = Microsoft.EntityFrameworkCore.EntityState.Detached;
                }
            }
            
            // Update LastModifiedOn to ensure the Contact entity is marked as modified
            entity.LastModifiedOn = DateTimeOffset.UtcNow;
            
            // Attach the Contact entity (this will also attach all documents through navigation property)
            Db.Attach(entity);
            
            // Set Contact state to Modified
            Db.Entry(entity).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            
            // Process documents: set correct state for each document
            if (entity.Attachments != null && entity.Attachments.Any())
            {
                // Build a list to check which documents exist in DB (single query for efficiency)
                var documentIds = entity.Attachments.Select(d => d.Id).ToList();
                var existingDocumentIds = await Db.Set<Attachment>()
                    .IgnoreQueryFilters()
                    .Where(d => documentIds.Contains(d.Id))
                    .Select(d => d.Id)
                    .ToListAsync();
                
                foreach (var doc in entity.Attachments)
                {
                    var docEntry = Db.Entry(doc);
                    var existsInDb = existingDocumentIds.Contains(doc.Id);
                    
                    if (existsInDb)
                    {
                        // Document exists - mark as Modified
                        docEntry.State = Microsoft.EntityFrameworkCore.EntityState.Modified;
                    }
                    else
                    {
                        // Document doesn't exist in DB, it's new - mark as Added
                        docEntry.State = Microsoft.EntityFrameworkCore.EntityState.Added;
                    }
                }
            }
            
            try
            {
                var changes = await Db.SaveChangesAsync();
                return Result.Success<Contact>(entity);
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        
        private string GetEntityId(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            try
            {
                var idProperty = entry.Entity.GetType().GetProperty("Id");
                return idProperty?.GetValue(entry.Entity)?.ToString() ?? "N/A";
            }
            catch
            {
                return "N/A";
            }
        }

        protected override IQueryable<Contact> SetPagedResultFilterOptions<IFilter>(IQueryable<Contact> query, IFilter filterOption)
        {
            if (filterOption is GetContactsFilter filter)
            {
                // Include Documents collection for counting (but query filter automatically excludes soft-deleted documents)
                query = query.Include(c => c.Attachments);
                
                // Filter by company
                if (filter.CompanyId.HasValue)
                {
                    query = query.Where(c => c.CompanyId == filter.CompanyId.Value);
                }

                // Filter by contact type
                if (filter.Type.HasValue)
                {
                    query = query.Where(c => c.Type == filter.Type.Value);
                }

                // Filter by IsACompany (Company or Individual)
                if (filter.IsACompany.HasValue)
                {
                    query = query.Where(c => c.IsACompany == filter.IsACompany.Value);
                }

                // Filter by IsArchived - default to false if not specified
                if (filter.IsArchived.HasValue)
                {
                    query = query.Where(c => c.IsArchived == filter.IsArchived.Value);
                }
                else
                {
                    // Default: only show non-archived contacts
                    query = query.Where(c => !c.IsArchived);
                }
                
                // Note: Deleted contacts are automatically filtered by global query filter
            }

            return base.SetPagedResultFilterOptions(query, filterOption);
        }
    }
} 