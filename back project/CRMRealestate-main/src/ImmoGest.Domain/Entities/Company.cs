using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Domain.Entities
{
    public class Company : Entity, IDeletable
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Phone { get; set; }
        public string Website { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Rc { get; set; }
        public string Ice { get; set; }
        public string Image { get; set; }
        public bool Restricted { get; set; }
        public bool IsDeleted { get; set; }

        public override void BuildSearchTerms()
        => "".ToString().ToUpper();
    }
}
