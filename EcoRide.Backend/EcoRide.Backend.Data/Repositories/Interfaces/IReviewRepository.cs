using EcoRide.Backend.Data.Models;

namespace EcoRide.Backend.Data.Repositories.Interfaces;

public interface IReviewRepository
{
    Task<Review?> GetByIdAsync(int id);
    Task<List<Review>> GetByTargetUserAsync(int userId, string? status = null);
    Task<List<Review>> GetPendingReviewsAsync();
    Task<Review> CreateAsync(Review review);
    Task<Review> UpdateAsync(Review review);
    Task DeleteAsync(int id);
}
