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
    public class BankController : Base
    {
        private readonly IBankService _bankService;

        public BankController(IBankService bankService)
        {
            _bankService = bankService;
        }

        /// <summary>
        /// Creates a new bank account
        /// </summary>
        /// <param name="dto">Bank creation data</param>
        /// <returns>Created bank account</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(BankDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<BankDto>>> CreateBank([FromBody] CreateBankDto dto)
            => ActionResultFor(await _bankService.CreateAsync<BankDto, CreateBankDto>(dto));

        /// <summary>
        /// Get a bank account by ID
        /// </summary>
        /// <param name="id">The bank's ID</param>
        /// <returns>Bank account details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(BankDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<BankDto>>> GetBankById(Guid id)
            => ActionResultFor(await _bankService.GetByIdAsync<BankDto>(id));

        /// <summary>
        /// Update an existing bank account
        /// </summary>
        /// <param name="id">The bank's ID</param>
        /// <param name="dto">Bank update data</param>
        /// <returns>Updated bank account</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(BankDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<BankDto>>> UpdateBank(Guid id, [FromBody] UpdateBankDto dto)
            => ActionResultFor(await _bankService.UpdateAsync<BankDto, UpdateBankDto>(id, dto));

        /// <summary>
        /// Delete a bank account (soft delete)
        /// </summary>
        /// <param name="id">The bank's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteBank(Guid id)
            => ActionResultFor(await _bankService.DeleteAsync(id));

        /// <summary>
        /// Get all bank accounts with pagination and filtering
        /// To get all banks without pagination, set Ignore = true in the filter
        /// Use SearchQuery for searching by contact name, bank name, or RIB
        /// Use CompanyId to filter banks by company
        /// Use ContactId to filter banks by contact
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of bank accounts</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<BankDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<BankDto>>>> GetBanks([FromBody] GetBanksFilter filter)
            => ActionResultFor(await _bankService.GetAsPagedResultAsync<BankDto, GetBanksFilter>(filter));
    }
}

