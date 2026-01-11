using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Dtos.Auth;

namespace EcoRide.Backend.Business.Services.Interfaces;

public interface IAuthService
{
    Task<(User? user, string? token)> RegisterAsync(RegisterDTO registerDto);
    Task<(User? user, string? token)> LoginAsync(LoginDTO loginDto);
    Task<string> RefreshTokenAsync(int userId);
}
