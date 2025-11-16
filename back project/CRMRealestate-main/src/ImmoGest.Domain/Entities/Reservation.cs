using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Domain.Entities
{
    public class Reservation : Entity, IDeletable
    {
        // Reservation Information
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DurationDays { get; set; }
        public int NumberOfNights { get; set; }
        
        // Financial Information
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
        
        public override void BuildSearchTerms()
        {
            var contactSearch = Contact != null 
                ? $"{Contact.FirstName} {Contact.LastName} {Contact.CompanyName} {Contact.Identifier}"
                : "";
            
            var propertySearch = Property != null 
                ? $"{Property.Identifier} {Property.Address} {Property.Name}"
                : "";
            
            SearchTerms = $"{Reason} {Description} {PrivateNote} {ApprovalNotes} {contactSearch} {propertySearch}".ToLower();
        }
    }
}

