using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;

namespace ImmoGest.Application.DTOs
{
    public class GetReservationsFilter : FilterOption
    {
        public Guid? ContactId { get; set; }
        public Guid? PropertyId { get; set; }
        public ReservationStatus? Status { get; set; }
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
    }
}

