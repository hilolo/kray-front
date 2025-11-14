using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Application.DTOs
{
    public class UpdateContactDto
    {
        [Required]
        public Guid Id { get; set; }
        
        public string? FirstName { get; set; }
        
        public string? LastName { get; set; }
        
        public string? CompanyName { get; set; }
        
        [StringLength(50)]
        public string? Ice { get; set; }
        
        [StringLength(50)]
        public string? Rc { get; set; }
        
        [StringLength(100)]
        public string? Identifier { get; set; }
        
        [StringLength(200)]
        public string? Email { get; set; }
        
        public List<string>? Phones { get; set; }
        
        /// <summary>
        /// Avatar as base64 string. 
        /// - null or empty string: preserve existing avatar (if RemoveAvatar is false/not set) or remove avatar (if RemoveAvatar is true)
        /// - base64 string: update avatar
        /// </summary>
        public string? Avatar { get; set; }
        
        /// <summary>
        /// Flag to indicate if avatar should be removed.
        /// When true and Avatar is null/empty, the avatar will be deleted.
        /// When false/not set and Avatar is null/empty, the existing avatar will be preserved.
        /// </summary>
        public bool? RemoveAvatar { get; set; }
        
        // For incremental attachment updates
        public List<AttachmentInputDto>? AttachmentsToAdd { get; set; }
        public List<Guid>? AttachmentsToDelete { get; set; }
        
        public Guid? CompanyId { get; set; }
    }
}

