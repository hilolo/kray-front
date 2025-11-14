using System;
using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ImmoGest.Infrastructure.Configuration
{
    public class UserPermissionsConfiguration : IEntityTypeConfiguration<UserPermissions>
    {
        public void Configure(EntityTypeBuilder<UserPermissions> builder)
        {
            builder.HasKey(x => x.Id);

            builder.Property(x => x.UserId)
                .IsRequired();

            builder.Property(x => x.PermissionsJson)
                .IsRequired()
                .HasColumnType("json");

            // Configure relationship with User
            builder.HasOne(up => up.User)
                .WithMany()
                .HasForeignKey(up => up.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Create unique index on UserId to ensure one permission record per user
            builder.HasIndex(x => x.UserId).IsUnique();

            // Seed default permissions for admin user
            builder.HasData(
                new UserPermissions
                {
                    Id = new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c1"),
                    UserId = new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c1"), // Admin user
                    PermissionsJson = @"{
                        ""dashboard"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""properties"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""buildings"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""leasing"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""reservations"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""maintenance"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""contacts"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""keys"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""banks"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""payments"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""file-manager"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""reports"": {""view"": true, ""edit"": true, ""delete"": true},
                        ""settings"": {""view"": true, ""edit"": true, ""delete"": true}
                    }",
                    CreatedOn = DateTimeOffset.UtcNow
                },
                new UserPermissions
                {
                    Id = new Guid("787d9fd5-2752-4a96-93d5-0f33a49913c2"),
                    UserId = new Guid("687d9fd5-2752-4a96-93d5-0f33a49913c2"), // Regular user
                    PermissionsJson = @"{
                        ""dashboard"": {""view"": true, ""edit"": false, ""delete"": false},
                        ""properties"": {""view"": true, ""edit"": false, ""delete"": false},
                        ""buildings"": {""view"": true, ""edit"": false, ""delete"": false},
                        ""leasing"": {""view"": true, ""edit"": false, ""delete"": false},
                        ""reservations"": {""view"": true, ""edit"": false, ""delete"": false},
                        ""maintenance"": {""view"": true, ""edit"": false, ""delete"": false},
                        ""contacts"": {""view"": true, ""edit"": false, ""delete"": false},
                        ""keys"": {""view"": false, ""edit"": false, ""delete"": false},
                        ""banks"": {""view"": false, ""edit"": false, ""delete"": false},
                        ""payments"": {""view"": true, ""edit"": false, ""delete"": false},
                        ""file-manager"": {""view"": true, ""edit"": false, ""delete"": false},
                        ""reports"": {""view"": false, ""edit"": false, ""delete"": false},
                        ""settings"": {""view"": false, ""edit"": false, ""delete"": false}
                    }",
                    CreatedOn = DateTimeOffset.UtcNow
                }
            );
        }
    }
}


