using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BuildingController : Base
    {
        private readonly IBuildingService _buildingService;

        public BuildingController(IBuildingService buildingService)
        {
            _buildingService = buildingService;
        }

        /// <summary>
        /// Creates a new building
        /// </summary>
        /// <param name="dto">Building creation data</param>
        /// <returns>Created building</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(BuildingDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<BuildingDto>>> CreateBuilding([FromBody] CreateBuildingDto dto)
            => ActionResultFor(await _buildingService.CreateAsync<BuildingDto, CreateBuildingDto>(dto));

        /// <summary>
        /// Get a building by ID
        /// </summary>
        /// <param name="id">The building's ID</param>
        /// <returns>Building details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(BuildingDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<BuildingDto>>> GetBuildingById(Guid id)
            => ActionResultFor(await _buildingService.GetByIdAsync<BuildingDto>(id));

        /// <summary>
        /// Update an existing building
        /// </summary>
        /// <param name="id">The building's ID</param>
        /// <param name="dto">Building update data</param>
        /// <returns>Updated building</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(BuildingDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<BuildingDto>>> UpdateBuilding(Guid id, [FromBody] UpdateBuildingDto dto)
            => ActionResultFor(await _buildingService.UpdateAsync<BuildingDto, UpdateBuildingDto>(id, dto));

        /// <summary>
        /// Delete a building
        /// </summary>
        /// <param name="id">The building's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteBuilding(Guid id)
            => ActionResultFor(await _buildingService.DeleteAsync(id));

        /// <summary>
        /// Get all buildings with pagination and filtering
        /// To get all buildings without pagination, set Ignore = true in the filter
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of buildings</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<BuildingDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<BuildingDto>>>> GetBuildings([FromBody] GetBuildingesFilter filter)
            => ActionResultFor(await _buildingService.GetAsPagedResultAsync<BuildingDto, GetBuildingesFilter>(filter));

        /// <summary>
        /// Update the archive status of a building
        /// </summary>
        /// <param name="dto">Archive status update data</param>
        /// <returns>Updated building</returns>
        [HttpPatch]
        [Route("archive-status")]
        [ProducesResponseType(typeof(BuildingDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<BuildingDto>>> UpdateArchiveStatus([FromBody] UpdateBuildingArchiveStatusDto dto)
            => ActionResultFor(await _buildingService.UpdateArchiveStatusAsync(dto));
    }
}

