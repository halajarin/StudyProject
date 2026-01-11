using EcoRide.Backend.Business.Helpers;
using EcoRide.Backend.Business.Services;
using EcoRide.Backend.Data.Enums;
using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.Dtos.Carpool;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace EcoRide.Backend.Tests.Services;

public class CarpoolServiceTests
{
    private readonly Mock<ICarpoolRepository> _carpoolRepositoryMock;
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IEmailHelper> _emailHelperMock;
    private readonly Mock<ILogger<CarpoolService>> _loggerMock;
    private readonly CarpoolService _carpoolService;

    public CarpoolServiceTests()
    {
        _carpoolRepositoryMock = new Mock<ICarpoolRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _emailHelperMock = new Mock<IEmailHelper>();
        _loggerMock = new Mock<ILogger<CarpoolService>>();

        _carpoolService = new CarpoolService(
            _carpoolRepositoryMock.Object,
            _userRepositoryMock.Object,
            _emailHelperMock.Object,
            _loggerMock.Object
        );
    }

    #region ParticipateAsync Tests

    [Fact]
    public async Task ParticipateAsync_WithValidData_ShouldReturnSuccess()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;
        int driverId = 1;

        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = driverId,
            AvailableSeats = 3,
            PricePerPerson = 10,
            Status = CarpoolStatus.Pending
        };

        var user = new User
        {
            UserId = userId,
            Credits = 50,
            Email = "user@example.com"
        };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(carpoolId, userId))
            .ReturnsAsync((CarpoolParticipation?)null);
        _carpoolRepositoryMock.Setup(x => x.AddParticipationAsync(It.IsAny<CarpoolParticipation>()))
            .ReturnsAsync(new CarpoolParticipation());
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>()))
            .ReturnsAsync(user);
        _carpoolRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Carpool>()))
            .ReturnsAsync(carpool);

        // Act
        var (success, message, remainingCredit) = await _carpoolService.ParticipateAsync(carpoolId, userId);

        // Assert
        success.Should().BeTrue();
        message.Should().Be("Participation confirmed");
        remainingCredit.Should().Be(40);

        _carpoolRepositoryMock.Verify(x => x.AddParticipationAsync(It.IsAny<CarpoolParticipation>()), Times.Once);
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(u => u.Credits == 40)), Times.Once);
        _carpoolRepositoryMock.Verify(x => x.UpdateAsync(It.Is<Carpool>(c => c.AvailableSeats == 2)), Times.Once);
    }

    [Fact]
    public async Task ParticipateAsync_WithNoSeatsAvailable_ShouldReturnFailure()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;

        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = 1,
            AvailableSeats = 0,
            PricePerPerson = 10,
            Status = CarpoolStatus.Pending
        };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);

        // Act
        var (success, message, remainingCredit) = await _carpoolService.ParticipateAsync(carpoolId, userId);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("No seats available");
        remainingCredit.Should().BeNull();

        _carpoolRepositoryMock.Verify(x => x.AddParticipationAsync(It.IsAny<CarpoolParticipation>()), Times.Never);
    }

    [Fact]
    public async Task ParticipateAsync_WithDriverTryingToJoinOwnCarpool_ShouldReturnFailure()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 1; // Same as driver

        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = userId,
            AvailableSeats = 3,
            PricePerPerson = 10,
            Status = CarpoolStatus.Pending
        };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);

        // Act
        var (success, message, remainingCredit) = await _carpoolService.ParticipateAsync(carpoolId, userId);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("You cannot join your own carpool");
        remainingCredit.Should().BeNull();

        _carpoolRepositoryMock.Verify(x => x.AddParticipationAsync(It.IsAny<CarpoolParticipation>()), Times.Never);
    }

    [Fact]
    public async Task ParticipateAsync_WithInsufficientCredits_ShouldReturnFailure()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;

        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = 1,
            AvailableSeats = 3,
            PricePerPerson = 50,
            Status = CarpoolStatus.Pending
        };

        var user = new User
        {
            UserId = userId,
            Credits = 10, // Less than price
            Email = "user@example.com"
        };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);

        // Act
        var (success, message, remainingCredit) = await _carpoolService.ParticipateAsync(carpoolId, userId);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("Insufficient credits");
        remainingCredit.Should().BeNull();

        _carpoolRepositoryMock.Verify(x => x.AddParticipationAsync(It.IsAny<CarpoolParticipation>()), Times.Never);
    }

    [Fact]
    public async Task ParticipateAsync_WithExistingParticipation_ShouldReturnFailure()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;

        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = 1,
            AvailableSeats = 3,
            PricePerPerson = 10,
            Status = CarpoolStatus.Pending
        };

        var user = new User
        {
            UserId = userId,
            Credits = 50,
            Email = "user@example.com"
        };

        var existingParticipation = new CarpoolParticipation
        {
            ParticipationId = 1,
            CarpoolId = carpoolId,
            UserId = userId
        };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(carpoolId, userId))
            .ReturnsAsync(existingParticipation);

        // Act
        var (success, message, remainingCredit) = await _carpoolService.ParticipateAsync(carpoolId, userId);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("You are already participating in this carpool");
        remainingCredit.Should().BeNull();

        _carpoolRepositoryMock.Verify(x => x.AddParticipationAsync(It.IsAny<CarpoolParticipation>()), Times.Never);
    }

    #endregion

    #region CancelParticipationAsync Tests

    [Fact]
    public async Task CancelParticipationAsync_WithValidParticipation_ShouldReturnSuccessAndRefundCredits()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;
        int creditsUsed = 10;

        var participation = new CarpoolParticipation
        {
            ParticipationId = 1,
            CarpoolId = carpoolId,
            UserId = userId,
            CreditsUsed = creditsUsed,
            Status = ParticipationStatus.Confirmed
        };

        var user = new User
        {
            UserId = userId,
            Credits = 30,
            Email = "user@example.com"
        };

        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            AvailableSeats = 1,
            Status = CarpoolStatus.Pending
        };

        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(carpoolId, userId))
            .ReturnsAsync(participation);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId))
            .ReturnsAsync(user);
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId))
            .ReturnsAsync(carpool);
        _carpoolRepositoryMock.Setup(x => x.UpdateParticipationAsync(It.IsAny<CarpoolParticipation>()))
            .Returns(Task.CompletedTask);
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>()))
            .ReturnsAsync(user);
        _carpoolRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Carpool>()))
            .ReturnsAsync(carpool);

        // Act
        var (success, message) = await _carpoolService.CancelParticipationAsync(carpoolId, userId);

        // Assert
        success.Should().BeTrue();
        message.Should().Be("Participation cancelled and credits refunded");

        _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(u => u.Credits == 40)), Times.Once);
        _carpoolRepositoryMock.Verify(x => x.UpdateAsync(It.Is<Carpool>(c => c.AvailableSeats == 2)), Times.Once);
    }

    [Fact]
    public async Task CancelParticipationAsync_WithNonExistingParticipation_ShouldReturnFailure()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;

        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(carpoolId, userId))
            .ReturnsAsync((CarpoolParticipation?)null);

        // Act
        var (success, message) = await _carpoolService.CancelParticipationAsync(carpoolId, userId);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("Participation not found");

        _carpoolRepositoryMock.Verify(x => x.UpdateParticipationAsync(It.IsAny<CarpoolParticipation>()), Times.Never);
    }

    #endregion

    #region CreateAsync Tests

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldReturnCarpoolDTO()
    {
        // Arrange
        int userId = 1;
        var createDto = new CreateCarpoolDTO
        {
            VehicleId = 1,
            DepartureCity = "Paris",
            DepartureLocation = "Gare de Lyon",
            DepartureDate = DateTime.UtcNow.AddDays(1),
            DepartureTime = "10:00",
            ArrivalCity = "Lyon",
            ArrivalLocation = "Part-Dieu",
            ArrivalDate = DateTime.UtcNow.AddDays(1),
            ArrivalTime = "13:00",
            TotalSeats = 3,
            PricePerPerson = 15,
            EstimatedDurationMinutes = 180
        };

        var createdCarpool = new Carpool
        {
            CarpoolId = 1,
            UserId = userId,
            VehicleId = createDto.VehicleId,
            DepartureCity = createDto.DepartureCity,
            DepartureLocation = createDto.DepartureLocation,
            ArrivalCity = createDto.ArrivalCity,
            ArrivalLocation = createDto.ArrivalLocation,
            TotalSeats = createDto.TotalSeats,
            AvailableSeats = createDto.TotalSeats,
            PricePerPerson = createDto.PricePerPerson,
            Status = CarpoolStatus.Pending
        };

        _carpoolRepositoryMock.Setup(x => x.CreateAsync(It.IsAny<Carpool>()))
            .ReturnsAsync(createdCarpool);

        // Act
        var result = await _carpoolService.CreateAsync(createDto, userId);

        // Assert
        result.Should().NotBeNull();
        result.CarpoolId.Should().Be(1);
        result.DepartureCity.Should().Be("Paris");
        result.ArrivalCity.Should().Be("Lyon");
        result.TotalSeats.Should().Be(3);
        result.AvailableSeats.Should().Be(3);

        _carpoolRepositoryMock.Verify(x => x.CreateAsync(It.IsAny<Carpool>()), Times.Once);
    }

    #endregion
}
