using ImmoGest.Domain.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Core.Entities
{
    public abstract class FilterOption : IFilterOptions
    {
        public int CurrentPage { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchQuery { get; set; }
        public bool Ignore { get; set; } = false;
        public Guid? CompanyId { get; set; }
    }
}


