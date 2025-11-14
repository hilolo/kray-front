using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ImmoGest.Domain.Core.Entities;

namespace ImmoGest.Domain.Entities
{
    public class UserPermissions : Entity
    {
        [Required]
        public Guid UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }

        /// <summary>
        /// JSON string containing module permissions
        /// Structure: {"dashboard":{"view":true,"edit":false,"delete":false},"properties":{"view":true,"edit":true,"delete":false}}
        /// Stored as JSON in MySQL for efficient querying
        /// </summary>
        [Required]
        [Column(TypeName = "json")]
        public string PermissionsJson { get; set; }

        public override void BuildSearchTerms()
            => SearchTerms = string.Empty;
    }
}
