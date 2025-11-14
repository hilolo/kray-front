using System;
using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;

namespace ImmoGest.Domain.Entities
{
    public class Settings : Entity, IDeletable
    {
        public string CompanyId { get; set; } = string.Empty;
        public string DefaultCity { get; set; } = string.Empty;
        public string Language { get; set; } = "fr"; // Default language
        public string CategoriesJson { get; set; } = string.Empty; // JSON string for categories and references
        public string FeaturesJson { get; set; } = string.Empty; // JSON string for features list
        public string AmenitiesJson { get; set; } = string.Empty; // JSON string for amenities list
        public string PropertyTypesJson { get; set; } = string.Empty; // JSON string for property types list
        public DateTime? DeletedAt { get; set; }
        public bool IsDeleted { get; set; }

        public override void BuildSearchTerms()
        {
            // Implementation for search terms if needed
        }
    }
}
