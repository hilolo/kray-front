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
    public class ContactController : Base
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService)
        {
            _contactService = contactService;
        }

        /// <summary>
        /// Creates a new contact
        /// </summary>
        /// <param name="dto">Contact creation data</param>
        /// <returns>Created contact</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(ContactDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<ContactDto>>> CreateContact([FromBody] CreateContactDto dto)
            => ActionResultFor(await _contactService.CreateAsync<ContactDto, CreateContactDto>(dto));

        /// <summary>
        /// Get a contact by ID
        /// </summary>
        /// <param name="id">The contact's ID</param>
        /// <param name="includeRelated">If true, includes related entities (Properties, Leases, Banks). Default is false for edit mode, true for detail mode.</param>
        /// <returns>Contact details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ContactDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<ContactDto>>> GetContactById(Guid id, [FromQuery] bool includeRelated = false)
            => ActionResultFor(await _contactService.GetByIdAsync<ContactDto>(id, includeRelated));

        /// <summary>
        /// Update an existing contact
        /// </summary>
        /// <param name="id">The contact's ID</param>
        /// <param name="dto">Contact update data</param>
        /// <returns>Updated contact</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(ContactDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<ContactDto>>> UpdateContact(Guid id, [FromBody] UpdateContactDto dto)
            => ActionResultFor(await _contactService.UpdateAsync<ContactDto, UpdateContactDto>(id, dto));

        /// <summary>
        /// Delete a contact (soft delete)
        /// </summary>
        /// <param name="id">The contact's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteContact(Guid id)
            => ActionResultFor(await _contactService.DeleteAsync(id));

        /// <summary>
        /// Get all contacts with pagination and filtering
        /// To get all contacts without pagination, set Ignore = true in the filter
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of contacts</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<ContactDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<ContactDto>>>> GetContacts([FromBody] GetContactsFilter filter)
            => ActionResultFor(await _contactService.GetAsPagedResultAsync<ContactDto, GetContactsFilter>(filter));
    }
}

