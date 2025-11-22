using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
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

            builder.Property(d => d.TransactionId)
                .IsRequired(false);

            builder.Property(d => d.CompanyId)
                .IsRequired();

            builder.Property(d => d.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            // Configure relationship with Company
            builder.HasOne(d => d.Company)
                .WithMany()
                .HasForeignKey(d => d.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure relationship with Lease (optional)
            builder.HasOne(d => d.Leasee)
                .WithMany()
                .HasForeignKey(d => d.LeaseeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure relationship with Transaction (optional)
            builder.HasOne(d => d.Transaction)
                .WithMany()
                .HasForeignKey(d => d.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

