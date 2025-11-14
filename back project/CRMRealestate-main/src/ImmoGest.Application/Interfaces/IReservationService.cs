using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ResultNet;
using ImmoGest.Application.DTOs;

namespace ImmoGest.Application.Interfaces
{
    public interface IReservationService : IDataService<Reservation>
    {
        Task<Result> ArchiveReservationAsync(Guid reservationId);
        Task<Result> ActivateReservationAsync(Guid reservationId);
        Task<Result> UpdateStatusAsync(Guid reservationId, ReservationStatus status);
        Task<Result<List<ReservationDto>>> GetOverlappingReservationsAsync(Guid propertyId, DateTime startDate, DateTime endDate, Guid? excludeReservationId = null);
    }
}


