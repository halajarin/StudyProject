using EcoRide.Backend.Dtos.User;

namespace EcoRide.Backend.Business.Services.Interfaces;

public interface IUserStatsService
{
    Task<UserStatsDTO> GetUserStatsAsync(int userId);
}
