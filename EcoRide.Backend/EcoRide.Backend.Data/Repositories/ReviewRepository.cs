using EcoRide.Backend.Data.Context;
using EcoRide.Backend.Data.Enums;
using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Data.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace EcoRide.Backend.Data.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly EcoRideContext _context;

    public ReviewRepository(EcoRideContext context)
    {
        _context = context;
    }

    public async Task<Review?> GetByIdAsync(int id)
    {
        return await _context.Reviews
            .Include(a => a.Author)
            .Include(a => a.Target)
            .Include(a => a.Carpool)
            .FirstOrDefaultAsync(a => a.ReviewId == id);
    }

    public async Task<List<Review>> GetAllAsync()
    {
        return await _context.Reviews
            .Include(r => r.Author)
            .Include(r => r.Target)
            .Include(r => r.Carpool).ThenInclude(c => c!.Driver)
            .Include(r => r.Carpool).ThenInclude(c => c!.Vehicle).ThenInclude(v => v.Brand)
            .OrderByDescending(r => r.ReviewId)
            .ToListAsync();
    }

    public async Task<List<Review>> GetByUserAsync(int userId)
    {
        return await _context.Reviews
            .Include(r => r.Author)
            .Include(r => r.Target)
            .Include(r => r.Carpool).ThenInclude(c => c!.Driver)
            .Include(r => r.Carpool).ThenInclude(c => c!.Vehicle).ThenInclude(v => v.Brand)
            .Where(r => r.AuthorUserId == userId || r.TargetUserId == userId)
            .OrderByDescending(r => r.ReviewId)
            .ToListAsync();
    }

    public async Task<List<Review>> GetByTargetUserAsync(int userId, string? status = null)
    {
        var query = _context.Reviews
            .Include(a => a.Author)
            .Include(a => a.Target)
            .Where(a => a.TargetUserId == userId);

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<ReviewStatus>(status, out var reviewStatus))
        {
            query = query.Where(a => a.Status == reviewStatus);
        }

        return await query.OrderByDescending(a => a.CreatedAt).ToListAsync();
    }

    public async Task<List<Review>> GetByAuthorUserAsync(int userId)
    {
        return await _context.Reviews
            .Include(a => a.Author)
            .Include(a => a.Target)
            .Include(a => a.Carpool)
            .Where(a => a.AuthorUserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync();
    }

    public async Task<Review> CreateAsync(Review review)
    {
        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Reload with navigation properties
        return await GetByIdAsync(review.ReviewId) ?? review;
    }

    public async Task<Review> UpdateAsync(Review review)
    {
        _context.Reviews.Update(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task DeleteAsync(int id)
    {
        var review = await _context.Reviews.FindAsync(id);
        if (review != null)
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<(int Count, double Average)> GetReceivedReviewStatsAsDriverAsync(int userId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.Carpool)
            .Where(r => r.TargetUserId == userId
                     && r.Status == ReviewStatus.Validated
                     && r.CarpoolId != null
                     && r.Carpool!.UserId == userId)
            .ToListAsync();

        return (reviews.Count, reviews.Count > 0 ? reviews.Average(r => r.Note) : 0);
    }

    public async Task<(int Count, double Average)> GetReceivedReviewStatsAsPassengerAsync(int userId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.Carpool)
            .Where(r => r.TargetUserId == userId
                     && r.Status == ReviewStatus.Validated
                     && r.CarpoolId != null
                     && r.Carpool!.UserId != userId)
            .ToListAsync();

        return (reviews.Count, reviews.Count > 0 ? reviews.Average(r => r.Note) : 0);
    }

    public async Task<(int Count, double Average)> GetGivenReviewStatsAsync(int userId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.AuthorUserId == userId
                     && r.Status == ReviewStatus.Validated)
            .ToListAsync();

        return (reviews.Count, reviews.Count > 0 ? reviews.Average(r => r.Note) : 0);
    }
}
