using System.ComponentModel.DataAnnotations;
using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities.Enums;

namespace ImmoGest.Domain.Entities
{
    public class Hero : Entity
    {
        [Required]
        public string Name { get; set; }

        public string Nickname { get; set; }
        public string Individuality { get; set; }
        public int? Age { get; set; }

        [Required]
        public HeroType? HeroType { get; set; }

        public string Team { get; set; }
        public override void BuildSearchTerms()
          => SearchTerms = $"D".ToLower();
    }
}
