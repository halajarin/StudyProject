using Xunit;
using Microsoft.EntityFrameworkCore;
using EcoRide.Backend.Data;
using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Tests.Repositories;

public class UtilisateurRepositoryTests : IDisposable
{
    private readonly EcoRideContext _context;
    private readonly UtilisateurRepository _repository;

    public UtilisateurRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<EcoRideContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new EcoRideContext(options);
        _repository = new UtilisateurRepository(_context);

        SeedDatabase();
    }

    private void SeedDatabase()
    {
        var roles = new List<Role>
        {
            new Role { RoleId = 1, Libelle = "Passager" },
            new Role { RoleId = 2, Libelle = "Chauffeur" }
        };

        var utilisateurs = new List<Utilisateur>
        {
            new Utilisateur
            {
                UtilisateurId = 1,
                Pseudo = "User1",
                Email = "user1@test.com",
                MotDePasse = "hash1",
                Credit = 100,
                DateInscription = DateTime.UtcNow
            },
            new Utilisateur
            {
                UtilisateurId = 2,
                Pseudo = "User2",
                Email = "user2@test.com",
                MotDePasse = "hash2",
                Credit = 50,
                DateInscription = DateTime.UtcNow
            }
        };

        var avis = new List<Avis>
        {
            new Avis
            {
                AvisId = 1,
                Note = 5,
                Commentaire = "Excellent",
                UtilisateurAuteurId = 2,
                UtilisateurCibleId = 1,
                Statut = "Validé",
                DateCreation = DateTime.UtcNow
            },
            new Avis
            {
                AvisId = 2,
                Note = 4,
                Commentaire = "Très bien",
                UtilisateurAuteurId = 2,
                UtilisateurCibleId = 1,
                Statut = "Validé",
                DateCreation = DateTime.UtcNow
            }
        };

        _context.Roles.AddRange(roles);
        _context.Utilisateurs.AddRange(utilisateurs);
        _context.Avis.AddRange(avis);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetByIdAsync_ExistingUser_ReturnsUser()
    {
        // Act
        var result = await _repository.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("User1", result.Pseudo);
        Assert.Equal("user1@test.com", result.Email);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingUser_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByEmailAsync_ExistingEmail_ReturnsUser()
    {
        // Act
        var result = await _repository.GetByEmailAsync("user1@test.com");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.UtilisateurId);
        Assert.Equal("User1", result.Pseudo);
    }

    [Fact]
    public async Task GetByEmailAsync_NonExistingEmail_ReturnsNull()
    {
        // Act
        var result = await _repository.GetByEmailAsync("nonexistent@test.com");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetByPseudoAsync_ExistingPseudo_ReturnsUser()
    {
        // Act
        var result = await _repository.GetByPseudoAsync("User1");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.UtilisateurId);
        Assert.Equal("user1@test.com", result.Email);
    }

    [Fact]
    public async Task CreateAsync_NewUser_ReturnsCreatedUser()
    {
        // Arrange
        var newUser = new Utilisateur
        {
            Pseudo = "NewUser",
            Email = "newuser@test.com",
            MotDePasse = "hash",
            Credit = 100,
            DateInscription = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateAsync(newUser);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.UtilisateurId > 0);
        Assert.Equal("NewUser", result.Pseudo);

        // Verify it's in the database
        var fromDb = await _repository.GetByEmailAsync("newuser@test.com");
        Assert.NotNull(fromDb);
    }

    [Fact]
    public async Task UpdateAsync_ExistingUser_ReturnsUpdatedUser()
    {
        // Arrange
        var user = await _repository.GetByIdAsync(1);
        Assert.NotNull(user);
        user.Credit = 200;

        // Act
        var result = await _repository.UpdateAsync(user);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(200, result.Credit);

        // Verify in database
        var fromDb = await _repository.GetByIdAsync(1);
        Assert.Equal(200, fromDb?.Credit);
    }

    [Fact]
    public async Task GetAverageRatingAsync_UserWithRatings_ReturnsAverageRating()
    {
        // User1 has two ratings: 5 and 4, average = 4.5
        // Act
        var result = await _repository.GetAverageRatingAsync(1);

        // Assert
        Assert.Equal(4.5, result);
    }

    [Fact]
    public async Task GetAverageRatingAsync_UserWithoutRatings_ReturnsZero()
    {
        // User2 has no ratings
        // Act
        var result = await _repository.GetAverageRatingAsync(2);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public async Task AddRoleAsync_ValidRole_AddsRoleToUser()
    {
        // Arrange
        var user = await _repository.GetByIdAsync(1);
        Assert.NotNull(user);

        // Act
        await _repository.AddRoleAsync(1, 2); // Add Chauffeur role

        // Assert
        var updatedUser = await _context.Utilisateurs
            .Include(u => u.UtilisateurRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UtilisateurId == 1);

        Assert.NotNull(updatedUser);
        Assert.Contains(updatedUser.UtilisateurRoles, ur => ur.RoleId == 2);
    }

    [Fact]
    public async Task HasRoleAsync_UserHasRole_ReturnsTrue()
    {
        // Arrange - Add a role first
        await _repository.AddRoleAsync(1, 2);

        // Act
        var result = await _repository.HasRoleAsync(1, 2);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task HasRoleAsync_UserDoesNotHaveRole_ReturnsFalse()
    {
        // Act
        var result = await _repository.HasRoleAsync(1, 2);

        // Assert
        Assert.False(result);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
