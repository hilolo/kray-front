using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;

namespace ImmoGest.Application.Filters
{
    public class GetContactsFilter : FilterOption
    {
        public ContactType? Type { get; set; }
        public bool? IsACompany { get; set; }
    }
}

