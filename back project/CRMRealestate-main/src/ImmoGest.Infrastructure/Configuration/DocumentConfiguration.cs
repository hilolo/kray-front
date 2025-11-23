using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;
using System.Text.Json;

namespace ImmoGest.Infrastructure.Configuration
{
    public class DocumentConfiguration : IEntityTypeConfiguration<Document>
    {
        public void Configure(EntityTypeBuilder<Document> builder)
        {
            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(d => d.Id);

            builder.Property(d => d.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(d => d.Type)
                .IsRequired();

            builder.Property(d => d.Generate)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(d => d.IsLogo)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(d => d.IsCachet)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(d => d.HtmlBody)
                .HasColumnType("text"); // Use text type for large strings

            builder.Property(d => d.IsLocked)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(d => d.Pdfmake)
                .HasColumnType("text"); // Use text type for large strings

            // Configure Example with automatic JSON serialization/deserialization
            var exampleConverter = new ValueConverter<Dictionary<string, string>, string>(
                v => v == null ? null : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => string.IsNullOrEmpty(v) ? null : JsonSerializer.Deserialize<Dictionary<string, string>>(v, (JsonSerializerOptions)null)
            );

            builder.Property(d => d.Example)
                .HasColumnType("json")
                .HasConversion(exampleConverter);

            builder.Property(d => d.LeaseeId)
                .IsRequired(false);

            builder.Property(d => d.CompanyId)
                .IsRequired(false);

            builder.Property(d => d.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            // Configure relationship with Company (optional)
            builder.HasOne(d => d.Company)
                .WithMany()
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure relationship with Lease (optional)
            builder.HasOne(d => d.Leasee)
                .WithMany()
                .HasForeignKey(d => d.LeaseeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Seed default documents for each DocumentType
            var now = DateTimeOffset.UtcNow;
            builder.HasData(
                new Document
                {
                    Id = new Guid("b2c3d4e5-f6a7-4890-b123-456789012345"),
                    Name = "Lease",
                    Type = DocumentType.Lease,
                    Generate = false,
                    IsLogo = false,
                    IsCachet = false,
                    IsLocked = true,
                    CompanyId = null,
                    IsDeleted = false,
                    CreatedOn = now,
                    LastModifiedOn = now
                },
                new Document
                {
                    Id = new Guid("c3d4e5f6-a7b8-4901-c234-567890123456"),
                    Name = "Reservation Full",
                    Type = DocumentType.ReservationFull,
                    Generate = false,
                    IsLogo = false,
                    IsCachet = false,
                    IsLocked = true,
                    CompanyId = null,
                    IsDeleted = false,
                    CreatedOn = now,
                    LastModifiedOn = now
                },
                new Document
                {
                    Id = new Guid("d4e5f6a7-b8c9-4012-d345-678901234567"),
                    Name = "Reservation Part",
                    Type = DocumentType.ReservationPart,
                    Generate = false,
                    IsLogo = false,
                    IsCachet = false,
                    IsLocked = true,
                    CompanyId = null,
                    IsDeleted = false,
                    CreatedOn = now,
                    LastModifiedOn = now
                },
                new Document
                {
                    Id = new Guid("e5f6a7b8-c9d0-4123-e456-789012345678"),
                    Name = "Fees",
                    Type = DocumentType.Fees,
                    Generate = false,
                    IsLogo = false,
                    IsCachet = false,
                    IsLocked = true,
                    CompanyId = null,
                    IsDeleted = false,
                    CreatedOn = now,
                    LastModifiedOn = now
                },
                new Document
                {
                    Id = new Guid("f6a7b8c9-d0e1-4234-f567-890123456789"),
                    Name = "Deposit",
                    Type = DocumentType.Deposit,
                    Generate = false,
                    IsLogo = false,
                    IsCachet = false,
                    IsLocked = true,
                    CompanyId = null,
                    IsDeleted = false,
                    CreatedOn = now,
                    LastModifiedOn = now
                }
            );
        }
    }
}

