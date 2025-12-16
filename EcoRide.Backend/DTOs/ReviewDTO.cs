using System.ComponentModel.DataAnnotations;

namespace EcoRide.Backend.DTOs;

public class ReviewDTO
{
    public int ReviewId { get; set; }
    public string Comment { get; set; } = string.Empty;
    public int Note { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string AuthorPseudo { get; set; } = string.Empty;
    public string TargetPseudo { get; set; } = string.Empty;
}

public class CreateReviewDTO
{
    [Required(ErrorMessage = "Comment is required")]
    [MaxLength(500, ErrorMessage = "Comment cannot exceed 500 characters")]
    public string Comment { get; set; } = string.Empty;

    [Required(ErrorMessage = "Rating is required")]
    [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
    public int Note { get; set; }

    [Required(ErrorMessage = "Target user is required")]
    public int TargetUserId { get; set; }

    public int? CarpoolId { get; set; }
}
