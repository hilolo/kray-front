using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ResultNet;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Repositories
{
    public interface INavigationRepository : IRepository<NavigationItem>
    {
        Task<Result<List<NavigationItem>>> GetHierarchicalAsync();
    }
}
