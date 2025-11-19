using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Domain.Entities
{
    public class Contact : Entity, IDeletable
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CompanyName { get; set; }
        public string Ice { get; set; }
        public string Rc { get; set; }
        
        [Required]
        public string Identifier { get; set; }

        [Required]
        public ContactType Type { get; set; }

        public bool IsACompany { get; set; }
        public string? Email { get; set; }

        // Phone numbers stored as JSON array in database
        public List<string> Phones { get; set; }

        public string Avatar { get; set; }
        public string AvatarStorageHash { get; set; }  // Immutable hash used for S3 storage keys (never changes)

        public Guid CompanyId { get; set; }
        public Company Company { get; set; }

        public ICollection<Attachment> Attachments { get; set; }
        public ICollection<Transaction> Transactions { get; set; }

        public bool IsDeleted { get; set; }
        public bool IsArchived { get; set; }

        public override void BuildSearchTerms()
        {
            var phones = Phones != null && Phones.Count > 0 ? string.Join(" ", Phones) : string.Empty;
            SearchTerms = $"{FirstName} {LastName} {CompanyName} {Email} {Identifier} {phones}".ToUpper();
        }
    }
}

