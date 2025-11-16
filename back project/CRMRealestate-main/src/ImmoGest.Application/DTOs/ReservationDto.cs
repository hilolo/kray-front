using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class ReservationDto
    {
        public Guid Id { get; set; }
        public Guid ContactId { get; set; }
        public string ContactName { get; set; }
        public string ContactEmail { get; set; }
        public string ContactPhone { get; set; }
        public string ContactAvatarUrl { get; set; }
        public Guid PropertyId { get; set; }
        public string PropertyIdentifier { get; set; }
        public string PropertyName { get; set; }
        public string PropertyAddress { get; set; }
        public string PropertyImageUrl { get; set; }
        
        // Reservation Information
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DurationDays { get; set; }
        public int NumberOfNights { get; set; }
        public decimal TotalAmount { get; set; }
        
        // Request Information
        public string Reason { get; set; }
        public string Description { get; set; }
        public DateTime RequestDate { get; set; }
        
        // Status
        public ReservationStatus Status { get; set; }
        
        // Approval Information
        public Guid? ApprovedBy { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public string ApprovalNotes { get; set; }
        
        // Additional Information
        public string PrivateNote { get; set; }
        
        // Documents
        public List<AttachmentDto> Attachments { get; set; }
        public int AttachmentCount { get; set; }
        
        // System fields
        public Guid CompanyId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

