using EcoRide.Backend.Business.Constants;
using EcoRide.Backend.Business.Services.Interfaces;
using EcoRide.Backend.Data.Enums;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.Dtos.Admin;
using EcoRide.Backend.Dtos.User;

namespace EcoRide.Backend.Business.Services;

public class UserStatsService : IUserStatsService
{
    private readonly IUserRepository _userRepository;
    private readonly ICarpoolRepository _carpoolRepository;
    private readonly IReviewRepository _reviewRepository;

    public UserStatsService(
        IUserRepository userRepository,
        ICarpoolRepository carpoolRepository,
        IReviewRepository reviewRepository
    )
    {
        _userRepository = userRepository;
        _carpoolRepository = carpoolRepository;
        _reviewRepository = reviewRepository;
    }

    public async Task<UserStatsDTO> GetUserStatsAsync(int userId)
    {
        var roles = await _userRepository.GetUserRolesAsync(userId);
        var averageRating = await _userRepository.GetAverageRatingAsync(userId);
        var reviewCount = await _userRepository.GetRatingCountAsync(userId);

        return new UserStatsDTO
        {
            Roles = roles,
            AverageRating = averageRating,
            ReviewCount = reviewCount,
        };
    }

    public async Task<AdminUserDetailStatsDTO> GetAdminUserDetailStatsAsync(int userId)
    {
        var roles = await _userRepository.GetUserRolesAsync(userId);
        var isDriver = roles.Contains("Driver");
        var isPassenger = roles.Contains("Passenger");

        var dto = new AdminUserDetailStatsDTO { IsDriver = isDriver, IsPassenger = isPassenger };

        // Driver stats
        if (isDriver)
        {
            var carpoolCounts = await _carpoolRepository.GetCarpoolCountsByStatusForDriverAsync(
                userId
            );
            dto.DriverStats = new DriverStatsDTO
            {
                TotalCreated = carpoolCounts.Values.Sum(),
                Pending = carpoolCounts.GetValueOrDefault(CarpoolStatus.Pending),
                InProgress = carpoolCounts.GetValueOrDefault(CarpoolStatus.InProgress),
                Completed = carpoolCounts.GetValueOrDefault(CarpoolStatus.Completed),
                Cancelled = carpoolCounts.GetValueOrDefault(CarpoolStatus.Cancelled),
            };
        }

        // Passenger stats
        if (isPassenger)
        {
            var participationCounts = await _carpoolRepository.GetParticipationCountsByStatusAsync(
                userId
            );
            dto.PassengerStats = new PassengerStatsDTO
            {
                TotalParticipations = participationCounts.Values.Sum(),
                Confirmed = participationCounts.GetValueOrDefault(ParticipationStatus.Confirmed),
                Validated = participationCounts.GetValueOrDefault(ParticipationStatus.Validated),
                Cancelled = participationCounts.GetValueOrDefault(ParticipationStatus.Cancelled),
            };
        }

        // Review stats
        var driverRatings = await _reviewRepository.GetReceivedReviewStatsAsDriverAsync(userId);
        dto.DriverRatings = new RatingStatsDTO
        {
            Count = driverRatings.Count,
            AverageRating = Math.Round(driverRatings.Average, 1),
        };

        var passengerRatings = await _reviewRepository.GetReceivedReviewStatsAsPassengerAsync(
            userId
        );
        dto.PassengerRatings = new RatingStatsDTO
        {
            Count = passengerRatings.Count,
            AverageRating = Math.Round(passengerRatings.Average, 1),
        };

        var reviewsGiven = await _reviewRepository.GetGivenReviewStatsAsync(userId);
        dto.ReviewsGiven = new ReviewsGivenStatsDTO
        {
            Count = reviewsGiven.Count,
            AverageNoteGiven = Math.Round(reviewsGiven.Average, 1),
        };

        return dto;
    }
}
