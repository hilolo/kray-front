using System;
using System.Threading.Tasks;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;

namespace ImmoGest.Infrastructure.Repositories
{
    public class SettingsRepository : ISettingsRepository
    {
        private readonly ApplicationDbContext _context;

        public SettingsRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Settings?> GetByCompanyIdAsync(string companyId)
        {
            return await _context.Settings
                .FirstOrDefaultAsync(s => s.CompanyId == companyId && !s.IsDeleted);
        }

        public async Task<Settings> CreateAsync(Settings settings)
        {
            _context.Settings.Add(settings);
            await _context.SaveChangesAsync();
            return settings;
        }

        public async Task<Settings> UpdateAsync(Settings settings)
        {
            _context.Settings.Update(settings);
            await _context.SaveChangesAsync();
            return settings;
        }

        public async Task DeleteAsync(string id)
        {
            var settings = await _context.Settings.FindAsync(id);
            if (settings != null)
            {
                settings.IsDeleted = true;
                settings.DeletedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }
}
