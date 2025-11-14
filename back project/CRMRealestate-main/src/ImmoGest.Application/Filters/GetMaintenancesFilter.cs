using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Entities;
using System;

namespace ImmoGest.Application.Filters
{
    public class GetMaintenancesFilter : FilterOption
    {
        public Guid? PropertyId { get; set; }
        public Guid? ContactId { get; set; }
        public MaintenanceStatus? Status { get; set; }
        public MaintenancePriority? Priority { get; set; }
        public DateTimeOffset? StartDate { get; set; }
        public DateTimeOffset? EndDate { get; set; }
    }
}

