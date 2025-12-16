using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.DTOs;
using EcoRide.Backend.Services;

namespace EcoRide.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
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

        return Ok(new
        {
            message = "Registration successful",
            user = new
            {
                user.UserId,
                user.Pseudo,
                user.Email,
                user.Credit
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

        return Ok(new
        {
            message = "Login successful",
            user = new
            {
                user.UserId,
                user.Pseudo,
                user.Email,
                user.Credit
            },
            token
        });
    }
}
