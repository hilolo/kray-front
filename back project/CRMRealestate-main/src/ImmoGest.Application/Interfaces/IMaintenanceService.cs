using ImmoGest.Domain.Entities;
using System;
using System.Threading.Tasks;
using ResultNet;

namespace ImmoGest.Application.Interfaces
{
    public interface IMaintenanceService : IDataService<Maintenance>
    {
        // Add any custom methods specific to Maintenance if needed
        Task<Result> UpdateStatusAsync(Guid maintenanceId, MaintenanceStatus status);
    }
}

