using EcoRide.Backend.Data.Enums;
using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.Dtos.Review;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoRide.Backend.WebApi.Controllers;

[Route("api/[controller]")]
[Authorize]
public class ReviewController(
    IReviewRepository reviewRepository,
    ICarpoolRepository carpoolRepository,
    ILogger<ReviewController> logger
) : BaseController
{
    private readonly IReviewRepository _reviewRepository = reviewRepository;
    private readonly ICarpoolRepository _carpoolRepository = carpoolRepository;
    private readonly ILogger<ReviewController> _logger = logger;

    private ReviewDTO MapToReviewDTO(Review review)
    {
        return new ReviewDTO
        {
            ReviewId = review.ReviewId,
            Comment = review.Comment,
            Note = review.Note,
            Status = review.Status.ToString(),
            CreatedAt = review.CreatedAt,
            AuthorUsername = review.Author.Username,
            TargetUsername = review.Target.Username,
        };
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetByUser(int userId)
    {
        var reviews = await _reviewRepository.GetByTargetUserAsync(userId, "Validated");
        var result = reviews.Select(MapToReviewDTO).ToList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewDTO createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();

        // Verify that the user participated in the carpool
        if (createDto.CarpoolId.HasValue)
        {
            var participation = await _carpoolRepository.GetParticipationAsync(
                createDto.CarpoolId.Value,
                userId
            );

            if (participation == null)
            {
                return BadRequest(
                    new { message = "You must have participated in the carpool to leave a review" }
                );
            }

            if (participation.TripValidated != true)
            {
                return BadRequest(new { message = "You must first validate the trip" });
            }
        }

        var review = new Review
        {
            Comment = createDto.Comment,
            Note = createDto.Note,
            AuthorUserId = userId,
            TargetUserId = createDto.TargetUserId,
            CarpoolId = createDto.CarpoolId,
            Status = ReviewStatus.Pending,
            CreatedAt = DateTime.UtcNow,
        };

        var created = await _reviewRepository.CreateAsync(review);
        _logger.LogInformation($"New review created: {created.ReviewId}");

        return CreatedAtAction(nameof(GetByUser), new { userId = createDto.TargetUserId }, created);
    }

    [Authorize(Roles = "Employee,Administrator")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var reviews = await _reviewRepository.GetPendingReviewsAsync();
        var result = reviews.Select(MapToReviewDTO).ToList();

        return Ok(result);
    }

    [Authorize(Roles = "Employee,Administrator")]
    [HttpPut("{id}/validate")]
    public async Task<IActionResult> Validate(int id)
    {
        var review = await _reviewRepository.GetByIdAsync(id);
        if (review == null)
        {
            return NotFound(new { message = "Review not found" });
        }

        review.Status = ReviewStatus.Validated;
        await _reviewRepository.UpdateAsync(review);

        _logger.LogInformation($"Review {id} validated");
        return Ok(new { message = "Review validated" });
    }

    [Authorize(Roles = "Employee,Administrator")]
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(int id)
    {
        var review = await _reviewRepository.GetByIdAsync(id);
        if (review == null)
        {
            return NotFound(new { message = "Review not found" });
        }

        review.Status = ReviewStatus.Rejected;
        await _reviewRepository.UpdateAsync(review);

        _logger.LogInformation($"Review {id} rejected");
        return Ok(new { message = "Review rejected" });
    }
}
