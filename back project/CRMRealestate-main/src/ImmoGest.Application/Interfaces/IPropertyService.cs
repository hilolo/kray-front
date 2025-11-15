using ImmoGest.Application.DTOs;
using ImmoGest.Domain.Entities;
using ResultNet;
using System;
using System.Threading.Tasks;

namespace ImmoGest.Application.Interfaces
{
    public interface IPropertyService : IDataService<Property>
    {
        /// <summary>
        /// Get a property by ID with optional related entities
        /// </summary>
        Task<Result<TOut>> GetByIdAsync<TOut>(Guid id, bool includeRelated);

        /// <summary>
        /// Update the building assignment for a property without affecting images or other data
        /// Set BuildingId to null to detach, or provide a Guid to attach
        /// </summary>
        Task<Result<PropertyDto>> UpdatePropertyBuildingAsync(UpdatePropertyBuildingDto dto);

        /// <summary>
        /// Update visibility flags for a property
        /// </summary>
        Task<Result<PropertyDto>> UpdatePropertyVisibilityAsync(UpdatePropertyVisibilityDto dto);

        /// <summary>
        /// Get a single public property by id
        /// </summary>
        Task<Result<PublicPropertyDto>> GetPublicPropertyByIdAsync(Guid propertyId);

        /// <summary>
        /// Update the archive status of a property
        /// </summary>
        Task<Result<PropertyDto>> UpdateArchiveStatusAsync(UpdatePropertyArchiveStatusDto dto);
    }
}
