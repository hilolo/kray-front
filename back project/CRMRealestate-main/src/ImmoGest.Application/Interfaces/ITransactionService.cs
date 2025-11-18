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
    }
}

