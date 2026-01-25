using EcoRide.Backend.Business.Services.Interfaces;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.Dtos.User;

namespace EcoRide.Backend.Business.Services;

public class UserStatsService : IUserStatsService
{
    private readonly IUserRepository _userRepository;

    public UserStatsService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
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
            ReviewCount = reviewCount
        };
    }
}
