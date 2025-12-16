using Xunit;
using Microsoft.EntityFrameworkCore;
using EcoRide.Backend.Data;
using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Tests.Repositories;

public class UserRepositoryTests : IDisposable
{
    private readonly EcoRideContext _context;
    private readonly UserRepository _repository;

    public UserRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<EcoRideContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new EcoRideContext(options);
        _repository = new UserRepository(_context);

        SeedDatabase();
    }

    private void SeedDatabase()
    {
        var roles = new List<Role>
        {
            new Role { RoleId = 1, Name = "Passenger" },
            new Role { RoleId = 2, Name = "Driver" }
        };

        var users = new List<User>
        {
            new User
            {
                UserId = 1,
                Username = "User1",
                Email = "user1@test.com",
                Password = "hash1",
                Credits = 100,
                RegistrationDate = DateTime.UtcNow
            },
            new User
            {
                UserId = 2,
                Username = "User2",
                Email = "user2@test.com",
                Password = "hash2",
                Credits = 50,
                RegistrationDate = DateTime.UtcNow
            }
        };

        var reviews = new List<Review>
        {
            new Review
            {
                ReviewId = 1,
                Rating = 5,
                Comment = "Excellent",
                AuthorUserId = 2,
                TargetUserId = 1,
                Status = "Validated",
                CreatedDate = DateTime.UtcNow
            },
            new Review
            {
                ReviewId = 2,
                Rating = 4,
                Comment = "Very good",
                AuthorUserId = 2,
                TargetUserId = 1,
                Status = "Validated",
                CreatedDate = DateTime.UtcNow
            }
        };

        _context.Roles.AddRange(roles);
        _context.Users.AddRange(users);
        _context.Reviews.AddRange(reviews);
        _context.SaveChanges();
    }

    [Fact]
    public async Task GetByIdAsync_ExistingUser_ReturnsUser()
    {
        // Act
        var result = await _repository.GetByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("User1", result.Username);
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
        Assert.Equal(1, result.UserId);
        Assert.Equal("User1", result.Username);
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
    public async Task GetByUsernameAsync_ExistingUsername_ReturnsUser()
    {
        // Act
        var result = await _repository.GetByUsernameAsync("User1");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result.UserId);
        Assert.Equal("user1@test.com", result.Email);
    }

    [Fact]
    public async Task CreateAsync_NewUser_ReturnsCreatedUser()
    {
        // Arrange
        var newUser = new User
        {
            Username = "NewUser",
            Email = "newuser@test.com",
            Password = "hash",
            Credits = 100,
            RegistrationDate = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateAsync(newUser);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.UserId > 0);
        Assert.Equal("NewUser", result.Username);

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
        user.Credits = 200;

        // Act
        var result = await _repository.UpdateAsync(user);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(200, result.Credits);

        // Verify in database
        var fromDb = await _repository.GetByIdAsync(1);
        Assert.Equal(200, fromDb?.Credits);
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
        await _repository.AddRoleAsync(1, 2); // Add Driver role

        // Assert
        var updatedUser = await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserId == 1);

        Assert.NotNull(updatedUser);
        Assert.Contains(updatedUser.UserRoles, ur => ur.RoleId == 2);
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
