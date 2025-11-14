using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using System;

namespace ImmoGest.Domain.Entities
{
    public class Attachment : Entity, IDeletable
    {
        public string FileName { get; set; }
        public string OriginalFileName { get; set; }
        public string FileExtension { get; set; }
        public long FileSize { get; set; }  // Size in bytes
        public string Root { get; set; }  // Generic root identifier for categorization (used for folder organization and search)
        public string StorageHash { get; set; }  // Immutable hash used for S3 storage keys (never changes)
        public Guid? ContactId { get; set; }  // Optional - can be attached to contact or other entities
        public Contact Contact { get; set; }
        public Guid? PropertyId { get; set; }  // Optional - can be attached to property
        public Property Property { get; set; }
        public Guid? LeaseId { get; set; }  // Optional - can be attached to lease
        public Lease Lease { get; set; }
        public Guid? ReservationId { get; set; }  // Optional - can be attached to reservation
        public Reservation Reservation { get; set; }
        public Guid CompanyId { get; set; }  // Company ID for multi-tenancy
        public bool IsDeleted { get; set; }
        public string Url { get; set; }  // Cached S3 URL for the attachment
        public DateTimeOffset? UrlExpiresAt { get; set; }  // URL expiration timestamp

        public override void BuildSearchTerms()
        {
            SearchTerms = $"{FileName} {OriginalFileName} {Root}".ToUpper();
        }
    }
}

