using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ImmoGest.Infrastructure.Configuration
{
    public class MaintenanceConfiguration : IEntityTypeConfiguration<Maintenance>
    {
        public void Configure(EntityTypeBuilder<Maintenance> builder)
        {
            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(m => m.Id);

            builder.Property(m => m.Subject)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(m => m.Description)
                .HasMaxLength(2000);

            builder.Property(m => m.Priority)
                .IsRequired();

            builder.Property(m => m.Status)
                .IsRequired();

            builder.Property(m => m.ScheduledDateTime)
                .IsRequired();

            builder.Property(m => m.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            // Foreign key relationships
            builder.HasOne(m => m.Property)
                .WithMany(p => p.Maintenances)
                .HasForeignKey(m => m.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(m => m.Company)
                .WithMany()
                .HasForeignKey(m => m.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(m => m.Contact)
                .WithMany()
                .HasForeignKey(m => m.ContactId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes for better query performance
            builder.HasIndex(m => m.PropertyId);
            builder.HasIndex(m => m.CompanyId);
            builder.HasIndex(m => m.ContactId);
            builder.HasIndex(m => m.Status);
            builder.HasIndex(m => m.ScheduledDateTime);
        }
    }
}

