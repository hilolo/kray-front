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
    public class TransactionController : Base
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        /// <summary>
        /// Creates a new transaction
        /// </summary>
        /// <param name="dto">Transaction creation data</param>
        /// <returns>Created transaction</returns>
        [HttpPost]
        [Route("create")]
        [ProducesResponseType(typeof(TransactionDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<TransactionDto>>> CreateTransaction([FromBody] CreateTransactionDto dto)
            => ActionResultFor(await _transactionService.CreateAsync<TransactionDto, CreateTransactionDto>(dto));

        /// <summary>
        /// Get a transaction by ID
        /// </summary>
        /// <param name="id">The transaction's ID</param>
        /// <returns>Transaction details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(TransactionDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<TransactionDto>>> GetTransactionById(Guid id)
            => ActionResultFor(await _transactionService.GetByIdAsync<TransactionDto>(id));

        /// <summary>
        /// Update an existing transaction
        /// </summary>
        /// <param name="id">The transaction's ID</param>
        /// <param name="dto">Transaction update data</param>
        /// <returns>Updated transaction</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(TransactionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<TransactionDto>>> UpdateTransaction(Guid id, [FromBody] UpdateTransactionDto dto)
        {
            dto.Id = id;
            Console.WriteLine($"[Backend Controller] UpdateTransaction called - Id: {id}");
            Console.WriteLine($"[Backend Controller] DTO - Category: {dto.Category}, RevenueType: {dto.RevenueType}, ExpenseType: {dto.ExpenseType}, Date: {dto.Date}");
            return ActionResultFor(await _transactionService.UpdateAsync<TransactionDto, UpdateTransactionDto>(id, dto));
        }

        /// <summary>
        /// Delete a transaction (soft delete)
        /// </summary>
        /// <param name="id">The transaction's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteTransaction(Guid id)
            => ActionResultFor(await _transactionService.DeleteAsync(id));

        /// <summary>
        /// Get all transactions with pagination and filtering
        /// To get all transactions without pagination, set Ignore = true in the filter
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of transactions</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<TransactionListDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<TransactionListDto>>>> GetTransactions([FromBody] GetTransactionsFilter filter)
            => ActionResultFor(await _transactionService.GetAsPagedResultAsync<TransactionListDto, GetTransactionsFilter>(filter));

        /// <summary>
        /// Update transaction status
        /// </summary>
        /// <param name="id">The transaction's ID</param>
        /// <param name="request">Status update request</param>
        /// <returns>Updated transaction</returns>
        [HttpPut]
        [Route("{id}/status")]
        [ProducesResponseType(typeof(TransactionDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<TransactionDto>>> UpdateStatus(Guid id, [FromBody] UpdateTransactionStatusDto request)
            => ActionResultFor(await _transactionService.UpdateStatusAsync(id, request.Status));

        /// <summary>
        /// Generate leasing receipt PDF for a transaction with RevenueType = Loyer
        /// Uses document template with Type = Lease (2), IsLocked = true, CompanyId = null
        /// </summary>
        /// <param name="id">The transaction's ID</param>
        /// <returns>Processed PDFMake JSON object with placeholders replaced with transaction data</returns>
        [HttpPost]
        [Route("{id}/leasingreceipt")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<object>>> GenerateLeasingReceipt(Guid id)
            => ActionResultFor(await _transactionService.GenerateLeasingReceiptAsync(id));
    }
}

