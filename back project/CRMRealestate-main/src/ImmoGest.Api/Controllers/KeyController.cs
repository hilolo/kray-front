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
    public class KeyController : Base
    {
        private readonly IKeyService _keyService;

        public KeyController(IKeyService keyService)
        {
            _keyService = keyService;
        }

        /// <summary>
        /// Creates a new key
        /// </summary>
        /// <param name="dto">Key creation data</param>
        /// <returns>Created key</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(KeyDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<KeyDto>>> CreateKey([FromBody] CreateKeyDto dto)
            => ActionResultFor(await _keyService.CreateAsync<KeyDto, CreateKeyDto>(dto));

        /// <summary>
        /// Get a key by ID
        /// </summary>
        /// <param name="id">The key's ID</param>
        /// <returns>Key details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(KeyDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<KeyDto>>> GetKeyById(Guid id)
            => ActionResultFor(await _keyService.GetByIdAsync<KeyDto>(id));

        /// <summary>
        /// Update an existing key
        /// </summary>
        /// <param name="id">The key's ID</param>
        /// <param name="dto">Key update data</param>
        /// <returns>Updated key</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(KeyDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<KeyDto>>> UpdateKey(Guid id, [FromBody] UpdateKeyDto dto)
            => ActionResultFor(await _keyService.UpdateAsync<KeyDto, UpdateKeyDto>(id, dto));

        /// <summary>
        /// Delete a key (soft delete)
        /// </summary>
        /// <param name="id">The key's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteKey(Guid id)
            => ActionResultFor(await _keyService.DeleteAsync(id));

        /// <summary>
        /// Get all keys with pagination and filtering
        /// To get all keys without pagination, set Ignore = true in the filter
        /// Use SearchQuery for searching by name and description
        /// Use PropertyId to filter keys by property
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of keys</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<KeyDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<KeyDto>>>> GetKeys([FromBody] GetKeysFilter filter)
            => ActionResultFor(await _keyService.GetAsPagedResultAsync<KeyDto, GetKeysFilter>(filter));
    }
}

