using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ImmoGest.Infrastructure.Configuration
{
    public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
    {
        public void Configure(EntityTypeBuilder<Attachment> builder)
        {
            builder.ToTable("Attachments");
            
            // Add query filter to exclude soft-deleted attachments
            builder.HasQueryFilter(x => !x.IsDeleted);
            
            builder.HasKey(a => a.Id);
            
            builder.Property(a => a.FileName)
                .IsRequired()
                .HasMaxLength(255);
            
            builder.Property(a => a.FileExtension)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(a => a.Root)
                .HasMaxLength(255);
            
            builder.Property(a => a.StorageHash)
                .IsRequired()
                .HasMaxLength(100);
            
            builder.HasIndex(a => a.StorageHash)
                .HasDatabaseName("IX_Attachments_StorageHash");
            
            builder.Property(a => a.CompanyId)
                .IsRequired();
            
            builder.Property(a => a.Url)
                .HasMaxLength(2000);  // URLs can be long, especially presigned URLs
            
            builder.Property(a => a.UrlExpiresAt)
                .IsRequired(false);
            
            builder.HasOne(a => a.Contact)
                .WithMany(c => c.Attachments)
                .HasForeignKey(a => a.ContactId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false); // ContactId is now optional for generic use
            
            builder.HasOne(a => a.Property)
                .WithMany()
                .HasForeignKey(a => a.PropertyId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false); // PropertyId is now optional for generic use
            
            builder.HasOne(a => a.Lease)
                .WithMany(l => l.Attachments)
                .HasForeignKey(a => a.LeaseId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false); // LeaseId is now optional for generic use
            
            builder.HasOne(a => a.Reservation)
                .WithMany(r => r.Attachments)
                .HasForeignKey(a => a.ReservationId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false); // ReservationId is now optional for generic use
            
            builder.HasOne(a => a.Key)
                .WithMany()
                .HasForeignKey(a => a.KeyId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false); // KeyId is now optional for generic use

            builder.HasOne(a => a.Transaction)
                .WithMany(t => t.Attachments)
                .HasForeignKey(a => a.TransactionId)
                .OnDelete(DeleteBehavior.SetNull)
                .IsRequired(false); // TransactionId is now optional for generic use
        }
    }
}

