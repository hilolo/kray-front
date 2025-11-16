using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/public/properties")]
    [AllowAnonymous]
    public class PublicPropertyController : Base
    {
        private readonly IPropertyService _propertyService;
        private readonly IReservationService _reservationService;

        public PublicPropertyController(IPropertyService propertyService, IReservationService reservationService)
        {
            _propertyService = propertyService;
            _reservationService = reservationService;
        }

        /// <summary>
        /// Retrieve public property details by id
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(PublicPropertyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<PublicPropertyDto>>> GetPublicPropertyById(Guid id)
            => ActionResultFor(await _propertyService.GetPublicPropertyByIdAsync(id));

        /// <summary>
        /// Get public reservations for a property (only dates and status, no client information)
        /// This endpoint returns sanitized reservation data without client names for privacy
        /// </summary>
        [HttpGet("{propertyId:guid}/reservations")]
        [ProducesResponseType(typeof(List<PublicReservationDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<List<PublicReservationDto>>>> GetPublicReservations(Guid propertyId)
            => ActionResultFor(await _reservationService.GetPublicReservationsByPropertyIdAsync(propertyId));
    }
}

