using ImmoGest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;

namespace ImmoGest.Infrastructure.Configuration
{
    public class NavigationConfiguration : IEntityTypeConfiguration<NavigationItem>
    {
        public void Configure(EntityTypeBuilder<NavigationItem> builder)
        {
            builder.HasQueryFilter(x => !x.IsDeleted);

            builder.HasKey(x => x.Id);


            builder.Property(x => x.ItemId)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(x => x.Title)
                .IsRequired()
                .HasMaxLength(200);

            builder.Property(x => x.TitleEn)
                .HasMaxLength(200);

            builder.Property(x => x.TitleFr)
                .HasMaxLength(200);

            builder.Property(x => x.Type)
                .HasMaxLength(50);

            builder.Property(x => x.Icon)
                .HasMaxLength(100);

            builder.Property(x => x.Link)
                .HasMaxLength(500);

            builder.Property(x => x.Order)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(x => x.IsActive)
                .IsRequired()
                .HasDefaultValue(true);

            builder.Property(x => x.IsDeleted)
                .IsRequired()
                .HasDefaultValue(false);


            // Self-referencing relationship
            builder.HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            builder.HasIndex(x => x.ItemId);
            builder.HasIndex(x => x.Order);

            // Seed data with proper GUID generation - Only modules that are implemented
            var contactsId = Guid.NewGuid();
            
            builder.HasData(
                // Dashboard
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "dashboard",
                    Title = "Dashboard",
                    TitleEn = "Dashboard",
                    TitleFr = "Tableau de bord",
                    Type = "basic",
                    Icon = "heroicons_outline:home",
                    Link = "/dashboard",
                    Order = 1,
                    IsActive = true,
                    IsDeleted = false
                },
                // Contacts & Connections (with children)
                new NavigationItem
                {
                    Id = contactsId,
                    ItemId = "contacts",
                    Title = "Contacts",
                    TitleEn = "Contacts",
                    TitleFr = "Contacts",
                    Type = "collapsible",
                    Icon = "heroicons_outline:user-group",
                    Link = null,
                    Order = 2,
                    IsActive = true,
                    IsDeleted = false
                },
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "tenants",
                    Title = "Tenants",
                    TitleEn = "Tenants",
                    TitleFr = "Locataires",
                    Type = "basic",
                    Icon = "heroicons_outline:user",
                    Link = "/contacts/tenants",
                    ParentId = contactsId,
                    Order = 1,
                    IsActive = true,
                    IsDeleted = false
                },
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "owners",
                    Title = "Owners",
                    TitleEn = "Owners",
                    TitleFr = "Propriétaires",
                    Type = "basic",
                    Icon = "heroicons_outline:user-circle",
                    Link = "/contacts/owners",
                    ParentId = contactsId,
                    Order = 2,
                    IsActive = true,
                    IsDeleted = false
                },
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "service-pros",
                    Title = "Service Providers",
                    TitleEn = "Service Providers",
                    TitleFr = "Fournisseurs de services",
                    Type = "basic",
                    Icon = "heroicons_outline:wrench-screwdriver",
                    Link = "/contacts/service-pros",
                    ParentId = contactsId,
                    Order = 3,
                    IsActive = true,
                    IsDeleted = false
                },
                // Properties
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "properties",
                    Title = "Properties",
                    TitleEn = "Properties",
                    TitleFr = "Propriétés",
                    Type = "basic",
                    Icon = "heroicons_outline:building-office-2",
                    Link = "/property",
                    Order = 3,
                    IsActive = true,
                    IsDeleted = false
                },
                // Buildings
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "buildings",
                    Title = "Buildings",
                    TitleEn = "Buildings",
                    TitleFr = "Bâtiments",
                    Type = "basic",
                    Icon = "heroicons_outline:building-office",
                    Link = "/building",
                    Order = 4,
                    IsActive = true,
                    IsDeleted = false
                },
                // Keys
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "keys",
                    Title = "Keys",
                    TitleEn = "Keys",
                    TitleFr = "Clés",
                    Type = "basic",
                    Icon = "heroicons_outline:key",
                    Link = "/keys",
                    Order = 5,
                    IsActive = true,
                    IsDeleted = false
                },
                // Leasing
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "leasing",
                    Title = "Leasing",
                    TitleEn = "Leasing",
                    TitleFr = "Location",
                    Type = "basic",
                    Icon = "heroicons_outline:document-text",
                    Link = "/leasing",
                    Order = 6,
                    IsActive = true,
                    IsDeleted = false
                },
                // Reservations
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "reservations",
                    Title = "Reservations",
                    TitleEn = "Reservations",
                    TitleFr = "Réservations",
                    Type = "basic",
                    Icon = "heroicons_outline:calendar",
                    Link = "/reservation",
                    Order = 7,
                    IsActive = true,
                    IsDeleted = false
                },
                // File Manager
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "file-manager",
                    Title = "File Manager",
                    TitleEn = "File Manager",
                    TitleFr = "Gestionnaire de fichiers",
                    Type = "basic",
                    Icon = "heroicons_outline:folder",
                    Link = "/gestionnaire-fichiers",
                    Order = 8,
                    IsActive = true,
                    IsDeleted = false
                },
                // Settings
                new NavigationItem
                {
                    Id = Guid.NewGuid(),
                    ItemId = "settings",
                    Title = "Settings",
                    TitleEn = "Settings",
                    TitleFr = "Paramètres",
                    Type = "basic",
                    Icon = "heroicons_outline:cog-6-tooth",
                    Link = "/settings",
                    Order = 9,
                    IsActive = true,
                    IsDeleted = false
                }
            );
        }
    }
}
