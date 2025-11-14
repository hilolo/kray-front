using ImmoGest.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ResultNet;

namespace ImmoGest.Application.Interfaces
{
    public interface ILeaseService : IDataService<Lease>
    {
        // Add any custom methods specific to Lease if needed
        Task<Result> ArchiveLeaseAsync(Guid leaseId);
        Task<Result> ActivateLeaseAsync(Guid leaseId);
        Task<Result<List<LeaseDto>>> GetOverlappingLeasesAsync(Guid propertyId, DateTime tenancyStart, DateTime tenancyEnd, Guid? excludeLeaseId = null);
    }
}


