using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Domain.Entities
{
    public class Document : Entity, IDeletable
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        public DocumentType Type { get; set; }

        [Required]
        public bool Generate { get; set; }

        [Required]
        public bool IsLogo { get; set; }

        [Required]
        public bool IsCachet { get; set; }

        public string HtmlBody { get; set; }

        [Required]
        public bool IsLocked { get; set; }

        public string Pdfmake { get; set; }

        // Example data stored as JSON (nullable)
        // Format: Dictionary<string, string> where key is field key and value is the actual value
        public Dictionary<string, string> Example { get; set; }

        public Guid? LeaseeId { get; set; }
        public Lease Leasee { get; set; }

        public Guid? CompanyId { get; set; }
        public Company Company { get; set; }

        public bool IsDeleted { get; set; }

        public override void BuildSearchTerms()
        {
            var exampleData = Example != null && Example.Count > 0 
                ? string.Join(" ", Example.Values) 
                : string.Empty;
            SearchTerms = $"{Name} {HtmlBody} {exampleData}".ToUpper();
        }
    }
}

