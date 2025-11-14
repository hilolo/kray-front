using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class CreateReservationDto
    {
        public Guid ContactId { get; set; }
        public Guid PropertyId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Reason { get; set; }
        public string Description { get; set; }
        public string PrivateNote { get; set; }
        public Guid? CompanyId { get; set; }
        public List<AttachmentInputDto> Attachments { get; set; }
    }
}

