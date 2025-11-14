using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using System;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Domain.Entities
{
    public class Bank : Entity, IDeletable
    {
        [Required]
        public Guid CompanyId { get; set; }
        public Company Company { get; set; }

        [Required]
        public Guid ContactId { get; set; }
        public Contact Contact { get; set; }

        public string BankName { get; set; }

        [Required]
        public string RIB { get; set; }

        public string IBAN { get; set; }

        public string Swift { get; set; }

        public bool IsDeleted { get; set; }

        public override void BuildSearchTerms()
            => SearchTerms = $"{BankName} {RIB} {IBAN} {Swift}".ToUpper();
    }
}

