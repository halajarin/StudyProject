using System.ComponentModel.DataAnnotations;

namespace EcoRide.Backend.DTOs;

public class RegisterDTO
{
    [Required(ErrorMessage = "Le pseudo est requis")]
    [MinLength(3, ErrorMessage = "Le pseudo doit contenir au moins 3 caractères")]
    public string Pseudo { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'email est requis")]
    [EmailAddress(ErrorMessage = "Format d'email invalide")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le mot de passe est requis")]
    [MinLength(8, ErrorMessage = "Le mot de passe doit contenir au moins 8 caractères")]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
        ErrorMessage = "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial")]
    public string Password { get; set; } = string.Empty;

    public string? Nom { get; set; }
    public string? Prenom { get; set; }
}
