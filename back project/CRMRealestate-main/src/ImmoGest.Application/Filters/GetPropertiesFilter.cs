using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;

namespace ImmoGest.Application.Filters
{
    public class GetPropertiesFilter : FilterOption
    {
        public string Identifier { get; set; }
        public string TypeProperty { get; set; }
        public TypePaiment? TypePaiment { get; set; }
        public float? MinPrice { get; set; }
        public float? MaxPrice { get; set; }
        public float? MinArea { get; set; }
        public float? MaxArea { get; set; }
        public Guid? BuildingId { get; set; }
        public bool? UnattachedOnly { get; set; } // Filter for properties without a building (BuildingId == null)
        public Guid? ContactId { get; set; } // Filter by owner/contact
        public PropertyCategory? Category { get; set; } // Filter by property category
        public string City { get; set; }
        public string Address { get; set; }
    }
}
