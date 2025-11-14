using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Repositories
{
    public interface ILeaseRepository : IRepository<Lease>
    {
        Task<List<Lease>> GetOverlappingLeasesAsync(Guid propertyId, DateTime tenancyStart, DateTime tenancyEnd, Guid? excludeLeaseId = null);
    } 
}