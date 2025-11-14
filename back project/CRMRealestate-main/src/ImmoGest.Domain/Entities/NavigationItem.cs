using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ImmoGest.Domain.Entities
{
    public class NavigationItem : Entity, IDeletable
    {


        [Required]
        [MaxLength(100)]
        public string ItemId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        [MaxLength(200)]
        public string TitleEn { get; set; }

        [MaxLength(200)]
        public string TitleFr { get; set; }

        [MaxLength(50)]
        public string Type { get; set; } 

        [MaxLength(100)]
        public string Icon { get; set; }

        [MaxLength(500)]
        public string Link { get; set; }

        public Guid? ParentId { get; set; }

        [ForeignKey("ParentId")]
        public virtual NavigationItem Parent { get; set; }

        public virtual ICollection<NavigationItem> Children { get; set; } = new List<NavigationItem>();

        public int Order { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDeleted { get; set; } = false;

        public override void BuildSearchTerms()
        {
            SearchTerms = $"{Title} {ItemId}".ToUpper();
        }
    }
}
