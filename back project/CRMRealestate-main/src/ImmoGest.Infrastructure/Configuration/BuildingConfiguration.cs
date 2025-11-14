using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ImmoGest.Infrastructure.Configuration
{
    public class BuildingConfiguration : IEntityTypeConfiguration<Building>
    {
        public void Configure(EntityTypeBuilder<Building> builder)
        {
            builder.HasKey(b => b.Id);

            builder.Property(b => b.Name)
                .HasMaxLength(200);

            builder.Property(b => b.Address)
                .HasMaxLength(500);

            builder.Property(b => b.City)
                .HasMaxLength(100);

            builder.Property(b => b.Description)
                .HasMaxLength(1000);

            builder.Property(b => b.Construction)
                .IsRequired();

            builder.Property(b => b.Year)
                .IsRequired();

            builder.Property(b => b.Floor)
                .IsRequired();

            builder.HasOne(b => b.Company)
                .WithMany()
                .HasForeignKey(b => b.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.DefaultAttachment)
                .WithMany()
                .HasForeignKey(b => b.DefaultAttachmentId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(b => b.Properties)
                .WithOne(p => p.Building)
                .HasForeignKey(p => p.BuildingId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}


