using EcoRide.Backend.Dtos.Review;
using FluentValidation;

namespace EcoRide.Backend.WebApi.Validators;

public class CreateReviewDTOValidator : AbstractValidator<CreateReviewDTO>
{
    public CreateReviewDTOValidator()
    {
        RuleFor(x => x.Comment)
            .NotEmpty().WithMessage("Comment is required")
            .MinimumLength(10).WithMessage("Comment must be at least 10 characters")
            .MaximumLength(500).WithMessage("Comment must not exceed 500 characters");

        RuleFor(x => x.Note)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5");

        RuleFor(x => x.TargetUserId)
            .GreaterThan(0).WithMessage("Target user ID must be greater than 0");

        RuleFor(x => x.CarpoolId)
            .GreaterThan(0).WithMessage("Carpool ID must be greater than 0")
            .When(x => x.CarpoolId.HasValue);
    }
}
