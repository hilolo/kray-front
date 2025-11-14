using System;

namespace ImmoGest.Application.DTOs
{
    public class KeyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid PropertyId { get; set; }
        public PropertyDto Property { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }

    public class CreateKeyDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid PropertyId { get; set; }
    }

    public class UpdateKeyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid PropertyId { get; set; }
    }
}

