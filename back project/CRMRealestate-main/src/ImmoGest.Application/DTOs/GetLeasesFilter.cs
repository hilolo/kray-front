using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;

namespace ImmoGest.Application.DTOs
{
    public class GetLeasesFilter : FilterOption
    {
        public Guid? PropertyId { get; set; }
        public Guid? ContactId { get; set; }
        public LeasingStatus? Status { get; set; }
        public bool? IsArchived { get; set; }
    }
}


