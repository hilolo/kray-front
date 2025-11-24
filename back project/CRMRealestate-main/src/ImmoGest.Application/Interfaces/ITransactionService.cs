using ImmoGest.Application.DTOs;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using ResultNet;
using System;
using System.Threading.Tasks;

namespace ImmoGest.Application.Interfaces
{
    public interface ITransactionService : IDataService<Transaction>
    {
        // Base CRUD operations are provided by IDataService
        // Additional methods can be added here if needed
        
        /// <summary>
        /// Update transaction status
        /// </summary>
        /// <param name="id">Transaction ID</param>
        /// <param name="status">New status</param>
        /// <returns>Updated transaction</returns>
        Task<Result<TransactionDto>> UpdateStatusAsync(Guid id, TransactionStatus status);

        /// <summary>
        /// Generate leasing receipt PDF for a transaction with RevenueType = Loyer
        /// Uses document template with Type = Lease (2), IsLocked = true, CompanyId = null
        /// </summary>
        /// <param name="transactionId">Transaction ID</param>
        /// <returns>Processed PDFMake JSON object with placeholders replaced with transaction data</returns>
        Task<Result<object>> GenerateLeasingReceiptAsync(Guid transactionId);

        /// <summary>
        /// Generate deposit receipt PDF for a transaction with RevenueType = Caution
        /// Uses document template with Type = Deposit (6), IsLocked = true, CompanyId = null
        /// </summary>
        /// <param name="transactionId">Transaction ID</param>
        /// <returns>Processed PDFMake JSON object with placeholders replaced with transaction data</returns>
        Task<Result<object>> GenerateDepositReceiptAsync(Guid transactionId);
    }
}

