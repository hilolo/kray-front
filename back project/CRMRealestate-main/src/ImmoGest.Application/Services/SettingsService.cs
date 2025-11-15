using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Repositories;
using System.Text.Json;
using ResultNet;
using ImmoGest.Domain;

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

        public async Task<Result<SettingsDto>> GetByCompanyIdAsync(Guid companyId)
        {
            var settings = await _settingsRepository.GetByCompanyIdAsync(companyId.ToString());
            if (settings == null)
                return Result.Failure<SettingsDto>().WithCode(MessageCode.NotFound);

            return Result.Success(MapToDto(settings));
        }

        public async Task<Result<SettingsDto>> UpdateAsync(Guid companyId, UpdateSettingsDto updateSettingsDto)
        {
            var existingSettings = await _settingsRepository.GetByCompanyIdAsync(companyId.ToString());
            if (existingSettings == null)
                return Result.Failure<SettingsDto>().WithCode(MessageCode.NotFound);

            existingSettings.DefaultCity = updateSettingsDto.DefaultCity;
            existingSettings.CategoriesJson = JsonSerializer.Serialize(updateSettingsDto.Categories);
            existingSettings.FeaturesJson = JsonSerializer.Serialize(updateSettingsDto.Features);
            existingSettings.AmenitiesJson = JsonSerializer.Serialize(updateSettingsDto.Amenities);
            existingSettings.PropertyTypesJson = JsonSerializer.Serialize(updateSettingsDto.PropertyTypes);

            var updatedSettings = await _settingsRepository.UpdateAsync(existingSettings);
            return Result.Success(MapToDto(updatedSettings));
        }

        private SettingsDto MapToDto(Settings settings)
        {
            return new SettingsDto
            {
                Id = settings.Id.ToString(),
                CompanyId = settings.CompanyId,
                DefaultCity = settings.DefaultCity,
                Categories = JsonSerializer.Deserialize<List<CategoryReference>>(settings.CategoriesJson) ?? new(),
                Features = JsonSerializer.Deserialize<List<string>>(settings.FeaturesJson) ?? new(),
                Amenities = JsonSerializer.Deserialize<List<string>>(settings.AmenitiesJson) ?? new(),
                PropertyTypes = JsonSerializer.Deserialize<List<string>>(settings.PropertyTypesJson) ?? new()
            };
        }
    }
}
