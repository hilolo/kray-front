using ImmoGest.Domain.Entities;
using System;

namespace ImmoGest.Application.DTOs
{
    public class MaintenanceDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public string PropertyIdentifier { get; set; }
        public string PropertyName { get; set; }
        public string PropertyAddress { get; set; }
        public string PropertyImageUrl { get; set; }
        public string OwnerName { get; set; }
        public string OwnerPhone { get; set; }
        public Guid CompanyId { get; set; }
        public string CompanyName { get; set; }
        public MaintenancePriority Priority { get; set; }
        public Guid ContactId { get; set; }
        public string ContactName { get; set; }
        public string ContactEmail { get; set; }
        public string ContactPhone { get; set; }
        public string ContactImageUrl { get; set; }
        public MaintenanceStatus Status { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public DateTimeOffset ScheduledDateTime { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }
}

