using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ImmoGest.Infrastructure.Configuration
{
    public class LeaseConfiguration : IEntityTypeConfiguration<Lease>
    {
        public void Configure(EntityTypeBuilder<Lease> builder)
        {
            // Add query filter to exclude soft-deleted leases
            builder.HasQueryFilter(x => !x.IsDeleted);
            
            builder.HasKey(l => l.Id);

            // Tenancy Information
            builder.Property(l => l.TenancyStart)
                .IsRequired();

            builder.Property(l => l.TenancyEnd)
                .IsRequired();

            // Payment Information
            builder.Property(l => l.PaymentType)
                .IsRequired();

            builder.Property(l => l.PaymentMethod)
                .IsRequired();

            builder.Property(l => l.PaymentDate)
                .IsRequired();

            builder.Property(l => l.RentPrice)
                .IsRequired()
                .HasPrecision(18, 2);

            builder.Property(l => l.DepositPrice)
                .IsRequired()
                .HasPrecision(18, 2)
                .HasDefaultValue(0.0);

            // Receipt Information
            builder.Property(l => l.EnableReceipts)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(l => l.NotificationWhatsapp)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(l => l.NotificationEmail)
                .IsRequired()
                .HasDefaultValue(false);

            // Additional Information
            builder.Property(l => l.SpecialTerms)
                .HasMaxLength(2000);

            builder.Property(l => l.PrivateNote)
                .HasMaxLength(2000);

            // Status
            builder.Property(l => l.Status)
                .IsRequired();

            builder.Property(l => l.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(l => l.PropertyId)
                .IsRequired();

            builder.Property(l => l.ContactId)
                .IsRequired();

            builder.Property(l => l.CompanyId)
                .IsRequired();

            // Relationships
            builder.HasOne(l => l.Property)
                .WithMany(p => p.Leases)
                .HasForeignKey(l => l.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.Contact)
                .WithMany()
                .HasForeignKey(l => l.ContactId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(l => l.Company)
                .WithMany()
                .HasForeignKey(l => l.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Attachments relationship will be handled in AttachmentConfiguration
        }
    }
} 