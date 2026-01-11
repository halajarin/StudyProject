using EcoRide.Backend.Dtos.Carpool;
using FluentValidation;

namespace EcoRide.Backend.WebApi.Validators;

public class CreateCarpoolDTOValidator : AbstractValidator<CreateCarpoolDTO>
{
    public CreateCarpoolDTOValidator()
    {
        RuleFor(x => x.DepartureCity)
            .NotEmpty().WithMessage("Departure city is required")
            .MaximumLength(100).WithMessage("Departure city must not exceed 100 characters");

        RuleFor(x => x.DepartureLocation)
            .NotEmpty().WithMessage("Departure location is required")
            .MaximumLength(200).WithMessage("Departure location must not exceed 200 characters");

        RuleFor(x => x.ArrivalCity)
            .NotEmpty().WithMessage("Arrival city is required")
            .MaximumLength(100).WithMessage("Arrival city must not exceed 100 characters");

        RuleFor(x => x.ArrivalLocation)
            .NotEmpty().WithMessage("Arrival location is required")
            .MaximumLength(200).WithMessage("Arrival location must not exceed 200 characters");

        RuleFor(x => x.DepartureDate)
            .NotEmpty().WithMessage("Departure date is required")
            .Must(BeInFuture).WithMessage("Departure date must be in the future");

        RuleFor(x => x.DepartureTime)
            .NotEmpty().WithMessage("Departure time is required");

        RuleFor(x => x.ArrivalDate)
            .NotEmpty().WithMessage("Arrival date is required")
            .GreaterThanOrEqualTo(x => x.DepartureDate).WithMessage("Arrival date must be after or equal to departure date");

        RuleFor(x => x.ArrivalTime)
            .NotEmpty().WithMessage("Arrival time is required");

        RuleFor(x => x.TotalSeats)
            .InclusiveBetween(1, 8).WithMessage("Number of seats must be between 1 and 8");

        RuleFor(x => x.PricePerPerson)
            .GreaterThanOrEqualTo(2).WithMessage("Price per person must be at least 2 credits (platform commission)");

        RuleFor(x => x.VehicleId)
            .GreaterThan(0).WithMessage("Vehicle ID must be greater than 0");

        RuleFor(x => x.EstimatedDurationMinutes)
            .GreaterThan(0).WithMessage("Estimated duration must be greater than 0")
            .When(x => x.EstimatedDurationMinutes.HasValue);
    }

    private bool BeInFuture(DateTime date)
    {
        return date.Date >= DateTime.UtcNow.Date;
    }
}
