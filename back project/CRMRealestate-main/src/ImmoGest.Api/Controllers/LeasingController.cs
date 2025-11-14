using System;
using System.Collections.Generic;
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
    public class LeasingController : Base
    {
        private readonly ILeaseService _leaseService;

        public LeasingController(ILeaseService leaseService)
        {
            _leaseService = leaseService;
        }

        /// <summary>
        /// Creates a new leasing contract
        /// </summary>
        /// <param name="dto">Leasing creation data</param>
        /// <returns>Created leasing</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(LeaseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<LeaseDto>>> CreateLeasing([FromBody] CreateLeaseDto dto)
            => ActionResultFor(await _leaseService.CreateAsync<LeaseDto, CreateLeaseDto>(dto));

        /// <summary>
        /// Get a leasing contract by ID
        /// </summary>
        /// <param name="id">The leasing's ID</param>
        /// <returns>Leasing details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(LeaseDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<LeaseDto>>> GetLeasingById(Guid id)
            => ActionResultFor(await _leaseService.GetByIdAsync<LeaseDto>(id));

        /// <summary>
        /// Update an existing leasing contract
        /// </summary>
        /// <param name="id">The leasing's ID</param>
        /// <param name="dto">Leasing update data</param>
        /// <returns>Updated leasing</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(LeaseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<LeaseDto>>> UpdateLeasing(Guid id, [FromBody] UpdateLeaseDto dto)
            => ActionResultFor(await _leaseService.UpdateAsync<LeaseDto, UpdateLeaseDto>(id, dto));

        /// <summary>
        /// Delete a leasing contract (soft delete)
        /// </summary>
        /// <param name="id">The leasing's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteLeasing(Guid id)
            => ActionResultFor(await _leaseService.DeleteAsync(id));

        /// <summary>
        /// Get all leasings with pagination and filtering
        /// To get all leasings without pagination, set Ignore = true in the filter
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of leasings</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<LeaseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<LeaseDto>>>> GetLeasings([FromBody] GetLeasesFilter filter)
            => ActionResultFor(await _leaseService.GetAsPagedResultAsync<LeaseDto, GetLeasesFilter>(filter));

        /// <summary>
        /// Toggle archive status of a leasing contract (archive if active, activate if archived)
        /// </summary>
        /// <param name="id">The leasing's ID</param>
        /// <param name="archive">True to archive, false to activate</param>
        /// <returns></returns>
        [HttpPost]
        [Route("{id}/archive")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> ToggleArchiveLeasing(Guid id, [FromQuery] bool archive = true)
        {
            if (archive)
                return ActionResultFor(await _leaseService.ArchiveLeaseAsync(id));
            else
                return ActionResultFor(await _leaseService.ActivateLeaseAsync(id));
        }

        /// <summary>
        /// Check for overlapping leases for a property within a date range
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="tenancyStart">Start date of the lease</param>
        /// <param name="tenancyEnd">End date of the lease</param>
        /// <param name="excludeLeaseId">Optional lease ID to exclude (for updates)</param>
        /// <returns>List of overlapping leases</returns>
        [HttpGet]
        [Route("overlapping")]
        [ProducesResponseType(typeof(List<LeaseDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<List<LeaseDto>>>> GetOverlappingLeases(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime tenancyStart,
            [FromQuery] DateTime tenancyEnd,
            [FromQuery] Guid? excludeLeaseId = null)
            => ActionResultFor(await _leaseService.GetOverlappingLeasesAsync(propertyId, tenancyStart, tenancyEnd, excludeLeaseId));
    }
}


