using System;
using ImmoGest.Domain.Entities.Enums;

namespace ImmoGest.Application.DTOs.Hero
{
    public class GetHeroDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Nickname { get; set; }
        public int? Age { get; set; }
        public string Individuality { get; set; }
        public HeroType? HeroType { get; set; }
        public string Team { get; set; }
    }
}
