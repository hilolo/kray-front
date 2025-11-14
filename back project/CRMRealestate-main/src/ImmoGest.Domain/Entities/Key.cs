using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using System;

namespace ImmoGest.Domain.Entities
{
    public class Key : Entity, IDeletable
    {
        public string Name { get; set; }
        public string Description { get; set; }
        
        // Foreign Key to Property
        public Guid PropertyId { get; set; }
        public Property Property { get; set; }
        
        public bool IsDeleted { get; set; }

        public override void BuildSearchTerms()
            => SearchTerms = $"{Name} {Description}".ToUpper();
    }
}

