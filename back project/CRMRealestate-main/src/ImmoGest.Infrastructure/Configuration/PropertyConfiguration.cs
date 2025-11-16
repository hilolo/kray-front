using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Linq;

namespace ImmoGest.Infrastructure.Configuration
{
    public class PropertyConfiguration : IEntityTypeConfiguration<Property>
    {
        public void Configure(EntityTypeBuilder<Property> builder)
        {
            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Identifier)
                .IsRequired()
                .HasMaxLength(50);

            // Add unique constraint to Identifier field
            builder.HasIndex(p => p.Identifier)
                .IsUnique();

            builder.Property(p => p.Name)
                .HasMaxLength(200);

            builder.Property(p => p.Description)
                .HasMaxLength(1000);

            builder.Property(p => p.Address)
                .HasMaxLength(500);

            builder.Property(p => p.City)
                .HasMaxLength(100);

            builder.Property(p => p.TypeProperty)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.Area)
                .IsRequired();

            builder.Property(p => p.Pieces)
                .IsRequired();

            builder.Property(p => p.Bathrooms)
                .IsRequired();

            builder.Property(p => p.Furnished)
                .IsRequired();

            builder.Property(p => p.Price)
                .IsRequired();

            builder.Property(p => p.TypePaiment)
                .IsRequired();

            builder.Property(p => p.Features)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());

            builder.Property(p => p.Equipment)
                .HasConversion(
                    v => string.Join(',', v),
                    v => v.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList());

            builder.Property(p => p.Category)
                .IsRequired();

            builder.Property(p => p.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(p => p.IsArchived)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(p => p.IsPublic)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(p => p.IsPublicAdresse)
                .IsRequired()
                .HasDefaultValue(false);

            builder.HasOne(p => p.Building)
                .WithMany()
                .HasForeignKey(p => p.BuildingId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(p => p.Contact)
                .WithMany()
                .HasForeignKey(p => p.ContactId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.Company)
                .WithMany()
                .HasForeignKey(p => p.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.DefaultAttachment)
                .WithMany()
                .HasForeignKey(p => p.DefaultAttachmentId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(p => p.Keys)
                .WithOne(k => k.Property)
                .HasForeignKey(k => k.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
} 