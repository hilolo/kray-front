using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MaintenanceController : Base
    {
        private readonly IMaintenanceService _maintenanceService;

        public MaintenanceController(IMaintenanceService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }

        /// <summary>
        /// Creates a new maintenance request
        /// </summary>
        /// <param name="dto">Maintenance creation data</param>
        /// <returns>Created maintenance</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(MaintenanceDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<MaintenanceDto>>> CreateMaintenance([FromBody] CreateMaintenanceDto dto)
            => ActionResultFor(await _maintenanceService.CreateAsync<MaintenanceDto, CreateMaintenanceDto>(dto));

        /// <summary>
        /// Get a maintenance request by ID
        /// </summary>
        /// <param name="id">The maintenance's ID</param>
        /// <returns>Maintenance details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(MaintenanceDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<MaintenanceDto>>> GetMaintenanceById(Guid id)
            => ActionResultFor(await _maintenanceService.GetByIdAsync<MaintenanceDto>(id));

        /// <summary>
        /// Update an existing maintenance request
        /// </summary>
        /// <param name="id">The maintenance's ID</param>
        /// <param name="dto">Maintenance update data</param>
        /// <returns>Updated maintenance</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(MaintenanceDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<MaintenanceDto>>> UpdateMaintenance(Guid id, [FromBody] UpdateMaintenanceDto dto)
            => ActionResultFor(await _maintenanceService.UpdateAsync<MaintenanceDto, UpdateMaintenanceDto>(id, dto));

        /// <summary>
        /// Delete a maintenance request (soft delete)
        /// </summary>
        /// <param name="id">The maintenance's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteMaintenance(Guid id)
            => ActionResultFor(await _maintenanceService.DeleteAsync(id));

        /// <summary>
        /// Get all maintenances with pagination and filtering
        /// To get all maintenances without pagination, set Ignore = true in the filter
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of maintenances</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<MaintenanceDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<MaintenanceDto>>>> GetMaintenances([FromBody] GetMaintenancesFilter filter)
            => ActionResultFor(await _maintenanceService.GetAsPagedResultAsync<MaintenanceDto, GetMaintenancesFilter>(filter));

        /// <summary>
        /// Update the status of a maintenance request
        /// </summary>
        /// <param name="id">The maintenance's ID</param>
        /// <param name="status">The new status</param>
        /// <returns></returns>
        [HttpPost]
        [Route("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> UpdateMaintenanceStatus(Guid id, [FromBody] MaintenanceStatus status)
            => ActionResultFor(await _maintenanceService.UpdateStatusAsync(id, status));
    }
}

