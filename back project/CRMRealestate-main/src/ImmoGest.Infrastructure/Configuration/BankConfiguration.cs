using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ImmoGest.Infrastructure.Configuration
{
    public class BankConfiguration : IEntityTypeConfiguration<Bank>
    {
        public void Configure(EntityTypeBuilder<Bank> builder)
        {
            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(b => b.Id);

            builder.Property(b => b.CompanyId)
                .IsRequired();

            builder.Property(b => b.ContactId)
                .IsRequired();

            builder.Property(b => b.BankName)
                .HasMaxLength(200);

            builder.Property(b => b.RIB)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(b => b.IBAN)
                .HasMaxLength(100);

            builder.Property(b => b.Swift)
                .HasMaxLength(50);

            builder.Property(b => b.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.HasOne(b => b.Company)
                .WithMany()
                .HasForeignKey(b => b.CompanyId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Contact)
                .WithMany()
                .HasForeignKey(b => b.ContactId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}

