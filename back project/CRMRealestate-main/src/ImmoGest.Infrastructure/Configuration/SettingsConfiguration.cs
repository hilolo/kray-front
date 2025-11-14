using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;

namespace ImmoGest.Infrastructure.Configuration
{
    public class SettingsConfiguration : IEntityTypeConfiguration<Settings>
    {
        public void Configure(EntityTypeBuilder<Settings> builder)
        {
            builder.HasKey(s => s.Id);
            
            builder.Property(s => s.CompanyId)
                .IsRequired()
                .HasMaxLength(50);
                
            builder.Property(s => s.DefaultCity)
                .IsRequired()
                .HasMaxLength(100);
                
            builder.Property(s => s.CategoriesJson)
                .IsRequired()
                .HasColumnType("text");
                
            builder.Property(s => s.FeaturesJson)
                .IsRequired()
                .HasColumnType("text");
                
            builder.Property(s => s.AmenitiesJson)
                .IsRequired()
                .HasColumnType("text");
                
            builder.Property(s => s.PropertyTypesJson)
                .IsRequired()
                .HasColumnType("text");
                
            builder.Property(s => s.DeletedAt)
                .IsRequired(false);
                
            builder.Property(s => s.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            // Index for CompanyId for faster lookups
            builder.HasIndex(s => s.CompanyId)
                .HasDatabaseName("IX_Settings_CompanyId");
                
            // Index for soft delete
            builder.HasIndex(s => s.IsDeleted)
                .HasDatabaseName("IX_Settings_IsDeleted");

            // Seed default settings for the company
            var defaultFeatures = new List<string>
            {
                "Alarm", "Furnished", "Renovated", "Hardwood floors", "Fireplace", "Fresh paint",
                "Dishwasher", "Walk-in closets", "Balcony, Deck, Patio", "Internet", "Fenced yard", "Tile",
                "Carpet", "Storage", "Unfurnished"
            };

            var defaultAmenities = new List<string>
            {
                "Parking", "Laundry", "Air conditioning", "Heating", "Swimming pool", "Gym",
                "Security", "Elevator", "Balcony", "Garden", "Garage", "Pet friendly"
            };

            var defaultPropertyTypes = new List<string>
            {
                "Residential", "Commercial", "Industrial", "Mixed Use", "Vacation Rental",
                "Investment Property", "Luxury", "Affordable Housing", "Student Housing",
                "Senior Living", "Retail Space", "Office Space", "Warehouse", "Land"
            };

            var defaultCategories = new[]
            {
                new { Key = "location", Reference = "AL" },
                new { Key = "vente", Reference = "AV" },
                new { Key = "vacance", Reference = "VC" }
            };

            builder.HasData(
                new Settings
                {
                    Id = Guid.NewGuid(),
                    CompanyId = "687d9fd5-2752-4a96-93d5-0f33a49913c1",
                    DefaultCity = "New York",
                    Language = "fr",
                    CategoriesJson = JsonSerializer.Serialize(defaultCategories),
                    FeaturesJson = JsonSerializer.Serialize(defaultFeatures),
                    AmenitiesJson = JsonSerializer.Serialize(defaultAmenities),
                    PropertyTypesJson = JsonSerializer.Serialize(defaultPropertyTypes),
                    IsDeleted = false,
                    CreatedOn = DateTimeOffset.UtcNow
                }
            );
        }
    }
}