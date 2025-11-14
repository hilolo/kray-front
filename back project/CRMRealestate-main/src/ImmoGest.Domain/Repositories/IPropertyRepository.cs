using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using ResultNet;
using System;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Repositories
{
    public interface IPropertyRepository : IRepository<Property>
    {
        /// <summary>
        /// Updates only the DefaultAttachmentId for a property without triggering the full update flow
        /// </summary>
        System.Threading.Tasks.Task UpdateDefaultAttachmentIdAsync(Guid propertyId, Guid? defaultAttachmentId);
        
        /// <summary>
        /// Updates only the BuildingId for a property without triggering the full update flow
        /// </summary>
        System.Threading.Tasks.Task UpdateBuildingIdAsync(Guid propertyId, Guid? buildingId);

        /// <summary>
        /// Updates public visibility flags for a property
        /// </summary>
        System.Threading.Tasks.Task UpdateVisibilityAsync(Guid propertyId, bool? isPublic, bool? isPublicAdresse);

        /// <summary>
        /// Get a public property by id (only if marked as public)
        /// </summary>
        Task<Property> GetPublicPropertyByIdAsync(Guid propertyId);

        /// <summary>
        /// Get property by ID with optional related entities
        /// </summary>
        Task<Result<Property>> GetByIdWithRelatedAsync(Guid id, bool includeRelated);
    }
} 