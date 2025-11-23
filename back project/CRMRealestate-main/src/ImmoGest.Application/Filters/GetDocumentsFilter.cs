using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;

namespace ImmoGest.Application.Filters
{
    public class GetDocumentsFilter : FilterOption
    {
        public string Name { get; set; }
        public DocumentType? Type { get; set; }
        public bool? Generate { get; set; }
        public bool? IsLogo { get; set; }
        public bool? IsCachet { get; set; }
        public Guid? LeaseeId { get; set; }
    }
}

