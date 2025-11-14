using System;
using System.Threading.Tasks;
using ImmoGest.Domain.Entities;

namespace ImmoGest.Domain.Repositories
{
    public interface ISettingsRepository
    {
        System.Threading.Tasks.Task<Settings?> GetByCompanyIdAsync(string companyId);
        System.Threading.Tasks.Task<Settings> CreateAsync(Settings settings);
        System.Threading.Tasks.Task<Settings> UpdateAsync(Settings settings);
        System.Threading.Tasks.Task DeleteAsync(string id);
    }
}
