using EcoRide.Backend.Dtos.Enums;
using EcoRide.Backend.Dtos.Vehicle;
using FluentValidation;

namespace EcoRide.Backend.WebApi.Validators;

public class CreateVehicleDTOValidator : AbstractValidator<CreateVehicleDTO>
{
    public CreateVehicleDTOValidator()
    {
        RuleFor(x => x.Model)
            .NotEmpty().WithMessage("Model is required")
            .MaximumLength(50).WithMessage("Model must not exceed 50 characters");

        RuleFor(x => x.RegistrationNumber)
            .NotEmpty().WithMessage("Registration number is required")
            .MaximumLength(20).WithMessage("Registration number must not exceed 20 characters")
            .Matches(@"^[A-Z0-9-]+$").WithMessage("Registration number must contain only uppercase letters, numbers, and hyphens");

        RuleFor(x => x.EnergyType)
            .IsInEnum().WithMessage("Energy type must be one of: Gasoline, Diesel, Electric, Hybrid, LPG, CNG");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Color is required")
            .MaximumLength(30).WithMessage("Color must not exceed 30 characters");

        RuleFor(x => x.FirstRegistrationDate)
            .Must(BeValidRegistrationDate).WithMessage("First registration date cannot be in the future")
            .When(x => x.FirstRegistrationDate.HasValue);

        RuleFor(x => x.BrandId)
            .GreaterThan(0).WithMessage("Brand ID must be greater than 0");

        RuleFor(x => x.SeatCount)
            .InclusiveBetween(1, 8).WithMessage("Number of seats must be between 1 and 8");
    }

    private bool BeValidRegistrationDate(DateTime? date)
    {
        if (!date.HasValue)
            return true;

        return date.Value.Date <= DateTime.UtcNow.Date;
    }
}
