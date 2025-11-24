using System;
using System.ComponentModel.DataAnnotations;
using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;

namespace ImmoGest.Domain.Entities
{
    public class User : Entity, IDeletable
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string Role { get; set; }
        public string Avatar { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public bool IsDeleted { get; set; }
        public Company Company { get; set; }
        public Guid CompanyId { get; set; }
        public string PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }
        public override void BuildSearchTerms()
           => SearchTerms = $"D".ToLower();
    }
}

