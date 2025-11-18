using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class KeyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid PropertyId { get; set; }
        public PropertyDto Property { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public string DefaultAttachmentUrl { get; set; } // Full URL for default image display
        public List<AttachmentDetailsDto> Attachments { get; set; } // List of attachment details with URL and ID
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }

    public class CreateKeyDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid PropertyId { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public KeyImageInput Image { get; set; }
    }

    public class UpdateKeyDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public Guid PropertyId { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public KeyImageInput Image { get; set; }
    }

    public class KeyImageInput
    {
        public string FileName { get; set; }
        public string Base64Content { get; set; }
    }
}

