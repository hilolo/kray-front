using System.ComponentModel.DataAnnotations;
using ImmoGest.Domain.Entities.Enums;

namespace ImmoGest.Application.DTOs.Hero
{
    public class CreateHeroDto
    {
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; }

        public string Nickname { get; set; }
        public int? Age { get; set; }
        public string Individuality { get; set; }

        [Required(ErrorMessage = "HeroType is required")]
        public HeroType? HeroType { get; set; }

        public string Team { get; set; }
    }
}
