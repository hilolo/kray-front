using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Infrastructure.Configuration
{
    public class CompanyConfiguration : IEntityTypeConfiguration<Company>
    {
        public void Configure(EntityTypeBuilder<Company> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.Name)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(254);
            builder.HasIndex(x => x.Email).IsUnique();

            builder.Property(x => x.Phone)
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(x => x.Website)
                .HasMaxLength(200);

            builder.Property(x => x.Address)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(x => x.City)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Rc)
                .HasMaxLength(50);

            builder.Property(x => x.Ice)
                .HasMaxLength(50);

            builder.Property(x => x.Image)
                .HasMaxLength(500);

            builder.Property(x => x.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);

            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasData(
               new Company
               {
                   Id = new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                   Name = "IMMOSYNCPRO",
                   Email = "contact@immosyncpro.com",
                   Phone = "0605934495",
                   Website = "www.immosyncpro.com",
                   Address = "bassatine",
                   City = "tanger",
                   Rc = "41414111",
                   Ice = "51259111"
               }
           );
        }
    }
}
