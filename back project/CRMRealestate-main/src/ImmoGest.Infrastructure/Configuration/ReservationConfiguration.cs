using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ImmoGest.Infrastructure.Configuration
{
    public class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
    {
        public void Configure(EntityTypeBuilder<Reservation> builder)
        {
            // Add query filter to exclude soft-deleted reservations
            builder.HasQueryFilter(x => !x.IsDeleted);
            
            builder.HasKey(v => v.Id);

            // Reservation Information
            builder.Property(v => v.StartDate)
                .IsRequired();

            builder.Property(v => v.EndDate)
                .IsRequired();

            builder.Property(v => v.DurationDays)
                .IsRequired();

            builder.Property(v => v.RequestDate)
                .IsRequired();

            // Request Information
            builder.Property(v => v.Reason)
                .HasMaxLength(500);

            builder.Property(v => v.Description)
                .HasMaxLength(2000);

            // Status
            builder.Property(v => v.Status)
                .IsRequired();

            // Approval Information
            builder.Property(v => v.ApprovalNotes)
                .HasMaxLength(2000);

            // Additional Information
            builder.Property(v => v.PrivateNote)
                .HasMaxLength(2000);

            builder.Property(v => v.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(v => v.ContactId)
                .IsRequired();

            builder.Property(v => v.PropertyId)
                .IsRequired();

            builder.Property(v => v.CompanyId)
                .IsRequired();

            // Relationships
            builder.HasOne(v => v.Contact)
                .WithMany()
                .HasForeignKey(v => v.ContactId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Property)
                .WithMany()
                .HasForeignKey(v => v.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(v => v.Company)
                .WithMany()
                .HasForeignKey(v => v.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            // Attachments relationship will be handled in AttachmentConfiguration
        }
    }
}

