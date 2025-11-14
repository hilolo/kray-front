using ImmoGest.Application.DTOs.Hero;
using ImmoGest.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System;
using ResultNet;

[ApiController]
[Route("api/[controller]")]
public class HeroController : ControllerBase
{
    private readonly IHeroService _heroService;

    public HeroController(IHeroService heroService)
    {
        _heroService = heroService;
    }

    /// <summary>
    /// Insert one hero in the database
    /// </summary>
    /// <param name="dto">The hero information</param>
    /// <returns></returns>
    [HttpPost]
    public async Task<ActionResult<GetHeroDto>> Create([FromBody] CreateHeroDto dto)
    {

        return null;
    }


}
