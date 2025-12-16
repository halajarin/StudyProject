using EcoRide.Backend.Models;

namespace EcoRide.Backend.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByPseudoAsync(string pseudo);
    Task<List<User>> GetAllAsync();
    Task<User> CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task DeleteAsync(int id);
    Task<bool> EmailExistsAsync(string email);
    Task<bool> PseudoExistsAsync(string pseudo);
    Task<List<string>> GetUserRolesAsync(int userId);
    Task AddUserRoleAsync(int userId, int roleId);
    Task<double> GetAverageRatingAsync(int userId);
    Task<int> GetRatingCountAsync(int userId);
}
