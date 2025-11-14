using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Application.Filters
{
    public class ClientFilter : FilterOption
    {
        public TypeTenant TypeClient { get; set; }

    }
}
