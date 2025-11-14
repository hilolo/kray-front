using ImmoGest.Domain.Entities;
using System;

namespace ImmoGest.Application.DTOs
{
    public class UpdateMaintenanceDto
    {
        public Guid Id { get; set; }
        public Guid PropertyId { get; set; }
        public Guid CompanyId { get; set; }
        public MaintenancePriority Priority { get; set; }
        public Guid ContactId { get; set; }
        public MaintenanceStatus Status { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public DateTimeOffset ScheduledDateTime { get; set; }
    }
}

