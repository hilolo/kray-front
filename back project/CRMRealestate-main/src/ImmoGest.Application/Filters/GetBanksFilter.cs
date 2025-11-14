using ImmoGest.Domain.Core.Entities;
using System;

namespace ImmoGest.Application.Filters
{
    public class GetBanksFilter : FilterOption
    {
        public Guid? ContactId { get; set; }
    }
}

