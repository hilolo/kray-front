using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs.Navigation
{
    public class NavigationDto
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public string TitleEn { get; set; }
        public string TitleFr { get; set; }
        public string Type { get; set; }
        public string Icon { get; set; }
        public string Link { get; set; }
        public List<NavigationDto> Children { get; set; } = new List<NavigationDto>();
        public object Meta { get; set; }
    }

    public class NavigationResponseDto : List<NavigationDto>
    {
    }
}
