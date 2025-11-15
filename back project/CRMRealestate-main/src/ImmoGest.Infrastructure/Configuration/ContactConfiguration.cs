using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Collections.Generic;
using System.Text.Json;

namespace ImmoGest.Infrastructure.Configuration
{
    public class ContactConfiguration : IEntityTypeConfiguration<Contact>
    {
        public void Configure(EntityTypeBuilder<Contact> builder)
        {
            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(c => c.Id);

            builder.Property(c => c.FirstName)
                .HasMaxLength(200);

            builder.Property(c => c.LastName)
                .HasMaxLength(200);

            builder.Property(c => c.CompanyName)
                .HasMaxLength(200);

            builder.Property(c => c.Ice)
                .HasMaxLength(50);

            builder.Property(c => c.Rc)
                .HasMaxLength(50);

            builder.Property(c => c.Type)
                .IsRequired();

            builder.Property(c => c.IsACompany)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(c => c.Email)
                .HasMaxLength(200);

            // Configure Phones with automatic JSON serialization/deserialization
            var phonesConverter = new ValueConverter<List<string>, string>(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => string.IsNullOrEmpty(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null) ?? new List<string>()
            );

            builder.Property(c => c.Phones)
                .HasColumnType("json")
                .HasConversion(phonesConverter);

            builder.Property(c => c.Avatar)
                .HasMaxLength(500);

            builder.Property(c => c.AvatarStorageHash)
                .HasMaxLength(100);

            builder.Property(c => c.CompanyId)
                .IsRequired();

            builder.Property(c => c.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(c => c.IsArchived)
                .IsRequired()
                .HasDefaultValue(false);

            // Configure relationship with Company
            builder.HasOne(c => c.Company)
                .WithMany()
                .HasForeignKey(c => c.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
 