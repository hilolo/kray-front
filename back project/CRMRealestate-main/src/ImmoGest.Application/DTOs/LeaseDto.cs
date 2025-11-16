using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class LeaseDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public string PropertyName { get; set; }
        public string PropertyAddress { get; set; }
        public string PropertyImageUrl { get; set; }
        public Guid ContactId { get; set; }
        public string TenantName {  get; set; }
        public string TenantEmail { get; set; }
        public string TenantPhone { get; set; }
        public string TenantAvatarUrl { get; set; }
        public string TenantIdentifier { get; set; }

        // Tenancy Information
        public DateTime TenancyStart { get; set; }
        public DateTime TenancyEnd { get; set; }
        public int? TenancyDuration { get; set; } // Calculated in months

        // Payment Information
        public TypePaimentLease PaymentType { get; set; }
        public PaymentMethod PaymentMethod { get; set; }
        public int PaymentDate { get; set; } // Day of month (1-31)
        public double RentPrice { get; set; }

        // Receipt Information
        public bool EnableReceipts { get; set; }
        public bool NotificationWhatsapp { get; set; }
        public bool NotificationEmail { get; set; }

        // Additional Information
        public string SpecialTerms { get; set; }
        public string PrivateNote { get; set; }

        // Documents
        public List<AttachmentDto> Attachments { get; set; }
        public int AttachmentCount { get; set; }

        // Status
        public LeasingStatus Status { get; set; }
        public bool IsArchived { get; set; }

        // System fields
        public Guid CompanyId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

