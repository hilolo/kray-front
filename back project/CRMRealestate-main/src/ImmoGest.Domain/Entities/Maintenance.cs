using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using System;

namespace ImmoGest.Domain.Entities
{
    public class Maintenance : Entity, IDeletable
    {
        public Guid PropertyId { get; set; }
        public Property Property { get; set; }

        public Guid CompanyId { get; set; }
        public Company Company { get; set; }

        public MaintenancePriority Priority { get; set; }

        public Guid ContactId { get; set; }
        public Contact Contact { get; set; }

        public MaintenanceStatus Status { get; set; }

        public string Subject { get; set; }

        public string Description { get; set; }

        public DateTimeOffset ScheduledDateTime { get; set; }

        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedOn { get; set; }

        public override void BuildSearchTerms()
        {
            var propertySearch = Property != null 
                ? $"{Property.Name} {Property.Address} {Property.Identifier}"
                : "";
            
            var contactSearch = Contact != null 
                ? $"{Contact.FirstName} {Contact.LastName} {Contact.CompanyName} {Contact.Email}"
                : "";
            
            SearchTerms = $"{Subject} {Description} {propertySearch} {contactSearch} {Status} {Priority}".ToLower();
        }
    }
}

