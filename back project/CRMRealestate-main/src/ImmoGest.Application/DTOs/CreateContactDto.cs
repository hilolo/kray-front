using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Application.DTOs
{
    public class CreateContactDto
    {
        public string FirstName { get; set; }
        
        public string LastName { get; set; }
        
        public string CompanyName { get; set; }
        
        [StringLength(50)]
        public string Ice { get; set; }
        
        [StringLength(50)]
        public string Rc { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Identifier { get; set; }
        
        [Required]
        public ContactType Type { get; set; }
        
        [Required]
        public bool IsACompany { get; set; }
        
        [StringLength(200)]
        public string? Email { get; set; }
        
        public List<string> Phones { get; set; }
        
        public string Avatar { get; set; }
        
        public List<AttachmentInputDto> Attachments { get; set; }
        
        [Required]
        public Guid CompanyId { get; set; }
    }
}

