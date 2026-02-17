using System.ComponentModel.DataAnnotations;

namespace EcoRide.Backend.Dtos.User;

public class DeactivateAccountDTO
{
    [Required(ErrorMessage = "Password is required for account deletion")]
    public string Password { get; set; } = string.Empty;
}
