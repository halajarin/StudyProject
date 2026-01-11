using EcoRide.Backend.Dtos.Carpool;
using FluentValidation;

namespace EcoRide.Backend.WebApi.Validators;

public class SearchCarpoolDTOValidator : AbstractValidator<SearchCarpoolDTO>
{
    public SearchCarpoolDTOValidator()
    {
        RuleFor(x => x.DepartureCity)
            .NotEmpty().WithMessage("Departure city is required")
            .MaximumLength(100).WithMessage("Departure city must not exceed 100 characters");

        RuleFor(x => x.ArrivalCity)
            .NotEmpty().WithMessage("Arrival city is required")
            .MaximumLength(100).WithMessage("Arrival city must not exceed 100 characters");

        // DepartureDate is optional, no validation needed

        RuleFor(x => x.MaxPrice)
            .GreaterThan(0).WithMessage("Max price must be greater than 0")
            .When(x => x.MaxPrice.HasValue);

        RuleFor(x => x.MaxDurationMinutes)
            .GreaterThan(0).WithMessage("Max duration must be greater than 0")
            .When(x => x.MaxDurationMinutes.HasValue);

        RuleFor(x => x.MinimumRating)
            .InclusiveBetween(1, 5).WithMessage("Minimum rating must be between 1 and 5")
            .When(x => x.MinimumRating.HasValue);
    }
}
