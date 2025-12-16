using EcoRide.Backend.DTOs;
using EcoRide.Backend.Models;

namespace EcoRide.Backend.Services;

public interface IAuthService
{
    Task<(Utilisateur? user, string? token)> RegisterAsync(RegisterDTO registerDto);
    Task<(Utilisateur? user, string? token)> LoginAsync(LoginDTO loginDto);
    string GenerateJwtToken(Utilisateur utilisateur, List<string> roles);
}
