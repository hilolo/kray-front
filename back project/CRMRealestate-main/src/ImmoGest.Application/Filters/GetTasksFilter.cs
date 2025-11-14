using ImmoGest.Domain.Core.Entities;
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
    }
}

