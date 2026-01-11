using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.Dtos.Auth;
using EcoRide.Backend.Business.Services.Interfaces;
using EcoRide.Backend.Data.Repositories.Interfaces;

namespace EcoRide.Backend.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, IUserRepository userRepository, ILogger<AuthController> logger)
    {
        _authService = authService;
        _userRepository = userRepository;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (user, token) = await _authService.RegisterAsync(registerDto);

        if (user == null || token == null)
        {
            return BadRequest(new { message = "Email or username already exists" });
        }

        _logger.LogInformation($"New user created: {user.Email}");

        // Get user roles
        var roles = await _userRepository.GetUserRolesAsync(user.UserId);

        return Ok(new
        {
            message = "Registration successful",
            user = new
            {
                user.UserId,
                user.Username,
                user.Email,
                user.Credits,
                roles,
                averageRating = 0.0,
                reviewCount = 0
            },
            token
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var (user, token) = await _authService.LoginAsync(loginDto);

        if (user == null || token == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        _logger.LogInformation($"Successful login for: {user.Email}");

        // Get user roles and stats
        var roles = await _userRepository.GetUserRolesAsync(user.UserId);
        var averageRating = await _userRepository.GetAverageRatingAsync(user.UserId);
        var reviewCount = await _userRepository.GetRatingCountAsync(user.UserId);

        return Ok(new
        {
            message = "Login successful",
            user = new
            {
                user.UserId,
                user.Username,
                user.Email,
                user.Credits,
                roles,
                averageRating,
                reviewCount
            },
            token
        });
    }
}
