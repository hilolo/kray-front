using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Application.DTOs
{
    public class CreateDocumentDto
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

        public Dictionary<string, string> Example { get; set; }

        public Guid? LeaseeId { get; set; }

        public Guid? CompanyId { get; set; }
    }
}

