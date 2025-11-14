using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReservationController : Base
    {
        private readonly IReservationService _reservationService;

        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        /// <summary>
        /// Creates a new reservation request
        /// </summary>
        /// <param name="dto">Reservation creation data</param>
        /// <returns>Created reservation</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(ReservationDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<ReservationDto>>> CreateReservation([FromBody] CreateReservationDto dto)
            => ActionResultFor(await _reservationService.CreateAsync<ReservationDto, CreateReservationDto>(dto));

        /// <summary>
        /// Get a reservation by ID
        /// </summary>
        /// <param name="id">The reservation's ID</param>
        /// <returns>Reservation details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ReservationDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<ReservationDto>>> GetReservationById(Guid id)
            => ActionResultFor(await _reservationService.GetByIdAsync<ReservationDto>(id));

        /// <summary>
        /// Update an existing reservation
        /// </summary>
        /// <param name="id">The reservation's ID</param>
        /// <param name="dto">Reservation update data</param>
        /// <returns>Updated reservation</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(ReservationDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<ReservationDto>>> UpdateReservation(Guid id, [FromBody] UpdateReservationDto dto)
            => ActionResultFor(await _reservationService.UpdateAsync<ReservationDto, UpdateReservationDto>(id, dto));

        /// <summary>
        /// Delete a reservation (soft delete)
        /// </summary>
        /// <param name="id">The reservation's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteReservation(Guid id)
            => ActionResultFor(await _reservationService.DeleteAsync(id));

        /// <summary>
        /// Get all reservations with pagination and filtering
        /// To get all reservations without pagination, set Ignore = true in the filter
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of reservations</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<ReservationDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<ReservationDto>>>> GetReservations([FromBody] GetReservationsFilter filter)
            => ActionResultFor(await _reservationService.GetAsPagedResultAsync<ReservationDto, GetReservationsFilter>(filter));

        /// <summary>
        /// Toggle archive status of a reservation (archive if active, activate if archived)
        /// </summary>
        /// <param name="id">The reservation's ID</param>
        /// <param name="archive">True to archive, false to activate</param>
        /// <returns></returns>
        [HttpPost]
        [Route("{id}/archive")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> ToggleArchiveReservation(Guid id, [FromQuery] bool archive = true)
        {
            if (archive)
                return ActionResultFor(await _reservationService.ArchiveReservationAsync(id));
            else
                return ActionResultFor(await _reservationService.ActivateReservationAsync(id));
        }

        /// <summary>
        /// Update the status of a reservation
        /// </summary>
        /// <param name="id">The reservation's ID</param>
        /// <param name="status">The new status</param>
        /// <returns></returns>
        [HttpPost]
        [Route("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> UpdateReservationStatus(Guid id, [FromBody] ReservationStatus status)
            => ActionResultFor(await _reservationService.UpdateStatusAsync(id, status));

        /// <summary>
        /// Check for overlapping reservations for a property within a date range
        /// </summary>
        /// <param name="propertyId">The property ID</param>
        /// <param name="startDate">Start date of the reservation</param>
        /// <param name="endDate">End date of the reservation</param>
        /// <param name="excludeReservationId">Optional reservation ID to exclude (for updates)</param>
        /// <returns>List of overlapping reservations</returns>
        [HttpGet]
        [Route("overlapping")]
        [ProducesResponseType(typeof(List<ReservationDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<List<ReservationDto>>>> GetOverlappingReservations(
            [FromQuery] Guid propertyId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate,
            [FromQuery] Guid? excludeReservationId = null)
            => ActionResultFor(await _reservationService.GetOverlappingReservationsAsync(propertyId, startDate, endDate, excludeReservationId));
    }
}


