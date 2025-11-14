using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using System.Text.Json;

namespace ImmoGest.Application.Services
{
    public class SettingsService : ISettingsService
    {
        private readonly ISettingsRepository _settingsRepository;
        private readonly IMapper _mapper;

        public SettingsService(ISettingsRepository settingsRepository, IMapper mapper)
        {
            _settingsRepository = settingsRepository;
            _mapper = mapper;
        }

        public async Task<SettingsDto?> GetByCompanyIdAsync(Guid companyId)
        {
            var settings = await _settingsRepository.GetByCompanyIdAsync(companyId.ToString());
            if (settings == null) return null;

            return MapToDto(settings);
        }

        public async Task<SettingsDto> UpdateAsync(Guid companyId, UpdateSettingsDto updateSettingsDto)
        {
            var existingSettings = await _settingsRepository.GetByCompanyIdAsync(companyId.ToString());
            if (existingSettings == null)
                throw new ArgumentException("Settings not found");

            existingSettings.DefaultCity = updateSettingsDto.DefaultCity;
            existingSettings.Language = updateSettingsDto.Language;
            existingSettings.CategoriesJson = JsonSerializer.Serialize(updateSettingsDto.Categories);
            existingSettings.FeaturesJson = JsonSerializer.Serialize(updateSettingsDto.Features);
            existingSettings.AmenitiesJson = JsonSerializer.Serialize(updateSettingsDto.Amenities);
            existingSettings.PropertyTypesJson = JsonSerializer.Serialize(updateSettingsDto.PropertyTypes);

            var updatedSettings = await _settingsRepository.UpdateAsync(existingSettings);
            return MapToDto(updatedSettings);
        }

        private SettingsDto MapToDto(Settings settings)
        {
            return new SettingsDto
            {
                Id = settings.Id.ToString(),
                CompanyId = settings.CompanyId,
                DefaultCity = settings.DefaultCity,
                Language = settings.Language,
                Categories = JsonSerializer.Deserialize<List<CategoryReference>>(settings.CategoriesJson) ?? new(),
                Features = JsonSerializer.Deserialize<List<string>>(settings.FeaturesJson) ?? new(),
                Amenities = JsonSerializer.Deserialize<List<string>>(settings.AmenitiesJson) ?? new(),
                PropertyTypes = JsonSerializer.Deserialize<List<string>>(settings.PropertyTypesJson) ?? new()
            };
        }
    }
}
