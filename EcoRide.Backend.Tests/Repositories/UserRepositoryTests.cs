using Xunit;
using Microsoft.EntityFrameworkCore;
using EcoRide.Backend.Data.Context;
using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Data.Repositories;
using EcoRide.Backend.Data.Enums;

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
            new Role { RoleId = 1, Label = "Passenger" },
            new Role { RoleId = 2, Label = "Driver" }
        };

        var users = new List<User>
        {
            new User
            {
                UserId = 1,
                Username = "user1",
                Email = "user1@test.com",
                Password = "hash1",
                Credits = 100,
                FirstName = "John",
                LastName = "Doe",
                Phone = "0601020304",
                IsActive = true
            },
            new User
            {
                UserId = 2,
                Username = "user2",
                Email = "user2@test.com",
                Password = "hash2",
                Credits = 50,
                FirstName = "Jane",
                LastName = "Smith",
                Phone = "0605060708",
                IsActive = true
            },
            new User
            {
                UserId = 3,
                Username = "user3",
                Email = "user3@test.com",
                Password = "hash3",
                Credits = 75,
                FirstName = "Bob",
                LastName = "Johnson",
                Phone = "0609101112",
                IsActive = true
            }
        };

        var reviews = new List<Review>
        {
            new Review
            {
                ReviewId = 1,
                Note = 5,
                Comment = "Excellent driver!",
                AuthorUserId = 2,
                TargetUserId = 1,
                Status = ReviewStatus.Validated,
                CreatedAt = DateTime.UtcNow
            },
            new Review
            {
                ReviewId = 2,
                Note = 4,
                Comment = "Very good",
                AuthorUserId = 3,
                TargetUserId = 1,
                Status = ReviewStatus.Validated,
                CreatedAt = DateTime.UtcNow
            },
            new Review
            {
                ReviewId = 3,
                Note = 3,
                Comment = "Okay",
                AuthorUserId = 1,
                TargetUserId = 2,
                Status = ReviewStatus.Pending,
                CreatedAt = DateTime.UtcNow
            },
            new Review
            {
                ReviewId = 4,
                Note = 5,
                Comment = "Great!",
                AuthorUserId = 1,
                TargetUserId = 3,
                Status = ReviewStatus.Validated,
                CreatedAt = DateTime.UtcNow
            },
            new Review
            {
                ReviewId = 5,
                Note = 4,
                Comment = "Good",
                AuthorUserId = 2,
                TargetUserId = 3,
                Status = ReviewStatus.Validated,
                CreatedAt = DateTime.UtcNow
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
        Assert.Equal("user1", result.Username);
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
        Assert.Equal("user1", result.Username);
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
        var result = await _repository.GetByUsernameAsync("user1");

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
            Username = "newuser",
            Email = "newuser@test.com",
            Password = "hash",
            Credits = 100,
            FirstName = "New",
            LastName = "User",
            Phone = "0600000000",
            IsActive = true
        };

        // Act
        var result = await _repository.CreateAsync(newUser);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.UserId > 0);
        Assert.Equal("newuser", result.Username);

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
    public async Task GetAverageRatingAsync_UserWithValidatedRatings_ReturnsAverageRating()
    {
        // User1 has two validated ratings: 5 and 4, average = 4.5
        // Act
        var result = await _repository.GetAverageRatingAsync(1);

        // Assert
        Assert.Equal(4.5, result);
    }

    [Fact]
    public async Task GetAverageRatingAsync_UserWithoutValidatedRatings_ReturnsZero()
    {
        // User2 has one rating but it's Pending, not Validated
        // Act
        var result = await _repository.GetAverageRatingAsync(2);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public async Task GetAverageRatingAsync_UserWithNoRatings_ReturnsZero()
    {
        // Create a user with no ratings
        var newUser = new User
        {
            Username = "noratings",
            Email = "noratings@test.com",
            Password = "hash",
            Credits = 100,
            FirstName = "No",
            LastName = "Ratings",
            Phone = "0600000001",
            IsActive = true
        };
        var created = await _repository.CreateAsync(newUser);

        // Act
        var result = await _repository.GetAverageRatingAsync(created.UserId);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public async Task GetAverageRatingsAsync_MultipleUsers_ReturnsDictionary()
    {
        // Arrange
        var userIds = new List<int> { 1, 2, 3 };

        // Act
        var result = await _repository.GetAverageRatingsAsync(userIds);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4.5, result.GetValueOrDefault(1, 0)); // User1: (5+4)/2 = 4.5
        Assert.Equal(0, result.GetValueOrDefault(2, 0));   // User2: 0 (Pending review doesn't count)
        Assert.Equal(4.5, result.GetValueOrDefault(3, 0)); // User3: (5+4)/2 = 4.5
    }

    [Fact]
    public async Task GetAverageRatingsAsync_EmptyList_ReturnsEmptyDictionary()
    {
        // Arrange
        var userIds = new List<int>();

        // Act
        var result = await _repository.GetAverageRatingsAsync(userIds);

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetAverageRatingsAsync_UsersWithoutRatings_ReturnsOnlyUsersWithRatings()
    {
        // Arrange
        var newUser = new User
        {
            Username = "noratings2",
            Email = "noratings2@test.com",
            Password = "hash",
            Credits = 100,
            FirstName = "No",
            LastName = "Ratings2",
            Phone = "0600000002",
            IsActive = true
        };
        var created = await _repository.CreateAsync(newUser);
        var userIds = new List<int> { 1, created.UserId };

        // Act
        var result = await _repository.GetAverageRatingsAsync(userIds);

        // Assert
        Assert.NotNull(result);
        Assert.Single(result); // Only user1 has ratings
        Assert.Equal(4.5, result.GetValueOrDefault(1, 0));
        Assert.False(result.ContainsKey(created.UserId)); // User without ratings not in dictionary
    }

    [Fact]
    public async Task GetRatingCountAsync_UserWithValidatedRatings_ReturnsCount()
    {
        // User1 has 2 validated ratings
        // Act
        var result = await _repository.GetRatingCountAsync(1);

        // Assert
        Assert.Equal(2, result);
    }

    [Fact]
    public async Task GetRatingCountAsync_UserWithoutRatings_ReturnsZero()
    {
        // User2 has a pending rating (doesn't count)
        // Act
        var result = await _repository.GetRatingCountAsync(2);

        // Assert
        Assert.Equal(0, result);
    }

    [Fact]
    public async Task AddUserRoleAsync_ValidRole_AddsRoleToUser()
    {
        // Act
        await _repository.AddUserRoleAsync(1, 2); // Add Driver role to user1

        // Assert
        var roles = await _repository.GetUserRolesAsync(1);
        Assert.Contains("Driver", roles);
    }

    [Fact]
    public async Task GetUserRolesAsync_UserWithNoRoles_ReturnsEmptyList()
    {
        // Act
        var result = await _repository.GetUserRolesAsync(1);

        // Assert - User1 has no roles initially
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    [Fact]
    public async Task GetUserRolesAsync_UserWithRoles_ReturnsRolesList()
    {
        // Arrange - Add roles to user
        await _repository.AddUserRoleAsync(1, 1); // Passenger
        await _repository.AddUserRoleAsync(1, 2); // Driver

        // Act
        var result = await _repository.GetUserRolesAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count);
        Assert.Contains("Passenger", result);
        Assert.Contains("Driver", result);
    }

    [Fact]
    public async Task EmailExistsAsync_ExistingEmail_ReturnsTrue()
    {
        // Act
        var result = await _repository.EmailExistsAsync("user1@test.com");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task EmailExistsAsync_NonExistingEmail_ReturnsFalse()
    {
        // Act
        var result = await _repository.EmailExistsAsync("doesnotexist@test.com");

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task UsernameExistsAsync_ExistingUsername_ReturnsTrue()
    {
        // Act
        var result = await _repository.UsernameExistsAsync("user1");

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task UsernameExistsAsync_NonExistingUsername_ReturnsFalse()
    {
        // Act
        var result = await _repository.UsernameExistsAsync("doesnotexist");

        // Assert
        Assert.False(result);
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
