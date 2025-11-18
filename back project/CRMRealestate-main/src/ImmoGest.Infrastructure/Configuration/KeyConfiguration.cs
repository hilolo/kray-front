using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ImmoGest.Infrastructure.Configuration
{
    public class KeyConfiguration : IEntityTypeConfiguration<Key>
    {
        public void Configure(EntityTypeBuilder<Key> builder)
        {
            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(k => k.Id);

            builder.Property(k => k.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(k => k.Description)
                .HasMaxLength(1000);

            builder.Property(k => k.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.HasOne(k => k.Property)
                .WithMany(p => p.Keys)
                .HasForeignKey(k => k.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);
            
            builder.HasOne(k => k.DefaultAttachment)
                .WithMany()
                .HasForeignKey(k => k.DefaultAttachmentId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}

