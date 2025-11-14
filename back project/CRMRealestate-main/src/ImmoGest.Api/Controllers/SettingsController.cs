using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly ISettingsService _settingsService;
        private readonly ISession _session;

        public SettingsController(ISettingsService settingsService, ISession session)
        {
            _settingsService = settingsService;
            _session = session;
        }

        [HttpGet]
        public async Task<ActionResult<SettingsDto>> Get()
        {
            var settings = await _settingsService.GetByCompanyIdAsync(_session.CompanyId);
            if (settings == null)
                return NotFound();

            return Ok(settings);
        }

        [HttpPut]
        public async Task<ActionResult<SettingsDto>> Update(UpdateSettingsDto updateSettingsDto)
        {
            try
            {
                var settings = await _settingsService.UpdateAsync(_session.CompanyId, updateSettingsDto);
                return Ok(settings);
            }
            catch (ArgumentException)
            {
                return NotFound();
            }
        }
    }
}
