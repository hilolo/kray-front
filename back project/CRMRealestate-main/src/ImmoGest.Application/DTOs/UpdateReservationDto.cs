using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class UpdateReservationDto
    {
        public Guid ContactId { get; set; }
        public Guid PropertyId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Reason { get; set; }
        public string Description { get; set; }
        public string PrivateNote { get; set; }
        public ReservationStatus Status { get; set; }
        public Guid? ApprovedBy { get; set; }
        public string ApprovalNotes { get; set; }
        public List<AttachmentInputDto> AttachmentsToAdd { get; set; }
        public List<Guid> AttachmentsToDelete { get; set; }
    }
}

