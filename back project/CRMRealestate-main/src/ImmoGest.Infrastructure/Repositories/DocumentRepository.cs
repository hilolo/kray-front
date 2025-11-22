using ImmoGest.Application.Filters;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using ResultNet;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ImmoGest.Infrastructure.Repositories
{
    public class DocumentRepository : Repository<Document>, IDocumentRepository
    {
        public DocumentRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Result<Document>> GetById(Guid id)
        {
            var document = await DbSet
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            return document != null
                ? Result.Success<Document>(document)
                : Result.Failure<Document>();
        }

        public override async Task<Result<Document>> GetByIdAsync(Guid id)
        {
            var document = await DbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(e => e.Id == id);

            return Result.Success<Document>(document);
        }

        public override async Task<Result<Document>> Update(Document entity)
        {
            // Build search terms
            entity.BuildSearchTerms();
            
            // Detach tracked entity to avoid conflicts
            var trackedDocument = Db.ChangeTracker.Entries<Document>()
                .FirstOrDefault(e => e.Entity.Id == entity.Id);
            
            if (trackedDocument != null && trackedDocument.State != Microsoft.EntityFrameworkCore.EntityState.Detached)
            {
                Db.Entry(trackedDocument.Entity).State = Microsoft.EntityFrameworkCore.EntityState.Detached;
            }
            
            // Update LastModifiedOn to ensure the Document entity is marked as modified
            entity.LastModifiedOn = DateTimeOffset.UtcNow;
            
            // Attach the Document entity
            Db.Attach(entity);
            
            // Set Document state to Modified
            Db.Entry(entity).State = Microsoft.EntityFrameworkCore.EntityState.Modified;
            
            try
            {
                var changes = await Db.SaveChangesAsync();
                return Result.Success<Document>(entity);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        protected override IQueryable<Document> SetPagedResultFilterOptions<IFilter>(IQueryable<Document> query, IFilter filterOption)
        {
            if (filterOption is GetDocumentsFilter filter)
            {
                // Filter by company
                if (filter.CompanyId.HasValue)
                {
                    query = query.Where(d => d.CompanyId == filter.CompanyId.Value);
                }

                // Filter by name (case-insensitive search)
                if (!string.IsNullOrEmpty(filter.Name))
                {
                    query = query.Where(d => d.Name.Contains(filter.Name));
                }

                // Filter by document type
                if (filter.Type.HasValue)
                {
                    query = query.Where(d => d.Type == filter.Type.Value);
                }

                // Filter by Generate
                if (filter.Generate.HasValue)
                {
                    query = query.Where(d => d.Generate == filter.Generate.Value);
                }

                // Filter by IsLogo
                if (filter.IsLogo.HasValue)
                {
                    query = query.Where(d => d.IsLogo == filter.IsLogo.Value);
                }

                // Filter by IsCachet
                if (filter.IsCachet.HasValue)
                {
                    query = query.Where(d => d.IsCachet == filter.IsCachet.Value);
                }

                // Filter by LeaseeId
                if (filter.LeaseeId.HasValue)
                {
                    query = query.Where(d => d.LeaseeId == filter.LeaseeId.Value);
                }

                // Filter by TransactionId
                if (filter.TransactionId.HasValue)
                {
                    query = query.Where(d => d.TransactionId == filter.TransactionId.Value);
                }

                // Note: Deleted documents are automatically filtered by global query filter
            }

            return base.SetPagedResultFilterOptions(query, filterOption);
        }
    }
}

