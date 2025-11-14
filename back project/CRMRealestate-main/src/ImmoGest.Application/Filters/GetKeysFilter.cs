using ImmoGest.Domain.Core.Entities;
using System;

namespace ImmoGest.Application.Filters
{
    public class GetKeysFilter : FilterOption
    {
        public Guid? PropertyId { get; set; }
    }
}

