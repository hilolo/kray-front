using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ResultNet;

namespace ImmoGest.Application.Interfaces
{
    public interface ISettingsService
    {
        Task<Result<SettingsDto>> GetByCompanyIdAsync(Guid companyId);
        Task<Result<SettingsDto>> UpdateAsync(Guid companyId, UpdateSettingsDto updateSettingsDto);
    }
}
