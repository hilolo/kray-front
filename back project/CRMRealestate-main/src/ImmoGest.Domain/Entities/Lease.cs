using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Domain.Entities
{
    public class Lease : Entity, IDeletable
    {
        // Tenancy Information
        public DateTime TenancyStart { get; set; }
        public DateTime TenancyEnd { get; set; }

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

        // Status (can be calculated based on dates)
        public LeasingStatus Status { get; set; }

        // Relationships
        public Contact Contact { get; set; }
        public Guid ContactId { get; set; }
        public Property Property { get; set; }
        public Guid PropertyId { get; set; }
        public Company Company { get; set; }
        public Guid CompanyId { get; set; }

        // Documents
        public ICollection<Attachment> Attachments { get; set; }

        public bool IsDeleted { get; set; }
        public bool IsArchived { get; set; }

        public override void BuildSearchTerms()
        {
            var propertySearch = Property != null 
                ? $"{Property.Identifier} {Property.Address} {(Property.Contact != null ? Property.Contact.FirstName + " " + Property.Contact.LastName + " " + Property.Contact.CompanyName : "")}"
                : "";
            
            var tenantSearch = Contact != null 
                ? $"{Contact.FirstName} {Contact.LastName} {Contact.CompanyName} {Contact.Identifier}"
                : "";
            
            SearchTerms = $"{SpecialTerms} {PrivateNote} {propertySearch} {tenantSearch}".ToLower();
        }
    }
}
