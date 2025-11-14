using ImmoGest.Domain.Entities.Enums;
using System;

namespace ImmoGest.Application.DTOs
{
    public class CreateTaskDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public TaskStatus? Status { get; set; } // Optional, defaults to ToDo in service
        public TaskPriority Priority { get; set; }
        public DateTime ScheduledDateTime { get; set; }
        public Guid AssignedUserId { get; set; }
        public Guid? ContactId { get; set; }
        public Guid? PropertyId { get; set; }
    }
}

