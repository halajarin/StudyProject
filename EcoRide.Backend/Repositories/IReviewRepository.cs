using EcoRide.Backend.Models;

namespace EcoRide.Backend.Repositories;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(int id);
    Task<List<Review>> GetByTargetUserAsync(int userId, string? status = null);
    Task<List<Review>> GetPendingReviewsAsync();
    Task<Review> CreateAsync(Review review);
    Task<Review> UpdateAsync(Review review);
    Task DeleteAsync(int id);
}
