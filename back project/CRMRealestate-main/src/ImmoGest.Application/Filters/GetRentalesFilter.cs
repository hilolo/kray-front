using ImmoGest.Domain.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Application.Filters
{
    public class GetRentalesFilter : FilterOption
    {
        public Guid? PropertyId { get; set; }
        public Guid? ClientId { get; set; }
    }
}
