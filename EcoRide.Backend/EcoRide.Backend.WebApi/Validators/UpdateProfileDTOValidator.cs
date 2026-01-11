using EcoRide.Backend.Dtos.User;
using FluentValidation;

namespace EcoRide.Backend.WebApi.Validators;

public class UpdateProfileDTOValidator : AbstractValidator<UpdateProfileDTO>
{
    public UpdateProfileDTOValidator()
    {
        RuleFor(x => x.FirstName)
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.FirstName));

        RuleFor(x => x.LastName)
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.LastName));

        RuleFor(x => x.Phone)
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number must be in valid international format")
            .When(x => !string.IsNullOrEmpty(x.Phone));

        RuleFor(x => x.Address)
            .MaximumLength(200).WithMessage("Address must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Address));

        RuleFor(x => x.BirthDate)
            .Must(BeValidAge).WithMessage("You must be at least 18 years old")
            .When(x => x.BirthDate.HasValue);

        RuleFor(x => x.Photo)
            .Must(BeValidImageSize).WithMessage("Photo size must not exceed 5MB")
            .When(x => x.Photo != null && x.Photo.Length > 0);
    }

    private bool BeValidAge(DateTime? birthDate)
    {
        if (!birthDate.HasValue)
            return true;

        var age = DateTime.UtcNow.Year - birthDate.Value.Year;
        if (birthDate.Value.Date > DateTime.UtcNow.AddYears(-age))
            age--;

        return age >= 18;
    }

    private bool BeValidImageSize(byte[]? photo)
    {
        if (photo == null)
            return true;

        const int maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        return photo.Length <= maxSizeInBytes;
    }
}
