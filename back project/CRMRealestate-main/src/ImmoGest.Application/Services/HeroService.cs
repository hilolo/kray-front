using System;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ResultNet;

namespace ImmoGest.Application.Services
{
    public class HeroService : DataServiceBase<Hero>, IHeroService
    {
        private readonly IHeroRepository _heroRepository;

        public HeroService(IMapper mapper, IHeroRepository heroRepository) 
            : base(mapper, heroRepository)
        {
            _heroRepository = heroRepository;
        }

    
    }
}
