using ImmoGest.Domain.Entities.Enums;
using System;

namespace ImmoGest.Application.DTOs
{
    /// <summary>
    /// Public reservation DTO that only includes date and status information
    /// Does not include client/contact information for privacy
    /// </summary>
    public class PublicReservationDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        
        // Reservation Information (only dates and status)
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ReservationStatus Status { get; set; }
    }
}

