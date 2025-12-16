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
            return BadRequest(new { message = "L'email ou le pseudo existe déjà" });
        }

        _logger.LogInformation($"Nouvel utilisateur créé: {user.Email}");

        return Ok(new
        {
            message = "Inscription réussie",
            user = new
            {
                user.UtilisateurId,
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
            return Unauthorized(new { message = "Email ou mot de passe incorrect" });
        }

        _logger.LogInformation($"Connexion réussie pour: {user.Email}");

        return Ok(new
        {
            message = "Connexion réussie",
            user = new
            {
                user.UtilisateurId,
                user.Pseudo,
                user.Email,
                user.Credit
            },
            token
        });
    }
}
