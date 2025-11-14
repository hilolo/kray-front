using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;

namespace ImmoGest.Application.Interfaces
{
    public interface ISettingsService
    {
        Task<SettingsDto?> GetByCompanyIdAsync(Guid companyId);
        Task<SettingsDto> UpdateAsync(Guid companyId, UpdateSettingsDto updateSettingsDto);
    }
}
