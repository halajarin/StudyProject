using EcoRide.Backend.Business.Services;
using EcoRide.Backend.Data.Enums;
using EcoRide.Backend.Data.Repositories.Interfaces;
using FluentAssertions;
using Moq;

namespace EcoRide.Backend.Tests.Services;

public class UserStatsServiceTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<ICarpoolRepository> _carpoolRepositoryMock;
    private readonly Mock<IReviewRepository> _reviewRepositoryMock;
    private readonly UserStatsService _service;

    public UserStatsServiceTests()
    {
        _userRepositoryMock = new Mock<IUserRepository>();
        _carpoolRepositoryMock = new Mock<ICarpoolRepository>();
        _reviewRepositoryMock = new Mock<IReviewRepository>();

        _service = new UserStatsService(
            _userRepositoryMock.Object,
            _carpoolRepositoryMock.Object,
            _reviewRepositoryMock.Object
        );
    }

    #region GetAdminUserDetailStatsAsync Tests

    [Fact]
    public async Task GetAdminUserDetailStatsAsync_ForDriverAndPassenger_ShouldReturnFullStats()
    {
        // Arrange
        int userId = 1;

        _userRepositoryMock.Setup(x => x.GetUserRolesAsync(userId))
            .ReturnsAsync(new List<string> { "Passenger", "Driver" });

        _carpoolRepositoryMock.Setup(x => x.GetCarpoolCountsByStatusForDriverAsync(userId))
            .ReturnsAsync(new Dictionary<CarpoolStatus, int>
            {
                { CarpoolStatus.Pending, 2 },
                { CarpoolStatus.Completed, 5 },
                { CarpoolStatus.Cancelled, 1 }
            });

        _carpoolRepositoryMock.Setup(x => x.GetParticipationCountsByStatusAsync(userId))
            .ReturnsAsync(new Dictionary<ParticipationStatus, int>
            {
                { ParticipationStatus.Confirmed, 3 },
                { ParticipationStatus.Validated, 7 }
            });

        _reviewRepositoryMock.Setup(x => x.GetReceivedReviewStatsAsDriverAsync(userId))
            .ReturnsAsync((4, 4.5));
        _reviewRepositoryMock.Setup(x => x.GetReceivedReviewStatsAsPassengerAsync(userId))
            .ReturnsAsync((2, 3.8));
        _reviewRepositoryMock.Setup(x => x.GetGivenReviewStatsAsync(userId))
            .ReturnsAsync((6, 4.2));

        // Act
        var result = await _service.GetAdminUserDetailStatsAsync(userId);

        // Assert
        result.IsDriver.Should().BeTrue();
        result.IsPassenger.Should().BeTrue();

        result.DriverStats.Should().NotBeNull();
        result.DriverStats!.TotalCreated.Should().Be(8);
        result.DriverStats.Pending.Should().Be(2);
        result.DriverStats.Completed.Should().Be(5);
        result.DriverStats.Cancelled.Should().Be(1);
        result.DriverStats.InProgress.Should().Be(0);

        result.PassengerStats.Should().NotBeNull();
        result.PassengerStats!.TotalParticipations.Should().Be(10);
        result.PassengerStats.Confirmed.Should().Be(3);
        result.PassengerStats.Validated.Should().Be(7);
        result.PassengerStats.Cancelled.Should().Be(0);

        result.DriverRatings.Count.Should().Be(4);
        result.DriverRatings.AverageRating.Should().Be(4.5);

        result.PassengerRatings.Count.Should().Be(2);
        result.PassengerRatings.AverageRating.Should().Be(3.8);

        result.ReviewsGiven.Count.Should().Be(6);
        result.ReviewsGiven.AverageNoteGiven.Should().Be(4.2);
    }

    [Fact]
    public async Task GetAdminUserDetailStatsAsync_ForPassengerOnly_ShouldNotIncludeDriverStats()
    {
        // Arrange
        int userId = 4;

        _userRepositoryMock.Setup(x => x.GetUserRolesAsync(userId))
            .ReturnsAsync(new List<string> { "Passenger" });

        _carpoolRepositoryMock.Setup(x => x.GetParticipationCountsByStatusAsync(userId))
            .ReturnsAsync(new Dictionary<ParticipationStatus, int>
            {
                { ParticipationStatus.Validated, 2 }
            });

        _reviewRepositoryMock.Setup(x => x.GetReceivedReviewStatsAsDriverAsync(userId))
            .ReturnsAsync((0, 0.0));
        _reviewRepositoryMock.Setup(x => x.GetReceivedReviewStatsAsPassengerAsync(userId))
            .ReturnsAsync((1, 5.0));
        _reviewRepositoryMock.Setup(x => x.GetGivenReviewStatsAsync(userId))
            .ReturnsAsync((1, 4.0));

        // Act
        var result = await _service.GetAdminUserDetailStatsAsync(userId);

        // Assert
        result.IsDriver.Should().BeFalse();
        result.IsPassenger.Should().BeTrue();
        result.DriverStats.Should().BeNull();
        result.PassengerStats.Should().NotBeNull();
        result.PassengerStats!.TotalParticipations.Should().Be(2);

        _carpoolRepositoryMock.Verify(x => x.GetCarpoolCountsByStatusForDriverAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task GetAdminUserDetailStatsAsync_ForAdminWithNoTrips_ShouldReturnEmptyStats()
    {
        // Arrange
        int userId = 5;

        _userRepositoryMock.Setup(x => x.GetUserRolesAsync(userId))
            .ReturnsAsync(new List<string> { "Administrator" });

        _reviewRepositoryMock.Setup(x => x.GetReceivedReviewStatsAsDriverAsync(userId))
            .ReturnsAsync((0, 0.0));
        _reviewRepositoryMock.Setup(x => x.GetReceivedReviewStatsAsPassengerAsync(userId))
            .ReturnsAsync((0, 0.0));
        _reviewRepositoryMock.Setup(x => x.GetGivenReviewStatsAsync(userId))
            .ReturnsAsync((0, 0.0));

        // Act
        var result = await _service.GetAdminUserDetailStatsAsync(userId);

        // Assert
        result.IsDriver.Should().BeFalse();
        result.IsPassenger.Should().BeFalse();
        result.DriverStats.Should().BeNull();
        result.PassengerStats.Should().BeNull();
        result.DriverRatings.Count.Should().Be(0);
        result.PassengerRatings.Count.Should().Be(0);
        result.ReviewsGiven.Count.Should().Be(0);
    }

    #endregion

    #region GetUserStatsAsync Tests

    [Fact]
    public async Task GetUserStatsAsync_ShouldReturnRolesAndRating()
    {
        // Arrange
        int userId = 1;

        _userRepositoryMock.Setup(x => x.GetUserRolesAsync(userId))
            .ReturnsAsync(new List<string> { "Passenger", "Driver" });
        _userRepositoryMock.Setup(x => x.GetAverageRatingAsync(userId))
            .ReturnsAsync(4.3);
        _userRepositoryMock.Setup(x => x.GetRatingCountAsync(userId))
            .ReturnsAsync(10);

        // Act
        var result = await _service.GetUserStatsAsync(userId);

        // Assert
        result.Roles.Should().Contain("Driver");
        result.Roles.Should().Contain("Passenger");
        result.AverageRating.Should().Be(4.3);
        result.ReviewCount.Should().Be(10);
    }

    #endregion
}
