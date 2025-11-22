using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using ResultNet;
using System;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Repositories
{
    public interface IDocumentRepository : IRepository<Document>
    {
        // Add any custom repository methods here if needed
    }
}

