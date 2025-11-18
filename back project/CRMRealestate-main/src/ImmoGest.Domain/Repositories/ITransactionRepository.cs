using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using ResultNet;
using System;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Repositories
{
    public interface ITransactionRepository : IRepository<Transaction>
    {
        // No additional methods needed for now
        // Base repository provides all CRUD operations
    }
}

