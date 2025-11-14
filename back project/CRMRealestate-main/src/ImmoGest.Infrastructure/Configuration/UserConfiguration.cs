using System;
using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BC = BCrypt.Net.BCrypt;

namespace ImmoGest.Infrastructure.Configuration
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {

            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(x => x.Id);

            builder.Property(x => x.Email)
                .IsRequired()
                .HasMaxLength(254);
            builder.HasIndex(x => x.Email).IsUnique();

            builder.Property(x => x.Password)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Role)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(x => x.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);


            // Configure relationship with Company
            builder.HasOne(t => t.Company)
               .WithMany()
               .HasForeignKey(t => t.CompanyId)
               .OnDelete(DeleteBehavior.Restrict);

            builder.HasData(
                new User
                {
                    Id = new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"),
                    Email = "admin@admin.com",
                    Role = "Admin",
                    Password = BC.HashPassword("admin"),
                    CompanyId = new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1")
                },
                new User
                {
                    Id = new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"),
                    Email = "user@boilerplate.com",
                    Role = "User",
                    Password = BC.HashPassword("admin"),
                    CompanyId = new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1")
                }
            );
        }
    }
}
