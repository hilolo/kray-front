using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class DocumentDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public DocumentType Type { get; set; }
        public bool Generate { get; set; }
        public bool IsLogo { get; set; }
        public bool IsCachet { get; set; }
        public string HtmlBody { get; set; }
        public bool IsLocked { get; set; }
        public string Pdfmake { get; set; }
        public Dictionary<string, string> Example { get; set; }
        public Guid? LeaseeId { get; set; }
        public Guid? TransactionId { get; set; }
        public Guid CompanyId { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public DateTimeOffset? LastModifiedOn { get; set; }
    }
}

