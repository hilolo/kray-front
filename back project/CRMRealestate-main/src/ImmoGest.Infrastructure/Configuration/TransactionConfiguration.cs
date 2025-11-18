using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;
using System.Text.Json;

namespace ImmoGest.Infrastructure.Configuration
{
    public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(t => t.Id);

            builder.Property(t => t.Category)
                .IsRequired();

            builder.Property(t => t.RevenueType)
                .IsRequired(false);

            builder.Property(t => t.ExpenseType)
                .IsRequired(false);

            builder.Property(t => t.TransactionType)
                .IsRequired();

            builder.Property(t => t.Status)
                .IsRequired();

            builder.Property(t => t.Date)
                .IsRequired();

            // Configure Payments with JSON serialization/deserialization
            var paymentsConverter = new ValueConverter<List<Payment>, string>(
                v => v == null || v.Count == 0 ? "[]" : JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => string.IsNullOrEmpty(v) || v == "[]" 
                    ? new List<Payment>() 
                    : JsonSerializer.Deserialize<List<Payment>>(v, (JsonSerializerOptions)null) ?? new List<Payment>()
            );

            builder.Property(t => t.Payments)
                .HasColumnType("json")
                .HasConversion(paymentsConverter);

            builder.Property(t => t.TotalAmount)
                .IsRequired()
                .HasColumnType("decimal(18,2)");

            builder.Property(t => t.Description)
                .HasMaxLength(1000);

            builder.Property(t => t.PropertyId)
                .IsRequired(false);

            builder.Property(t => t.LeaseId)
                .IsRequired(false);

            builder.Property(t => t.ContactId)
                .IsRequired();

            builder.Property(t => t.CompanyId)
                .IsRequired();

            builder.Property(t => t.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            // Relationships
            builder.HasOne(t => t.Property)
                .WithMany()
                .HasForeignKey(t => t.PropertyId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            builder.HasOne(t => t.Contact)
                .WithMany()
                .HasForeignKey(t => t.ContactId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(t => t.Lease)
                .WithMany()
                .HasForeignKey(t => t.LeaseId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            builder.HasOne(t => t.Company)
                .WithMany()
                .HasForeignKey(t => t.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(t => t.Attachments)
                .WithOne(a => a.Transaction)
                .HasForeignKey(a => a.TransactionId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

