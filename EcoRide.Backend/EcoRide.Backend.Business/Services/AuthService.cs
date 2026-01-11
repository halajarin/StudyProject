using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EcoRide.Backend.Business.Services.Interfaces;
using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.Dtos.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace EcoRide.Backend.Business.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<(User? user, string? token)> RegisterAsync(RegisterDTO registerDto)
    {
        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(registerDto.Email))
        {
            return (null, null);
        }

        // Check if username already exists
        if (await _userRepository.UsernameExistsAsync(registerDto.Username))
        {
            return (null, null);
        }

        // Create user
        var user = new User
        {
            Username = registerDto.Username,
            Email = registerDto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(registerDto.Password),
            LastName = registerDto.LastName ?? string.Empty,
            FirstName = registerDto.FirstName ?? string.Empty,
            Credits = 20, // 20 credits on creation
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var createdUser = await _userRepository.CreateAsync(user);

        // Add Passenger role by default (RoleId = 1)
        await _userRepository.AddUserRoleAsync(createdUser.UserId, 1);

        // Get roles for token
        var roles = await _userRepository.GetUserRolesAsync(createdUser.UserId);

        // Generate JWT token
        var token = GenerateJwtToken(createdUser, roles);

        return (createdUser, token);
    }

    public async Task<(User? user, string? token)> LoginAsync(LoginDTO loginDto)
    {
        var user = await _userRepository.GetByEmailAsync(loginDto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.Password))
        {
            return (null, null);
        }

        if (!user.IsActive)
        {
            return (null, null);
        }

        var roles = await _userRepository.GetUserRolesAsync(user.UserId);
        var token = GenerateJwtToken(user, roles);

        return (user, token);
    }

    public async Task<string> RefreshTokenAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        var roles = await _userRepository.GetUserRolesAsync(userId);
        return GenerateJwtToken(user, roles);
    }

    private string GenerateJwtToken(User user, List<string> roles)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Username)
        };

        // Add roles as claims
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(double.Parse(jwtSettings["ExpirationInMinutes"]!)),
            Issuer = jwtSettings["Issuer"],
            Audience = jwtSettings["Audience"],
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(secretKey),
                SecurityAlgorithms.HmacSha256Signature
            )
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}
