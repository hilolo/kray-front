using ImmoGest.Domain.Entities.Enums;
using System;

namespace ImmoGest.Application.DTOs
{
    public class TaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public TaskStatus Status { get; set; }
        public TaskPriority Priority { get; set; }
        public DateTime ScheduledDateTime { get; set; }
        public Guid AssignedUserId { get; set; }
        public string AssignedUserName { get; set; }
        public Guid? ContactId { get; set; }
        public string ContactName { get; set; }
        public Guid? PropertyId { get; set; }
        public string PropertyName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

