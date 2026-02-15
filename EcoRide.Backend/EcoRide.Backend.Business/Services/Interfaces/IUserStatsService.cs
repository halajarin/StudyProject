using EcoRide.Backend.Dtos.Admin;
using EcoRide.Backend.Dtos.User;

namespace EcoRide.Backend.Business.Services.Interfaces;

public interface IUserStatsService
{
    Task<UserStatsDTO> GetUserStatsAsync(int userId);
    Task<AdminUserDetailStatsDTO> GetAdminUserDetailStatsAsync(int userId);
}
