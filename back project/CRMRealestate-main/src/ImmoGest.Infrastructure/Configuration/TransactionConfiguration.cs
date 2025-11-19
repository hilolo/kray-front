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
    public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
    {
        public void Configure(EntityTypeBuilder<Transaction> builder)
        {
            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(t => t.Id);

            // Configure Category enum as string
            var categoryConverter = new ValueConverter<TransactionCategory, string>(
                v => v.ToString(),
                v => Enum.Parse<TransactionCategory>(v)
            );
            builder.Property(t => t.Category)
                .IsRequired()
                .HasMaxLength(50)
                .HasConversion(categoryConverter);

            // Configure RevenueType enum as string
            var revenueTypeConverter = new ValueConverter<RevenueType?, string>(
                v => v.HasValue ? v.Value.ToString() : null,
                v => string.IsNullOrEmpty(v) ? (RevenueType?)null : Enum.Parse<RevenueType>(v)
            );
            builder.Property(t => t.RevenueType)
                .IsRequired(false)
                .HasMaxLength(50)
                .HasConversion(revenueTypeConverter);

            // Configure ExpenseType enum as string
            var expenseTypeConverter = new ValueConverter<ExpenseType?, string>(
                v => v.HasValue ? v.Value.ToString() : null,
                v => string.IsNullOrEmpty(v) ? (ExpenseType?)null : Enum.Parse<ExpenseType>(v)
            );
            builder.Property(t => t.ExpenseType)
                .IsRequired(false)
                .HasMaxLength(50)
                .HasConversion(expenseTypeConverter);

            // Configure TransactionType enum as string
            var transactionTypeConverter = new ValueConverter<TransactionType, string>(
                v => v.ToString(),
                v => Enum.Parse<TransactionType>(v)
            );
            builder.Property(t => t.TransactionType)
                .IsRequired()
                .HasMaxLength(50)
                .HasConversion(transactionTypeConverter);

            // Configure Status enum as string
            var statusConverter = new ValueConverter<TransactionStatus, string>(
                v => v.ToString(),
                v => Enum.Parse<TransactionStatus>(v)
            );
            builder.Property(t => t.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasConversion(statusConverter);

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

            builder.Property(t => t.DepositPrice)
                .IsRequired(false)
                .HasColumnType("decimal(18,2)");

            builder.Property(t => t.Description)
                .HasMaxLength(1000);

            builder.Property(t => t.PropertyId)
                .IsRequired(false);

            builder.Property(t => t.LeaseId)
                .IsRequired(false);

            builder.Property(t => t.ContactId)
                .IsRequired(false);

            builder.Property(t => t.OtherContactName)
                .HasMaxLength(500)
                .IsRequired(false);

            builder.Property(t => t.ReservationId)
                .IsRequired(false);

            builder.Property(t => t.CompanyId)
                .IsRequired();

            builder.Property(t => t.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            // Relationships
            builder.HasOne(t => t.Property)
                .WithMany(p => p.Transactions)
                .HasForeignKey(t => t.PropertyId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            builder.HasOne(t => t.Contact)
                .WithMany(c => c.Transactions)
                .HasForeignKey(t => t.ContactId)
                .OnDelete(DeleteBehavior.Restrict)
                .IsRequired(false);

            builder.HasOne(t => t.Lease)
                .WithMany(l => l.Transactions)
                .HasForeignKey(t => t.LeaseId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false);

            builder.HasOne(t => t.Reservation)
                .WithMany()
                .HasForeignKey(t => t.ReservationId)
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

