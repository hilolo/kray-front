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
    public class PropertyRepository : Repository<Property>, IPropertyRepository
    {
        public PropertyRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<Result<Property>> GetByIdAsync(Guid id)
        {
            // Default: don't include related entities (for edit mode)
            var property = await DbSet
                .AsNoTracking()
                .Include(p => p.DefaultAttachment) // Always include default attachment for image URL
                .FirstOrDefaultAsync(p => p.Id == id);

            return property != null
                ? Result.Success(property)
                : Result.Failure<Property>();
        }

        /// <summary>
        /// Get property by ID with optional related entities
        /// </summary>
        public async Task<Result<Property>> GetByIdWithRelatedAsync(Guid id, bool includeRelated)
        {
            if (includeRelated)
            {
                // Include all related entities (for detail mode)
                var property = await DbSet
                    .AsNoTracking()
                    .Include(p => p.DefaultAttachment)
                    .Include(p => p.Contact) // Include the owner/contact
                    .Include(p => p.Maintenances.Where(m => !m.IsDeleted))
                        .ThenInclude(m => m.Contact)
                    .Include(p => p.Leases.Where(l => !l.IsDeleted))
                        .ThenInclude(l => l.Contact)
                    .Include(p => p.Leases.Where(l => !l.IsDeleted))
                        .ThenInclude(l => l.Attachments)
                    .Include(p => p.Keys.Where(k => !k.IsDeleted))
                    .FirstOrDefaultAsync(p => p.Id == id);

                return property != null
                    ? Result.Success(property)
                    : Result.Failure<Property>();
            }
            else
            {
                // Don't include related entities (for edit mode) - call base method
                return await base.GetByIdAsync(id);
            }
        }

        /// <summary>
        /// Updates only the DefaultAttachmentId for a property without triggering the full update flow
        /// This prevents concurrency issues when attachments have already been saved
        /// </summary>
        public async Task UpdateDefaultAttachmentIdAsync(Guid propertyId, Guid? defaultAttachmentId)
        {
            // Get a fresh instance of the property from the database
            var property = await DbSet.FindAsync(propertyId);
            if (property != null)
            {
                property.DefaultAttachmentId = defaultAttachmentId;
                DbSet.Update(property);
                await Db.SaveChangesAsync();
            }
        }
        
        /// <summary>
        /// Updates only the BuildingId for a property without triggering the full update flow
        /// This is used for attaching/detaching properties to/from buildings
        /// </summary>
        public async Task UpdateBuildingIdAsync(Guid propertyId, Guid? buildingId)
        {
            // Get a fresh instance of the property from the database
            var property = await DbSet.FindAsync(propertyId);
            if (property != null)
            {
                property.BuildingId = buildingId;
                DbSet.Update(property);
                await Db.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Updates the public visibility flags for a property
        /// </summary>
        public async Task UpdateVisibilityAsync(Guid propertyId, bool? isPublic, bool? isPublicAdresse)
        {
            var property = await DbSet.FindAsync(propertyId);
            if (property != null)
            {
                if (isPublic.HasValue)
                {
                    property.IsPublic = isPublic.Value;
                }

                if (isPublicAdresse.HasValue)
                {
                    property.IsPublicAdresse = isPublicAdresse.Value;
                }

                property.LastModifiedOn = DateTimeOffset.UtcNow;
                property.BuildSearchTerms();
                DbSet.Update(property);
                await Db.SaveChangesAsync();
            }
        }

        protected override IQueryable<Property> SetPagedResultFilterOptions<IFilter>(IQueryable<Property> query, IFilter filterOption)
        {
            if (filterOption is GetPropertiesFilter filter)
            {
                // Filter by identifier
                if (!string.IsNullOrEmpty(filter.Identifier))
                {
                    query = query.Where(p => p.Identifier.Contains(filter.Identifier));
                }

                // Filter by type property
                if (!string.IsNullOrEmpty(filter.TypeProperty))
                {
                    query = query.Where(p => p.TypeProperty == filter.TypeProperty);
                }

                // Filter by payment type
                if (filter.TypePaiment.HasValue)
                {
                    query = query.Where(p => p.TypePaiment == filter.TypePaiment.Value);
                }

                // Filter by price range
                if (filter.MinPrice.HasValue)
                {
                    query = query.Where(p => p.Price >= filter.MinPrice.Value);
                }
                if (filter.MaxPrice.HasValue)
                {
                    query = query.Where(p => p.Price <= filter.MaxPrice.Value);
                }

                // Filter by area range
                if (filter.MinArea.HasValue)
                {
                    query = query.Where(p => p.Area >= filter.MinArea.Value);
                }
                if (filter.MaxArea.HasValue)
                {
                    query = query.Where(p => p.Area <= filter.MaxArea.Value);
                }

                // Filter by building
                if (filter.BuildingId.HasValue)
                {
                    query = query.Where(p => p.BuildingId == filter.BuildingId.Value);
                }
                
                // Filter for unattached properties (BuildingId == null)
                if (filter.UnattachedOnly == true)
                {
                    query = query.Where(p => p.BuildingId == null);
                }

                // Filter by contact/owner
                if (filter.ContactId.HasValue)
                {
                    query = query.Where(p => p.ContactId == filter.ContactId.Value);
                }

                // Filter by category
                if (filter.Category.HasValue)
                {
                    query = query.Where(p => p.Category == filter.Category.Value);
                }

                // Filter by city
                if (!string.IsNullOrEmpty(filter.City))
                {
                    query = query.Where(p => p.City.Contains(filter.City));
                }

                // Filter by address
                if (!string.IsNullOrEmpty(filter.Address))
                {
                    query = query.Where(p => p.Address.Contains(filter.Address));
                }
            }

            return base.SetPagedResultFilterOptions(query, filterOption);
        }

        public async Task<Property> GetPublicPropertyByIdAsync(Guid propertyId)
        {
            return await DbSet
                .AsNoTracking()
                .Include(property => property.Company)
                .FirstOrDefaultAsync(property => property.IsPublic && property.Id == propertyId);
        }
    }
} 