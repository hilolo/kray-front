using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class PropertyDto
    {
        public Guid Id { get; set; }
        public string Identifier { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string TypeProperty { get; set; }
        public float Area { get; set; }
        public float Pieces { get; set; }
        public float Bathrooms { get; set; }
        public bool Furnished { get; set; }
        public float Price { get; set; }
        public TypePaiment TypePaiment { get; set; }
        public Guid? BuildingId { get; set; }
        public Guid ContactId { get; set; }
        public Guid CompanyId { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public string DefaultAttachmentUrl { get; set; } // Full URL for default image display
        public List<string> Features { get; set; }
        public List<string> Equipment { get; set; }
        public PropertyCategory Category { get; set; }
        public bool IsArchived { get; set; }
        public bool IsPublic { get; set; }
        public bool IsPublicAdresse { get; set; }
        public bool IsShared { get; set; }
        
        // Contact/Owner information
        public string OwnerName { get; set; }
        public ContactDto Contact { get; set; } // Full contact/owner object
        
        // Building information (simplified for navigation)
        public PropertyBuildingDto Building { get; set; }
        
        // Images/Attachments - List of attachment details with URL and ID
        public List<AttachmentDetailsDto> Attachments { get; set; }
        public List<PropertyMaintenanceSummaryDto> Maintenances { get; set; }
        
        // Leases - List of leases for properties of type Location
        public List<LeaseDto> Leases { get; set; }
        
        // Keys - List of keys associated with the property
        public List<KeyDto> Keys { get; set; }
        
        // Timestamps
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class AttachmentDetailsDto
    {
        public Guid Id { get; set; }
        public string Url { get; set; }
        public string FileName { get; set; }
    }

    public class PropertyMaintenanceSummaryDto
    {
        public Guid Id { get; set; }
        public string Subject { get; set; }
        public MaintenanceStatus Status { get; set; }
        public MaintenancePriority Priority { get; set; }
        public DateTimeOffset ScheduledDateTime { get; set; }
        public string Description { get; set; }
        public string ContactName { get; set; }
        public string ContactEmail { get; set; }
        public string ContactPhone { get; set; }
    }

    public class PropertyBuildingDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
    }

    public class CreatePropertyDto
    {
        public string Identifier { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string TypeProperty { get; set; }
        public float Area { get; set; }
        public float Pieces { get; set; }
        public float Bathrooms { get; set; }
        public bool Furnished { get; set; }
        public float Price { get; set; }
        public TypePaiment TypePaiment { get; set; }
        public Guid? BuildingId { get; set; }
        public Guid ContactId { get; set; }
        public Guid CompanyId { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public List<string> Features { get; set; }
        public List<string> Equipment { get; set; }
        public PropertyCategory Category { get; set; }
        public bool IsPublic { get; set; }
        public bool IsPublicAdresse { get; set; }
        public bool IsShared { get; set; }
        public List<PropertyImageInput> Images { get; set; }
        public string DefaultImageId { get; set; }
    }
    
    public class PropertyImageInput
    {
        public string FileName { get; set; }
        public string Base64Content { get; set; }
        public bool IsDefault { get; set; } // Flag to indicate if this image should be set as default
    }

    public class UpdatePropertyDto
    {
        public Guid Id { get; set; }
        public string? Identifier { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? TypeProperty { get; set; }
        public float? Area { get; set; }
        public float? Pieces { get; set; }
        public float? Bathrooms { get; set; }
        public bool? Furnished { get; set; }
        public float? Price { get; set; }
        public TypePaiment? TypePaiment { get; set; }
        public Guid? BuildingId { get; set; }
        public Guid? ContactId { get; set; }
        public Guid? CompanyId { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public List<string>? Features { get; set; }
        public List<string>? Equipment { get; set; }
        public PropertyCategory? Category { get; set; }
        public bool? IsPublic { get; set; }
        public bool? IsPublicAdresse { get; set; }
        public bool? IsShared { get; set; }
        
        // Attachment management
        public List<PropertyImageInput>? ImagesToAdd { get; set; }
        public List<Guid>? AttachmentsToDelete { get; set; }
    }
    
    /// <summary>
    /// DTO for attaching or detaching a property to/from a building
    /// This is a lightweight operation that only updates the BuildingId
    /// Set BuildingId to null to detach, or provide a Guid to attach
    /// </summary>
    public class UpdatePropertyBuildingDto
    {
        public Guid PropertyId { get; set; }
        public Guid? BuildingId { get; set; } // Null to detach, Guid to attach
    }

    public class UpdatePropertyVisibilityDto
    {
        public Guid PropertyId { get; set; }
        public bool? IsPublic { get; set; }
        public bool? IsPublicAdresse { get; set; }
    }

    public class UpdatePropertyArchiveStatusDto
    {
        public Guid PropertyId { get; set; }
        public bool IsArchived { get; set; }
    }

    public class PublicPropertyDto
    {
        public Guid Id { get; set; }
        public string Identifier { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string TypeProperty { get; set; }
        public float Area { get; set; }
        public float Pieces { get; set; }
        public float Bathrooms { get; set; }
        public bool Furnished { get; set; }
        public float Price { get; set; }
        public TypePaiment TypePaiment { get; set; }
        public List<string> Features { get; set; }
        public List<string> Equipment { get; set; }
        public PropertyCategory Category { get; set; }
        public string DefaultAttachmentUrl { get; set; }
        public List<AttachmentDetailsDto> Attachments { get; set; }
        public bool IsAddressPublic { get; set; }
        public string CompanyName { get; set; }
        public string CompanyEmail { get; set; }
        public string CompanyPhone { get; set; }
        public string CompanyWebsite { get; set; }
        public string CompanyAddress { get; set; }
        public string CompanyLogoUrl { get; set; }

    }
}
