using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class BuildingDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public int Year { get; set; }
        public string Description { get; set; }
        public int Floor { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public string DefaultAttachmentUrl { get; set; }
        public Guid CompanyId { get; set; }
        
        // Navigation
        public List<PropertyDto> Properties { get; set; }
        public int PropertiesCount { get; set; }
        
        public bool IsArchived { get; set; }
        
        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateBuildingDto
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public int Year { get; set; }
        public string Description { get; set; }
        public int Floor { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public BuildingImageInput Image { get; set; }
    }

    public class UpdateBuildingDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public int Year { get; set; }
        public string Description { get; set; }
        public int Floor { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public BuildingImageInput Image { get; set; }
    }

    public class BuildingImageInput
    {
        public string FileName { get; set; }
        public string Base64Content { get; set; }
    }

    public class UpdateBuildingArchiveStatusDto
    {
        public Guid BuildingId { get; set; }
        public bool IsArchived { get; set; }
    }
}

