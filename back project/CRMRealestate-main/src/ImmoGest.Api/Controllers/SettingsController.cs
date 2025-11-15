using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResultNet;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : Base
    {
        private readonly ISettingsService _settingsService;
        private readonly ISession _session;

        public SettingsController(ISettingsService settingsService, ISession session)
        {
            _settingsService = settingsService;
            _session = session;
        }

        [HttpGet]
        public async Task<ActionResult<Result<SettingsDto>>> Get()
        {
            return ActionResultFor(await _settingsService.GetByCompanyIdAsync(_session.CompanyId));
        }

        [HttpPut]
        public async Task<ActionResult<Result<SettingsDto>>> Update(UpdateSettingsDto updateSettingsDto)
        {
            return ActionResultFor(await _settingsService.UpdateAsync(_session.CompanyId, updateSettingsDto));
        }
    }
}
