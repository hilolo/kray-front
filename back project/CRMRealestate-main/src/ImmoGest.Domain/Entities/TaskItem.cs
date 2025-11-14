using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using System;

namespace ImmoGest.Domain.Entities
{
    public class TaskItem : Entity, IDeletable
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public DateTime ScheduledDateTime { get; set; }

        // Relationships
        public Guid AssignedUserId { get; set; }
        public User AssignedUser { get; set; }

        public Guid? ContactId { get; set; }
        public Contact Contact { get; set; }

        public Guid? PropertyId { get; set; }
        public Property Property { get; set; }

        public Guid CompanyId { get; set; }
        public Company Company { get; set; }

        public bool IsDeleted { get; set; }

        public override void BuildSearchTerms()
        {
            var assignedUserName = AssignedUser != null ? AssignedUser.Name : string.Empty;
            var contactName = Contact != null 
                ? (Contact.IsACompany ? Contact.CompanyName : $"{Contact.FirstName} {Contact.LastName}")
                : string.Empty;
            var propertyName = Property != null ? Property.Name ?? Property.Identifier : string.Empty;

            SearchTerms = $"{Title} {Description} {assignedUserName} {contactName} {propertyName}".ToUpper();
        }
    }
}

