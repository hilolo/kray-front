using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class UpdateLeaseDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public Guid ContactId { get; set; }
        public DateTime TenancyStart { get; set; }
        public DateTime TenancyEnd { get; set; }
        public TypePaimentLease PaymentType { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public int PaymentDate { get; set; }
        public double RentPrice { get; set; }
        public double DepositPrice { get; set; }
        public bool EnableReceipts { get; set; }
        public bool NotificationWhatsapp { get; set; }
        public bool NotificationEmail { get; set; }
        public string SpecialTerms { get; set; }
        public string PrivateNote { get; set; }
        public Guid? CompanyId { get; set; }
        public List<AttachmentInputDto> AttachmentsToAdd { get; set; }
        public List<Guid> AttachmentsToDelete { get; set; }
    }
}

