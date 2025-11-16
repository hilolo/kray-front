using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;

namespace ImmoGest.Application.Filters
{
    public class GetTasksFilter : FilterOption
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public Guid? AssignedUserId { get; set; }
        public Guid? ContactId { get; set; }
        public Guid? PropertyId { get; set; }
        public TaskStatus? Status { get; set; }
        public TaskPriority? Priority { get; set; }
    }
}

