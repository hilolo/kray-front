using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Core.Entities;
using ImmoGest.Infrastructure.Configuration;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ImmoGest.Infrastructure.Context
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }
        
        public DbSet<Hero> Heroes { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<Building> Buildings { get; set; }
        public DbSet<Lease> Leases { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Attachment> Attachments { get; set; }
        public DbSet<NavigationItem> NavigationItems { get; set; }
        public DbSet<Settings> Settings { get; set; }
        public DbSet<Key> Keys { get; set; }
        public DbSet<Bank> Banks { get; set; }
        public DbSet<Maintenance> Maintenances { get; set; }
        public DbSet<UserPermissions> UserPermissions { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<Transaction> Transactions { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Update LastModifiedOn for all modified entities with UTC timestamp
            var modifiedEntries = ChangeTracker.Entries<Entity>()
                .Where(e => e.State == EntityState.Modified);

            foreach (var entry in modifiedEntries)
            {
                entry.Entity.LastModifiedOn = DateTimeOffset.UtcNow;
            }

            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new UserConfiguration());
            modelBuilder.ApplyConfiguration(new CompanyConfiguration());
            modelBuilder.ApplyConfiguration(new PropertyConfiguration());
            modelBuilder.ApplyConfiguration(new BuildingConfiguration());
            modelBuilder.ApplyConfiguration(new LeaseConfiguration());
            modelBuilder.ApplyConfiguration(new ReservationConfiguration());
            modelBuilder.ApplyConfiguration(new ContactConfiguration());
            modelBuilder.ApplyConfiguration(new AttachmentConfiguration());
            modelBuilder.ApplyConfiguration(new NavigationConfiguration());
            modelBuilder.ApplyConfiguration(new SettingsConfiguration());
            modelBuilder.ApplyConfiguration(new KeyConfiguration());
            modelBuilder.ApplyConfiguration(new BankConfiguration());
            modelBuilder.ApplyConfiguration(new MaintenanceConfiguration());
            modelBuilder.ApplyConfiguration(new UserPermissionsConfiguration());
            modelBuilder.ApplyConfiguration(new TaskConfiguration());
            modelBuilder.ApplyConfiguration(new TransactionConfiguration());
        }
    }
}

