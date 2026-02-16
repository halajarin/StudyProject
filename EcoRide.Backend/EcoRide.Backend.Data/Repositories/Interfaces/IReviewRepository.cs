using EcoRide.Backend.Data.Models;

namespace EcoRide.Backend.Data.Repositories.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(int id);
    Task<List<Review>> GetAllAsync();
    Task<List<Review>> GetByUserAsync(int userId);
    Task<List<Review>> GetByTargetUserAsync(int userId, string? status = null);
    Task<List<Review>> GetByAuthorUserAsync(int userId);
    Task<Review> CreateAsync(Review review);
    Task<Review> UpdateAsync(Review review);
    Task DeleteAsync(int id);
    Task<(int Count, double Average)> GetReceivedReviewStatsAsDriverAsync(int userId);
    Task<(int Count, double Average)> GetReceivedReviewStatsAsPassengerAsync(int userId);
    Task<(int Count, double Average)> GetGivenReviewStatsAsync(int userId);
}
