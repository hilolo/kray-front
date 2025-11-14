using System;
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

        public PublicPropertyController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        /// <summary>
        /// Retrieve public property details by id
        /// </summary>
        [HttpGet("{id:guid}")]
        [ProducesResponseType(typeof(PublicPropertyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<PublicPropertyDto>>> GetPublicPropertyById(Guid id)
            => ActionResultFor(await _propertyService.GetPublicPropertyByIdAsync(id));
    }
}

