using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Repositories
{
    public interface IReservationRepository : IRepository<Reservation>
    {
        Task<List<Reservation>> GetOverlappingReservationsAsync(Guid propertyId, DateTime startDate, DateTime endDate, Guid? excludeReservationId = null);
    }
}


