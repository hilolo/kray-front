using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PropertyController : Base
    {
        private readonly IPropertyService _propertyService;

        public PropertyController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        /// <summary>
        /// Creates a new property
        /// </summary>
        /// <param name="dto">Property creation data</param>
        /// <returns>Created property</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(PropertyDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<PropertyDto>>> CreateProperty([FromBody] CreatePropertyDto dto)
            => ActionResultFor(await _propertyService.CreateAsync<PropertyDto, CreatePropertyDto>(dto));

        /// <summary>
        /// Get a property by ID
        /// </summary>
        /// <param name="id">The property's ID</param>
        /// <param name="includeRelated">If true, includes related entities (Leases, Maintenances, Keys, Contact). Default is false for edit mode, true for detail mode.</param>
        /// <returns>Property details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(PropertyDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PropertyDto>>> GetPropertyById(Guid id, [FromQuery] bool includeRelated = false)
            => ActionResultFor(await _propertyService.GetByIdAsync<PropertyDto>(id, includeRelated));

        /// <summary>
        /// Update an existing property
        /// </summary>
        /// <param name="id">The property's ID</param>
        /// <param name="dto">Property update data</param>
        /// <returns>Updated property</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(PropertyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<PropertyDto>>> UpdateProperty(Guid id, [FromBody] UpdatePropertyDto dto)
            => ActionResultFor(await _propertyService.UpdateAsync<PropertyDto, UpdatePropertyDto>(id, dto));

        /// <summary>
        /// Delete a property (soft delete)
        /// </summary>
        /// <param name="id">The property's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteProperty(Guid id)
            => ActionResultFor(await _propertyService.DeleteAsync(id));

        /// <summary>
        /// Get all properties with pagination and filtering
        /// To get all properties without pagination, set Ignore = true in the filter
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of properties</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<PropertyDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<PropertyDto>>>> GetProperties([FromBody] GetPropertiesFilter filter)
            => ActionResultFor(await _propertyService.GetAsPagedResultAsync<PropertyDto, GetPropertiesFilter>(filter));

        /// <summary>
        /// Update the building assignment for a property (lightweight operation - doesn't affect images)
        /// Set BuildingId to null to detach, or provide a Guid to attach
        /// </summary>
        /// <param name="dto">Update property building data</param>
        /// <returns>Updated property</returns>
        [HttpPatch]
        [Route("update-building")]
        [ProducesResponseType(typeof(PropertyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<PropertyDto>>> UpdatePropertyBuilding([FromBody] UpdatePropertyBuildingDto dto)
            => ActionResultFor(await _propertyService.UpdatePropertyBuildingAsync(dto));

        /// <summary>
        /// Update the public visibility flags for a property
        /// </summary>
        [HttpPatch]
        [Route("visibility")]
        [ProducesResponseType(typeof(PropertyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<PropertyDto>>> UpdatePropertyVisibility([FromBody] UpdatePropertyVisibilityDto dto)
            => ActionResultFor(await _propertyService.UpdatePropertyVisibilityAsync(dto));
    }
}
