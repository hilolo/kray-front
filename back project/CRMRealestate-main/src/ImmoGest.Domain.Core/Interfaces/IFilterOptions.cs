using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Core.Interfaces
{
    public interface IFilterOptions
    {
        int CurrentPage { get; set; } 
        int PageSize { get; set; } 
        string SearchQuery { get; set; }
        bool Ignore { get; set; }
        Guid? CompanyId { get; set; }
    }
}
