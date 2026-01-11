using EcoRide.Backend.Business.Services;
using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.Dtos.Auth;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;

namespace EcoRide.Backend.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IConfiguration> _configurationMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _configurationMock = new Mock<IConfiguration>();

        // Setup JWT configuration
        var jwtSectionMock = new Mock<IConfigurationSection>();
        jwtSectionMock.Setup(x => x["SecretKey"]).Returns("ThisIsAVerySecureSecretKeyForJWTTokenGeneration123!");
        jwtSectionMock.Setup(x => x["Issuer"]).Returns("EcoRideAPI");
        jwtSectionMock.Setup(x => x["Audience"]).Returns("EcoRideClient");
        jwtSectionMock.Setup(x => x["ExpirationInMinutes"]).Returns("60");

        _configurationMock.Setup(x => x.GetSection("JwtSettings")).Returns(jwtSectionMock.Object);

        _authService = new AuthService(_userRepositoryMock.Object, _configurationMock.Object);
    }

    #region RegisterAsync Tests

    [Fact]
    public async Task RegisterAsync_WithValidData_ShouldReturnUserAndToken()
    {
        // Arrange
        var registerDto = new RegisterDTO
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Test@1234",
            FirstName = "Test",
            LastName = "User"
        };

        _userRepositoryMock.Setup(x => x.EmailExistsAsync(registerDto.Email))
            .ReturnsAsync(false);
        _userRepositoryMock.Setup(x => x.UsernameExistsAsync(registerDto.Username))
            .ReturnsAsync(false);

        var createdUser = new User
        {
            UserId = 1,
            Username = registerDto.Username,
            Email = registerDto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Credits = 20,
            IsActive = true
        };

        _userRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<User>()))
            .ReturnsAsync(createdUser);
        _userRepositoryMock.Setup(x => x.AddUserRoleAsync(createdUser.UserId, 1))
            .Returns(Task.CompletedTask);
        _userRepositoryMock.Setup(x => x.GetUserRolesAsync(createdUser.UserId))
            .ReturnsAsync(new List<string> { "Passenger" });

        // Act
        var (user, token) = await _authService.RegisterAsync(registerDto);

        // Assert
        user.Should().NotBeNull();
        user!.Username.Should().Be(registerDto.Username);
        user.Email.Should().Be(registerDto.Email);
        user.Credits.Should().Be(20);
        token.Should().NotBeNullOrEmpty();

        _userRepositoryMock.Verify(x => x.EmailExistsAsync(registerDto.Email), Times.Once);
        _userRepositoryMock.Verify(x => x.UsernameExistsAsync(registerDto.Username), Times.Once);
        _userRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<User>()), Times.Once);
        _userRepositoryMock.Verify(x => x.AddUserRoleAsync(createdUser.UserId, 1), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldReturnNullUserAndToken()
    {
        // Arrange
        var registerDto = new RegisterDTO
        {
            Username = "testuser",
            Email = "existing@example.com",
            Password = "Test@1234"
        };

        _userRepositoryMock.Setup(x => x.EmailExistsAsync(registerDto.Email))
            .ReturnsAsync(true);

        // Act
        var (user, token) = await _authService.RegisterAsync(registerDto);

        // Assert
        user.Should().BeNull();
        token.Should().BeNull();

        _userRepositoryMock.Verify(x => x.EmailExistsAsync(registerDto.Email), Times.Once);
        _userRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingUsername_ShouldReturnNullUserAndToken()
    {
        // Arrange
        var registerDto = new RegisterDTO
        {
            Username = "existinguser",
            Email = "test@example.com",
            Password = "Test@1234"
        };

        _userRepositoryMock.Setup(x => x.EmailExistsAsync(registerDto.Email))
            .ReturnsAsync(false);
        _userRepositoryMock.Setup(x => x.UsernameExistsAsync(registerDto.Username))
            .ReturnsAsync(true);

        // Act
        var (user, token) = await _authService.RegisterAsync(registerDto);

        // Assert
        user.Should().BeNull();
        token.Should().BeNull();

        _userRepositoryMock.Verify(x => x.UsernameExistsAsync(registerDto.Username), Times.Once);
        _userRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<User>()), Times.Never);
    }

    #endregion

    #region LoginAsync Tests

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnUserAndToken()
    {
        // Arrange
        var loginDto = new LoginDTO
        {
            Email = "test@example.com",
            Password = "Test@1234"
        };

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(loginDto.Password);
        var existingUser = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = loginDto.Email,
            Password = hashedPassword,
            IsActive = true
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(loginDto.Email))
            .ReturnsAsync(existingUser);
        _userRepositoryMock.Setup(x => x.GetUserRolesAsync(existingUser.UserId))
            .ReturnsAsync(new List<string> { "Passenger" });

        // Act
        var (user, token) = await _authService.LoginAsync(loginDto);

        // Assert
        user.Should().NotBeNull();
        user!.Email.Should().Be(loginDto.Email);
        token.Should().NotBeNullOrEmpty();

        _userRepositoryMock.Verify(x => x.GetByEmailAsync(loginDto.Email), Times.Once);
        _userRepositoryMock.Verify(x => x.GetUserRolesAsync(existingUser.UserId), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidEmail_ShouldReturnNullUserAndToken()
    {
        // Arrange
        var loginDto = new LoginDTO
        {
            Email = "nonexistent@example.com",
            Password = "Test@1234"
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(loginDto.Email))
            .ReturnsAsync((User?)null);

        // Act
        var (user, token) = await _authService.LoginAsync(loginDto);

        // Assert
        user.Should().BeNull();
        token.Should().BeNull();

        _userRepositoryMock.Verify(x => x.GetByEmailAsync(loginDto.Email), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldReturnNullUserAndToken()
    {
        // Arrange
        var loginDto = new LoginDTO
        {
            Email = "test@example.com",
            Password = "WrongPassword123"
        };

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("Test@1234");
        var existingUser = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = loginDto.Email,
            Password = hashedPassword,
            IsActive = true
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(loginDto.Email))
            .ReturnsAsync(existingUser);

        // Act
        var (user, token) = await _authService.LoginAsync(loginDto);

        // Assert
        user.Should().BeNull();
        token.Should().BeNull();

        _userRepositoryMock.Verify(x => x.GetByEmailAsync(loginDto.Email), Times.Once);
        _userRepositoryMock.Verify(x => x.GetUserRolesAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_WithInactiveUser_ShouldReturnNullUserAndToken()
    {
        // Arrange
        var loginDto = new LoginDTO
        {
            Email = "test@example.com",
            Password = "Test@1234"
        };

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(loginDto.Password);
        var inactiveUser = new User
        {
            UserId = 1,
            Username = "testuser",
            Email = loginDto.Email,
            Password = hashedPassword,
            IsActive = false
        };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(loginDto.Email))
            .ReturnsAsync(inactiveUser);

        // Act
        var (user, token) = await _authService.LoginAsync(loginDto);

        // Assert
        user.Should().BeNull();
        token.Should().BeNull();

        _userRepositoryMock.Verify(x => x.GetByEmailAsync(loginDto.Email), Times.Once);
        _userRepositoryMock.Verify(x => x.GetUserRolesAsync(It.IsAny<int>()), Times.Never);
    }

    #endregion
}
