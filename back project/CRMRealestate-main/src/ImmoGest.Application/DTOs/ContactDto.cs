using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class ContactDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CompanyName { get; set; }
        public string Ice { get; set; }
        public string Rc { get; set; }
        public string Identifier { get; set; }
        public ContactType Type { get; set; }
        public bool IsACompany { get; set; }
        public string? Email { get; set; }
        public List<string> Phones { get; set; }
        public string Avatar { get; set; }
        public List<AttachmentDto> Attachments { get; set; }
        public int AttachmentCount { get; set; }
        public Guid CompanyId { get; set; }
        public bool IsArchived { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        
        // Related entities
        public List<PropertyDto> Properties { get; set; }
        public List<LeaseDto> Leases { get; set; }
        public List<BankDto> Banks { get; set; }
    }

    public class UpdateContactArchiveStatusDto
    {
        public Guid ContactId { get; set; }
        public bool IsArchived { get; set; }
    }
}

