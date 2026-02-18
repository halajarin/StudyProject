using EcoRide.Backend.Business.Helpers;
using EcoRide.Backend.Business.Services;
using EcoRide.Backend.Business.Services.Interfaces;
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
    private readonly Mock<IPreferenceService> _preferenceServiceMock;
    private readonly Mock<IEmailHelper> _emailHelperMock;
    private readonly Mock<ILogger<CarpoolService>> _loggerMock;
    private readonly CarpoolService _carpoolService;

    public CarpoolServiceTests()
    {
        _carpoolRepositoryMock = new Mock<ICarpoolRepository>();
        _userRepositoryMock = new Mock<IUserRepository>();
        _preferenceServiceMock = new Mock<IPreferenceService>();
        _emailHelperMock = new Mock<IEmailHelper>();
        _loggerMock = new Mock<ILogger<CarpoolService>>();

        _carpoolService = new CarpoolService(
            _carpoolRepositoryMock.Object,
            _userRepositoryMock.Object,
            _preferenceServiceMock.Object,
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
        message.Should().Be("Not enough seats available");
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

    #region GetByIdAsync Tests

    [Fact]
    public async Task GetByIdAsync_WithExistingCarpool_ShouldReturnDTO()
    {
        // Arrange
        var carpool = new Carpool
        {
            CarpoolId = 1,
            UserId = 1,
            DepartureCity = "Paris",
            ArrivalCity = "Lyon",
            TotalSeats = 3,
            AvailableSeats = 2,
            PricePerPerson = 15,
            Status = CarpoolStatus.Pending
        };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);
        _userRepositoryMock.Setup(x => x.GetAverageRatingAsync(1)).ReturnsAsync(4.5);
        _preferenceServiceMock.Setup(x => x.GetPreferencesAsync(1))
            .ReturnsAsync((Dictionary<string, object?>?)null);

        // Act
        var result = await _carpoolService.GetByIdAsync(1);

        // Assert
        result.Should().NotBeNull();
        result!.CarpoolId.Should().Be(1);
        result.DepartureCity.Should().Be("Paris");
        result.DriverAverageRating.Should().Be(4.5);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistingCarpool_ShouldReturnNull()
    {
        // Arrange
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(999)).ReturnsAsync((Carpool?)null);

        // Act
        var result = await _carpoolService.GetByIdAsync(999);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region UpdateAsync Tests

    [Fact]
    public async Task UpdateAsync_WithValidData_ShouldReturnUpdatedDTO()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 1;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = userId,
            DepartureCity = "Paris",
            ArrivalCity = "Lyon",
            TotalSeats = 4,
            AvailableSeats = 3,
            PricePerPerson = 15,
            Status = CarpoolStatus.Pending
        };

        var dto = new CreateCarpoolDTO
        {
            VehicleId = 2,
            DepartureCity = "Marseille",
            DepartureLocation = "Gare St-Charles",
            DepartureDate = DateTime.UtcNow.AddDays(2),
            DepartureTime = "09:00",
            ArrivalCity = "Nice",
            ArrivalLocation = "Gare de Nice",
            ArrivalDate = DateTime.UtcNow.AddDays(2),
            ArrivalTime = "12:00",
            TotalSeats = 4,
            PricePerPerson = 20,
            EstimatedDurationMinutes = 180
        };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId)).ReturnsAsync(carpool);
        _carpoolRepositoryMock.Setup(x => x.GetParticipationsAsync(carpoolId))
            .ReturnsAsync(new List<CarpoolParticipation>
            {
                new CarpoolParticipation { Status = ParticipationStatus.Confirmed, SeatsReserved = 1 }
            });
        _carpoolRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Carpool>()))
            .ReturnsAsync(carpool);
        _userRepositoryMock.Setup(x => x.GetAverageRatingAsync(userId)).ReturnsAsync(4.0);

        // Act
        var result = await _carpoolService.UpdateAsync(carpoolId, dto, userId);

        // Assert
        result.Should().NotBeNull();
        result.DepartureCity.Should().Be("Marseille");
        _carpoolRepositoryMock.Verify(x => x.UpdateAsync(It.Is<Carpool>(c => c.AvailableSeats == 3)), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistingCarpool_ShouldThrow()
    {
        // Arrange
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(999)).ReturnsAsync((Carpool?)null);
        var dto = new CreateCarpoolDTO { DepartureCity = "Paris", ArrivalCity = "Lyon", TotalSeats = 3, PricePerPerson = 10, VehicleId = 1 };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _carpoolService.UpdateAsync(999, dto, 1));
    }

    [Fact]
    public async Task UpdateAsync_WithWrongDriver_ShouldThrowUnauthorized()
    {
        // Arrange
        var carpool = new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.Pending };
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);
        var dto = new CreateCarpoolDTO { DepartureCity = "Paris", ArrivalCity = "Lyon", TotalSeats = 3, PricePerPerson = 10, VehicleId = 1 };

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _carpoolService.UpdateAsync(1, dto, 999));
    }

    [Fact]
    public async Task UpdateAsync_WithNonPendingStatus_ShouldThrow()
    {
        // Arrange
        var carpool = new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.InProgress };
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);
        var dto = new CreateCarpoolDTO { DepartureCity = "Paris", ArrivalCity = "Lyon", TotalSeats = 3, PricePerPerson = 10, VehicleId = 1 };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _carpoolService.UpdateAsync(1, dto, 1));
        ex.Message.Should().Be("Only pending carpools can be edited");
    }

    [Fact]
    public async Task UpdateAsync_WithTooFewSeats_ShouldThrow()
    {
        // Arrange
        var carpool = new Carpool { CarpoolId = 1, UserId = 1, TotalSeats = 4, Status = CarpoolStatus.Pending };
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);
        _carpoolRepositoryMock.Setup(x => x.GetParticipationsAsync(1))
            .ReturnsAsync(new List<CarpoolParticipation>
            {
                new CarpoolParticipation { Status = ParticipationStatus.Confirmed, SeatsReserved = 3 }
            });
        var dto = new CreateCarpoolDTO { DepartureCity = "Paris", ArrivalCity = "Lyon", TotalSeats = 2, PricePerPerson = 10, VehicleId = 1 };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _carpoolService.UpdateAsync(1, dto, 1));
    }

    #endregion

    #region CancelCarpoolAsync Tests

    [Fact]
    public async Task CancelCarpoolAsync_WithValidDriver_ShouldCancelAndRefundParticipants()
    {
        // Arrange
        int carpoolId = 1;
        int driverId = 1;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = driverId,
            DepartureCity = "Paris",
            ArrivalCity = "Lyon",
            DepartureDate = DateTime.UtcNow.AddDays(1),
            Status = CarpoolStatus.Pending
        };

        var passenger = new User { UserId = 2, Credits = 30, Email = "pass@example.com", Username = "passenger" };
        var participation = new CarpoolParticipation
        {
            UserId = 2, CarpoolId = carpoolId, CreditsUsed = 10, Status = ParticipationStatus.Confirmed
        };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId)).ReturnsAsync(carpool);
        _carpoolRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Carpool>())).ReturnsAsync(carpool);
        _carpoolRepositoryMock.Setup(x => x.GetParticipationsAsync(carpoolId))
            .ReturnsAsync(new List<CarpoolParticipation> { participation });
        _userRepositoryMock.Setup(x => x.GetByIdAsync(2)).ReturnsAsync(passenger);
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>())).ReturnsAsync(passenger);
        _emailHelperMock.Setup(x => x.SendCarpoolCancellationAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);

        // Act
        var (success, message) = await _carpoolService.CancelCarpoolAsync(carpoolId, driverId);

        // Assert
        success.Should().BeTrue();
        message.Should().Be("Carpool cancelled and participants refunded");
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(u => u.Credits == 40)), Times.Once);
    }

    [Fact]
    public async Task CancelCarpoolAsync_WithWrongDriver_ShouldReturnFailure()
    {
        // Arrange
        var carpool = new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.Pending };
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);

        // Act
        var (success, message) = await _carpoolService.CancelCarpoolAsync(1, 999);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("You are not the driver of this carpool");
    }

    [Fact]
    public async Task CancelCarpoolAsync_WithNonExistingCarpool_ShouldReturnFailure()
    {
        // Arrange
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(999)).ReturnsAsync((Carpool?)null);

        // Act
        var (success, message) = await _carpoolService.CancelCarpoolAsync(999, 1);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("Carpool not found");
    }

    #endregion

    #region StartCarpoolAsync Tests

    [Fact]
    public async Task StartCarpoolAsync_WithValidData_ShouldReturnSuccess()
    {
        // Arrange
        var carpool = new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.Pending };
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);
        _carpoolRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Carpool>())).ReturnsAsync(carpool);

        // Act
        var (success, message) = await _carpoolService.StartCarpoolAsync(1, 1);

        // Assert
        success.Should().BeTrue();
        message.Should().Be("Carpool started");
        _carpoolRepositoryMock.Verify(x => x.UpdateAsync(
            It.Is<Carpool>(c => c.Status == CarpoolStatus.InProgress)), Times.Once);
    }

    [Fact]
    public async Task StartCarpoolAsync_WithWrongDriver_ShouldReturnFailure()
    {
        // Arrange
        var carpool = new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.Pending };
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);

        // Act
        var (success, message) = await _carpoolService.StartCarpoolAsync(1, 999);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("You are not the driver of this carpool");
    }

    [Fact]
    public async Task StartCarpoolAsync_WithNonPendingCarpool_ShouldReturnFailure()
    {
        // Arrange
        var carpool = new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.Completed };
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);

        // Act
        var (success, message) = await _carpoolService.StartCarpoolAsync(1, 1);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("Carpool cannot be started");
    }

    #endregion

    #region CompleteCarpoolAsync Tests

    [Fact]
    public async Task CompleteCarpoolAsync_WithValidData_ShouldReturnSuccess()
    {
        // Arrange
        var carpool = new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.InProgress };
        var passenger = new User { UserId = 2, Email = "pass@test.com", Username = "pass" };
        var participation = new CarpoolParticipation { UserId = 2, Status = ParticipationStatus.Confirmed };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);
        _carpoolRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Carpool>())).ReturnsAsync(carpool);
        _carpoolRepositoryMock.Setup(x => x.GetParticipationsAsync(1))
            .ReturnsAsync(new List<CarpoolParticipation> { participation });
        _userRepositoryMock.Setup(x => x.GetByIdAsync(2)).ReturnsAsync(passenger);
        _emailHelperMock.Setup(x => x.SendCarpoolCompletedAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<int>()))
            .Returns(Task.CompletedTask);

        // Act
        var (success, message) = await _carpoolService.CompleteCarpoolAsync(1, 1);

        // Assert
        success.Should().BeTrue();
        _carpoolRepositoryMock.Verify(x => x.UpdateAsync(
            It.Is<Carpool>(c => c.Status == CarpoolStatus.Completed)), Times.Once);
    }

    [Fact]
    public async Task CompleteCarpoolAsync_WithNonInProgressCarpool_ShouldReturnFailure()
    {
        // Arrange
        var carpool = new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.Pending };
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(carpool);

        // Act
        var (success, message) = await _carpoolService.CompleteCarpoolAsync(1, 1);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("Carpool is not in progress");
    }

    #endregion

    #region ValidateTripAsync Tests

    [Fact]
    public async Task ValidateTripAsync_WithValidTrip_ShouldCreditDriver()
    {
        // Arrange
        int carpoolId = 1;
        int passengerId = 2;
        var participation = new CarpoolParticipation
        {
            ParticipationId = 1,
            CarpoolId = carpoolId,
            UserId = passengerId,
            TripValidated = null,
            Status = ParticipationStatus.Confirmed
        };
        var carpool = new Carpool { CarpoolId = carpoolId, UserId = 1, PricePerPerson = 15 };
        var driver = new User { UserId = 1, Credits = 50 };

        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(carpoolId, passengerId))
            .ReturnsAsync(participation);
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId)).ReturnsAsync(carpool);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(driver);
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>())).ReturnsAsync(driver);
        _carpoolRepositoryMock.Setup(x => x.UpdateParticipationAsync(It.IsAny<CarpoolParticipation>()))
            .Returns(Task.CompletedTask);

        // Act
        var (success, message) = await _carpoolService.ValidateTripAsync(carpoolId, passengerId, true, null);

        // Assert
        success.Should().BeTrue();
        message.Should().Be("Trip validated");
        // Driver gets price (15) minus commission (2) = 13 credits, so 50 + 13 = 63
        _userRepositoryMock.Verify(x => x.UpdateAsync(It.Is<User>(u => u.Credits == 63)), Times.Once);
    }

    [Fact]
    public async Task ValidateTripAsync_WithProblem_ShouldReportProblem()
    {
        // Arrange
        var participation = new CarpoolParticipation
        {
            ParticipationId = 1, CarpoolId = 1, UserId = 2,
            TripValidated = null, Status = ParticipationStatus.Confirmed
        };

        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(1, 2)).ReturnsAsync(participation);
        _carpoolRepositoryMock.Setup(x => x.UpdateParticipationAsync(It.IsAny<CarpoolParticipation>()))
            .Returns(Task.CompletedTask);

        // Act
        var (success, message) = await _carpoolService.ValidateTripAsync(1, 2, false, "Driver was late");

        // Assert
        success.Should().BeTrue();
        message.Should().Be("Problem reported");
    }

    [Fact]
    public async Task ValidateTripAsync_WithAlreadyValidated_ShouldReturnFailure()
    {
        // Arrange
        var participation = new CarpoolParticipation
        {
            ParticipationId = 1, CarpoolId = 1, UserId = 2, TripValidated = true
        };

        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(1, 2)).ReturnsAsync(participation);

        // Act
        var (success, message) = await _carpoolService.ValidateTripAsync(1, 2, true, null);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("Trip already validated or problem already reported");
    }

    [Fact]
    public async Task ValidateTripAsync_WithNonExistingParticipation_ShouldReturnFailure()
    {
        // Arrange
        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(1, 2))
            .ReturnsAsync((CarpoolParticipation?)null);

        // Act
        var (success, message) = await _carpoolService.ValidateTripAsync(1, 2, true, null);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("Participation not found");
    }

    #endregion

    #region SearchAsync Tests

    [Fact]
    public async Task SearchAsync_ShouldReturnFilteredResults()
    {
        // Arrange
        var searchDto = new SearchCarpoolDTO { DepartureCity = "Paris", ArrivalCity = "Lyon" };
        var carpools = new List<Carpool>
        {
            new Carpool { CarpoolId = 1, UserId = 1, DepartureCity = "Paris", ArrivalCity = "Lyon", Status = CarpoolStatus.Pending }
        };

        _carpoolRepositoryMock.Setup(x => x.SearchAsync(
            "Paris", "Lyon",
            It.IsAny<DateTime?>(), It.IsAny<DateTime?>(),
            It.IsAny<bool?>(), It.IsAny<float?>(),
            It.IsAny<int?>(), It.IsAny<int?>()))
            .ReturnsAsync(carpools);
        _userRepositoryMock.Setup(x => x.GetAverageRatingsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new Dictionary<int, double> { { 1, 4.5 } });
        _preferenceServiceMock.Setup(x => x.GetPreferencesAsync(It.IsAny<int>()))
            .ReturnsAsync((Dictionary<string, object?>?)null);

        // Act
        var result = await _carpoolService.SearchAsync(searchDto);

        // Assert
        result.Should().HaveCount(1);
        result[0].DepartureCity.Should().Be("Paris");
    }

    #endregion

    #region GetByDriverAsync Tests

    [Fact]
    public async Task GetByDriverAsync_ShouldReturnDriverTrips()
    {
        // Arrange
        int driverId = 1;
        var carpools = new List<Carpool>
        {
            new Carpool { CarpoolId = 1, UserId = driverId, DepartureCity = "Paris", Status = CarpoolStatus.Pending },
            new Carpool { CarpoolId = 2, UserId = driverId, DepartureCity = "Lyon", Status = CarpoolStatus.Completed }
        };

        _carpoolRepositoryMock.Setup(x => x.GetByDriverAsync(driverId)).ReturnsAsync(carpools);
        _userRepositoryMock.Setup(x => x.GetAverageRatingsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new Dictionary<int, double> { { driverId, 4.0 } });

        // Act
        var result = await _carpoolService.GetByDriverAsync(driverId);

        // Assert
        result.Should().HaveCount(2);
    }

    #endregion

    #region GetByPassengerAsync Tests

    [Fact]
    public async Task GetByPassengerAsync_ShouldReturnPassengerTripsWithParticipationStatus()
    {
        // Arrange
        int passengerId = 2;
        var carpools = new List<Carpool>
        {
            new Carpool { CarpoolId = 1, UserId = 1, DepartureCity = "Paris", Status = CarpoolStatus.Completed }
        };
        var participation = new CarpoolParticipation { Status = ParticipationStatus.Validated };

        _carpoolRepositoryMock.Setup(x => x.GetByPassengerAsync(passengerId)).ReturnsAsync(carpools);
        _userRepositoryMock.Setup(x => x.GetAverageRatingsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new Dictionary<int, double> { { 1, 4.0 } });
        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(1, passengerId))
            .ReturnsAsync(participation);

        // Act
        var result = await _carpoolService.GetByPassengerAsync(passengerId);

        // Assert
        result.Should().HaveCount(1);
        result[0].ParticipationStatus.Should().Be("Validated");
    }

    #endregion

    #region GetAllAsync & GetAvailableAsync Tests

    [Fact]
    public async Task GetAllAsync_ShouldReturnAllCarpools()
    {
        // Arrange
        var carpools = new List<Carpool>
        {
            new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.Pending },
            new Carpool { CarpoolId = 2, UserId = 2, Status = CarpoolStatus.Completed }
        };

        _carpoolRepositoryMock.Setup(x => x.GetAllAsync()).ReturnsAsync(carpools);
        _userRepositoryMock.Setup(x => x.GetAverageRatingsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new Dictionary<int, double> { { 1, 4.0 }, { 2, 3.5 } });
        _preferenceServiceMock.Setup(x => x.GetPreferencesAsync(It.IsAny<int>()))
            .ReturnsAsync((Dictionary<string, object?>?)null);

        // Act
        var result = await _carpoolService.GetAllAsync();

        // Assert
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAvailableAsync_ShouldReturnOnlyPendingFutureWithSeats()
    {
        // Arrange
        var today = DateTime.UtcNow.Date;
        var carpools = new List<Carpool>
        {
            new Carpool { CarpoolId = 1, UserId = 1, Status = CarpoolStatus.Pending, AvailableSeats = 2, DepartureDate = today.AddDays(1) },
            new Carpool { CarpoolId = 2, UserId = 1, Status = CarpoolStatus.Completed, AvailableSeats = 2, DepartureDate = today.AddDays(1) },
            new Carpool { CarpoolId = 3, UserId = 1, Status = CarpoolStatus.Pending, AvailableSeats = 0, DepartureDate = today.AddDays(1) },
            new Carpool { CarpoolId = 4, UserId = 1, Status = CarpoolStatus.Pending, AvailableSeats = 1, DepartureDate = today.AddDays(-1) }
        };

        _carpoolRepositoryMock.Setup(x => x.GetAllAsync()).ReturnsAsync(carpools);
        _userRepositoryMock.Setup(x => x.GetAverageRatingsAsync(It.IsAny<IEnumerable<int>>()))
            .ReturnsAsync(new Dictionary<int, double> { { 1, 4.0 } });
        _preferenceServiceMock.Setup(x => x.GetPreferencesAsync(It.IsAny<int>()))
            .ReturnsAsync((Dictionary<string, object?>?)null);

        // Act
        var result = await _carpoolService.GetAvailableAsync();

        // Assert
        result.Should().HaveCount(1);
        result[0].CarpoolId.Should().Be(1);
    }

    #endregion

    #region Additional ParticipateAsync Tests

    [Fact]
    public async Task ParticipateAsync_WithMultiplePassengers_ShouldDeductCorrectCredits()
    {
        // Arrange
        int carpoolId = 1;
        int userId = 2;
        var carpool = new Carpool
        {
            CarpoolId = carpoolId,
            UserId = 1,
            AvailableSeats = 4,
            PricePerPerson = 10,
            Status = CarpoolStatus.Pending
        };
        var user = new User { UserId = userId, Credits = 50, Email = "user@test.com" };

        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(carpoolId)).ReturnsAsync(carpool);
        _userRepositoryMock.Setup(x => x.GetByIdAsync(userId)).ReturnsAsync(user);
        _carpoolRepositoryMock.Setup(x => x.GetParticipationAsync(carpoolId, userId))
            .ReturnsAsync((CarpoolParticipation?)null);
        _carpoolRepositoryMock.Setup(x => x.AddParticipationAsync(It.IsAny<CarpoolParticipation>()))
            .ReturnsAsync(new CarpoolParticipation());
        _userRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<User>())).ReturnsAsync(user);
        _carpoolRepositoryMock.Setup(x => x.UpdateAsync(It.IsAny<Carpool>())).ReturnsAsync(carpool);

        // Act
        var (success, message, remainingCredit) = await _carpoolService.ParticipateAsync(carpoolId, userId, 3);

        // Assert
        success.Should().BeTrue();
        remainingCredit.Should().Be(20); // 50 - (10 * 3)
        _carpoolRepositoryMock.Verify(x => x.UpdateAsync(It.Is<Carpool>(c => c.AvailableSeats == 1)), Times.Once);
    }

    [Fact]
    public async Task ParticipateAsync_WithInvalidPassengerCount_ShouldReturnFailure()
    {
        // Act
        var (success, message, _) = await _carpoolService.ParticipateAsync(1, 2, 0);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("Passenger count must be at least 1");
    }

    [Fact]
    public async Task ParticipateAsync_WithCarpoolNotFound_ShouldReturnFailure()
    {
        // Arrange
        _carpoolRepositoryMock.Setup(x => x.GetByIdAsync(999)).ReturnsAsync((Carpool?)null);

        // Act
        var (success, message, _) = await _carpoolService.ParticipateAsync(999, 2);

        // Assert
        success.Should().BeFalse();
        message.Should().Be("Carpool not found");
    }

    #endregion

    #region DeleteAsync Tests

    [Fact]
    public async Task DeleteAsync_ShouldCallRepository()
    {
        // Arrange
        _carpoolRepositoryMock.Setup(x => x.DeleteAsync(1)).Returns(Task.CompletedTask);

        // Act
        await _carpoolService.DeleteAsync(1);

        // Assert
        _carpoolRepositoryMock.Verify(x => x.DeleteAsync(1), Times.Once);
    }

    #endregion
}
