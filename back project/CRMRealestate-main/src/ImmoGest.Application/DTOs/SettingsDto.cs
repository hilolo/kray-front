using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class SettingsDto
    {
        public string Id { get; set; } = string.Empty;
        public string CompanyId { get; set; } = string.Empty;
        public string DefaultCity { get; set; } = string.Empty;
        public string Language { get; set; } = "fr";
        public List<CategoryReference> Categories { get; set; } = new();
        public List<string> Features { get; set; } = new();
        public List<string> Amenities { get; set; } = new();
        public List<string> PropertyTypes { get; set; } = new();
    }

    public class CategoryReference
    {
        public string Key { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
    }

    public class UpdateSettingsDto
    {
        public string DefaultCity { get; set; } = string.Empty;
        public string Language { get; set; } = "fr";
        public List<CategoryReference> Categories { get; set; } = new();
        public List<string> Features { get; set; } = new();
        public List<string> Amenities { get; set; } = new();
        public List<string> PropertyTypes { get; set; } = new();
    }
}
