using EcoRide.Backend.DTOs;
using EcoRide.Backend.Models;

namespace EcoRide.Backend.Services;

public interface IAuthService
{
    Task<(User? user, string? token)> RegisterAsync(RegisterDTO registerDto);
    Task<(User? user, string? token)> LoginAsync(LoginDTO loginDto);
    string GenerateJwtToken(User user, List<string> roles);
}
