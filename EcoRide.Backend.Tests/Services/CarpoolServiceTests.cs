using Xunit;
using Moq;
using EcoRide.Backend.Services;
using EcoRide.Backend.Repositories;
using EcoRide.Backend.Models;
using Microsoft.Extensions.Logging;

namespace EcoRide.Backend.Tests.Services;

public class CarpoolServiceTests
{
    private readonly Mock<ICarpoolRepository> _mockCarpoolRepo;
    private readonly Mock<IUserRepository> _mockUserRepo;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<ILogger<CarpoolService>> _mockLogger;
    private readonly CarpoolService _service;

    public CarpoolServiceTests()
    {
        _mockCarpoolRepo = new Mock<ICarpoolRepository>();
        _mockUserRepo = new Mock<IUserRepository>();
        _mockEmailService = new Mock<IEmailService>();
        _mockLogger = new Mock<ILogger<CarpoolService>>();

        _service = new CarpoolService(
            _mockCarpoolRepo.Object,
            _mockUserRepo.Object,
            _mockEmailService.Object,
            _mockLogger.Object
        );
    }

    [Fact]
    public async Task ParticipateAsync_CarpoolNotFound_ReturnsFalse()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 1;
        _mockCarpoolRepo.Setup(r => r.GetByIdAsync(carpoolId))
            .ReturnsAsync((Carpool?)null);

        // Act
        var (success, message, credits) = await _service.ParticipateAsync(carpoolId, userId);

        // Assert
        Assert.False(success);
        Assert.Equal("Carpool not found", message);
        Assert.Null(credits);
    }

    [Fact]
    public async Task ParticipateAsync_NoSeatsAvailable_ReturnsFalse()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 1;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            AvailableSeats = 0,
            PricePerPerson = 20
        };

        _mockCarpoolRepo.Setup(r => r.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);

        // Act
        var (success, message, credits) = await _service.ParticipateAsync(carpoolId, userId);

        // Assert
        Assert.False(success);
        Assert.Equal("No seats available", message);
        Assert.Null(credits);
    }

    [Fact]
    public async Task ParticipateAsync_UserIsDriver_ReturnsFalse()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 1;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = userId,
            AvailableSeats = 2,
            PricePerPerson = 20
        };

        _mockCarpoolRepo.Setup(r => r.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);

        // Act
        var (success, message, credits) = await _service.ParticipateAsync(carpoolId, userId);

        // Assert
        Assert.False(success);
        Assert.Equal("You cannot participate in your own carpool", message);
    }

    [Fact]
    public async Task ParticipateAsync_InsufficientCredits_ReturnsFalse()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = 1,
            AvailableSeats = 2,
            PricePerPerson = 20,
            Status = "Pending"
        };

        var user = new User
        {
            UserId = userId,
            Credits = 10 // Insufficient
        };

        _mockCarpoolRepo.Setup(r => r.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);
        _mockUserRepo.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var (success, message, credits) = await _service.ParticipateAsync(carpoolId, userId);

        // Assert
        Assert.False(success);
        Assert.Equal("Insufficient credits", message);
    }

    [Fact]
    public async Task ParticipateAsync_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = 1,
            AvailableSeats = 2,
            TotalSeats = 3,
            PricePerPerson = 20,
            Status = "Pending"
        };

        var user = new User
        {
            UserId = userId,
            Credits = 50,
            Email = "test@example.com"
        };

        _mockCarpoolRepo.Setup(r => r.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);
        _mockUserRepo.Setup(r => r.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _mockCarpoolRepo.Setup(r => r.AddParticipationAsync(It.IsAny<CarpoolParticipation>()))
            .ReturnsAsync(new CarpoolParticipation());
        _mockUserRepo.Setup(r => r.UpdateAsync(It.IsAny<User>()))
            .ReturnsAsync(user);

        // Act
        var (success, message, credits) = await _service.ParticipateAsync(carpoolId, userId);

        // Assert
        Assert.True(success);
        Assert.Equal("Participation confirmed", message);
        Assert.Equal(30, credits); // 50 - 20 = 30
        Assert.Equal(30, user.Credits);
        Assert.Equal(1, carpool.AvailableSeats); // 2 - 1 = 1
    }

    [Fact]
    public async Task CancelParticipationAsync_ParticipationNotFound_ReturnsFalse()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 1;
        _mockCarpoolRepo.Setup(r => r.GetParticipationAsync(carpoolId, userId))
            .ReturnsAsync((CarpoolParticipation?)null);

        // Act
        var (success, message) = await _service.CancelParticipationAsync(carpoolId, userId);

        // Assert
        Assert.False(success);
        Assert.Equal("Participation not found", message);
    }

    [Fact]
    public async Task CancelParticipationAsync_TripAlreadyStarted_ReturnsFalse()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 1;
        var participation = new CarpoolParticipation
        {
            ParticipationId = 1,
            CarpoolId = carpoolId,
            UserId = userId
        };

        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            Status = "In Progress"
        };

        _mockCarpoolRepo.Setup(r => r.GetParticipationAsync(carpoolId, userId))
            .ReturnsAsync(participation);
        _mockCarpoolRepo.Setup(r => r.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);

        // Act
        var (success, message) = await _service.CancelParticipationAsync(carpoolId, userId);

        // Assert
        Assert.False(success);
        Assert.Equal("Cannot cancel a trip that has already started", message);
    }

    [Fact]
    public async Task StartCarpoolAsync_NotDriver_ReturnsFalse()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = 1 // Different user
        };

        _mockCarpoolRepo.Setup(r => r.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);

        // Act
        var (success, message) = await _service.StartCarpoolAsync(carpoolId, userId);

        // Assert
        Assert.False(success);
        Assert.Equal("You are not the driver of this carpool", message);
    }

    [Fact]
    public async Task StartCarpoolAsync_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 1;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = userId,
            Status = "Pending"
        };

        _mockCarpoolRepo.Setup(r => r.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);
        _mockCarpoolRepo.Setup(r => r.UpdateAsync(It.IsAny<Carpool>()))
            .ReturnsAsync(carpool);

        // Act
        var (success, message) = await _service.StartCarpoolAsync(carpoolId, userId);

        // Assert
        Assert.True(success);
        Assert.Equal("Carpool started", message);
        Assert.Equal("In Progress", carpool.Status);
    }

    [Fact]
    public async Task CompleteCarpoolAsync_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 1;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = userId,
            Status = "In Progress"
        };

        _mockCarpoolRepo.Setup(r => r.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);
        _mockCarpoolRepo.Setup(r => r.UpdateAsync(It.IsAny<Carpool>()))
            .ReturnsAsync(carpool);

        // Act
        var (success, message) = await _service.CompleteCarpoolAsync(carpoolId, userId);

        // Assert
        Assert.True(success);
        Assert.Equal("Carpool completed", message);
        Assert.Equal("Completed", carpool.Status);
    }
}
