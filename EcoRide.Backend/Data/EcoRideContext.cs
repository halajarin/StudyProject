using Microsoft.EntityFrameworkCore;
using EcoRide.Backend.Models;

namespace EcoRide.Backend.Data;

public class EcoRideContext : DbContext
{
    public EcoRideContext(DbContextOptions<EcoRideContext> options) : base(options)
    {
    }

    public DbSet<Utilisateur> Utilisateurs { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UtilisateurRole> UtilisateurRoles { get; set; }
    public DbSet<Voiture> Voitures { get; set; }
    public DbSet<Marque> Marques { get; set; }
    public DbSet<Covoiturage> Covoiturages { get; set; }
    public DbSet<CovoiturageParticipation> CovoiturageParticipations { get; set; }
    public DbSet<Avis> Avis { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuration des relations
        modelBuilder.Entity<Utilisateur>()
            .HasMany(u => u.AvisDonnés)
            .WithOne(a => a.UtilisateurAuteur)
            .HasForeignKey(a => a.UtilisateurAuteurId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Utilisateur>()
            .HasMany(u => u.AvisReçus)
            .WithOne(a => a.UtilisateurCible)
            .HasForeignKey(a => a.UtilisateurCibleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Covoiturage>()
            .HasOne(c => c.Chauffeur)
            .WithMany(u => u.CovoituragesCreés)
            .HasForeignKey(c => c.UtilisateurId)
            .OnDelete(DeleteBehavior.Restrict);

        // Index pour améliorer les performances
        modelBuilder.Entity<Utilisateur>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Utilisateur>()
            .HasIndex(u => u.Pseudo)
            .IsUnique();

        modelBuilder.Entity<Covoiturage>()
            .HasIndex(c => new { c.VilleDepart, c.VilleArrivee, c.DateDepart });

        modelBuilder.Entity<Voiture>()
            .HasIndex(v => v.Immatriculation)
            .IsUnique();

        // Seed des rôles par défaut
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, Libelle = RoleConstants.Passager },
            new Role { RoleId = 2, Libelle = RoleConstants.Chauffeur },
            new Role { RoleId = 3, Libelle = RoleConstants.Employe },
            new Role { RoleId = 4, Libelle = RoleConstants.Administrateur }
        );

        // Seed des marques populaires
        modelBuilder.Entity<Marque>().HasData(
            new Marque { MarqueId = 1, Libelle = "Renault" },
            new Marque { MarqueId = 2, Libelle = "Peugeot" },
            new Marque { MarqueId = 3, Libelle = "Citroën" },
            new Marque { MarqueId = 4, Libelle = "Tesla" },
            new Marque { MarqueId = 5, Libelle = "Volkswagen" },
            new Marque { MarqueId = 6, Libelle = "Toyota" },
            new Marque { MarqueId = 7, Libelle = "BMW" },
            new Marque { MarqueId = 8, Libelle = "Mercedes" }
        );
    }
}
