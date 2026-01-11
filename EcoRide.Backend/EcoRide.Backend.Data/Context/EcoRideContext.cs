using EcoRide.Backend.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace EcoRide.Backend.Data.Context;

public class EcoRideContext : DbContext
{
    public EcoRideContext(DbContextOptions<EcoRideContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<Carpool> Carpools { get; set; }
    public DbSet<CarpoolParticipation> CarpoolParticipations { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure all DateTime properties to use UTC
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.ClrType == typeof(DateTime) || property.ClrType == typeof(DateTime?))
                {
                    property.SetValueConverter(
                        new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<
                            DateTime,
                            DateTime
                        >(
                            v => DateTime.SpecifyKind(v, DateTimeKind.Utc),
                            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
                        )
                    );
                }
            }
        }

        // Configure enum to string conversion for PostgreSQL VARCHAR columns
        modelBuilder.Entity<Carpool>().Property(c => c.Status).HasConversion<string>();

        modelBuilder.Entity<CarpoolParticipation>().Property(p => p.Status).HasConversion<string>();

        modelBuilder.Entity<Review>().Property(r => r.Status).HasConversion<string>();

        modelBuilder.Entity<Vehicle>().Property(v => v.EnergyType).HasConversion<string>();

        // Relationship configuration
        modelBuilder
            .Entity<User>()
            .HasMany(u => u.ReviewsGiven)
            .WithOne(a => a.Author)
            .HasForeignKey(a => a.AuthorUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<User>()
            .HasMany(u => u.ReviewsReceived)
            .WithOne(a => a.Target)
            .HasForeignKey(a => a.TargetUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder
            .Entity<Carpool>()
            .HasOne(c => c.Driver)
            .WithMany(u => u.CarpoolsCreated)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes to improve performance
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();

        modelBuilder
            .Entity<Carpool>()
            .HasIndex(c => new
            {
                c.DepartureCity,
                c.ArrivalCity,
                c.DepartureDate,
            });

        modelBuilder.Entity<Vehicle>().HasIndex(v => v.RegistrationNumber).IsUnique();

        // Seed default roles
        modelBuilder
            .Entity<Role>()
            .HasData(
                new Role { RoleId = 1, Label = "Passenger" },
                new Role { RoleId = 2, Label = "Driver" },
                new Role { RoleId = 3, Label = "Employee" },
                new Role { RoleId = 4, Label = "Administrator" }
            );

        // Seed popular brands
        modelBuilder
            .Entity<Brand>()
            .HasData(
                new Brand { BrandId = 1, Label = "Renault" },
                new Brand { BrandId = 2, Label = "Peugeot" },
                new Brand { BrandId = 3, Label = "Citroën" },
                new Brand { BrandId = 4, Label = "Tesla" },
                new Brand { BrandId = 5, Label = "Volkswagen" },
                new Brand { BrandId = 6, Label = "Toyota" },
                new Brand { BrandId = 7, Label = "BMW" },
                new Brand { BrandId = 8, Label = "Mercedes" }
            );
    }
}
