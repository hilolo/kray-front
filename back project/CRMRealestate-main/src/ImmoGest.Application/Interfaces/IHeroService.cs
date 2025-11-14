using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.DTOs.Hero;
using ImmoGest.Application.Filters;
using ImmoGest.Domain.Entities;

namespace ImmoGest.Application.Interfaces
{
    public interface IHeroService : IDataService<Hero>
    {
    }
}
