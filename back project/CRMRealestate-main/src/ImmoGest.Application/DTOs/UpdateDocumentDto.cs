using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Application.DTOs
{
    public class UpdateDocumentDto
    {
        [Required]
        public Guid Id { get; set; }

        [StringLength(200)]
        public string Name { get; set; }

        public DocumentType? Type { get; set; }

        public bool? Generate { get; set; }

        public bool? IsLogo { get; set; }

        public bool? IsCachet { get; set; }

        public string HtmlBody { get; set; }

        public Dictionary<string, string> Example { get; set; }

        public Guid? LeaseeId { get; set; }

        public Guid? TransactionId { get; set; }

        public Guid? CompanyId { get; set; }
    }
}

