using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrateur")]
public class AdminController : ControllerBase
{
    private readonly IUtilisateurRepository _utilisateurRepository;
    private readonly ICovoiturageRepository _covoiturageRepository;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IUtilisateurRepository utilisateurRepository,
        ICovoiturageRepository covoiturageRepository,
        ILogger<AdminController> logger)
    {
        _utilisateurRepository = utilisateurRepository;
        _covoiturageRepository = covoiturageRepository;
        _logger = logger;
    }

    [HttpPost("create-employee")]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDTO employeeDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Vérifier si l'email existe déjà
        if (await _utilisateurRepository.EmailExistsAsync(employeeDto.Email))
        {
            return BadRequest(new { message = "L'email existe déjà" });
        }

        var employee = new Utilisateur
        {
            Pseudo = employeeDto.Pseudo,
            Email = employeeDto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(employeeDto.Password),
            Nom = employeeDto.Nom ?? string.Empty,
            Prenom = employeeDto.Prenom ?? string.Empty,
            Credit = 0,
            DateCreation = DateTime.UtcNow,
            EstActif = true
        };

        var created = await _utilisateurRepository.CreateAsync(employee);

        // Ajouter le rôle Employé (RoleId = 3)
        await _utilisateurRepository.AddUserRoleAsync(created.UtilisateurId, 3);

        _logger.LogInformation($"Nouvel employé créé: {created.Email}");

        return Ok(new { message = "Employé créé avec succès", utilisateurId = created.UtilisateurId });
    }

    [HttpPut("suspend-user/{userId}")]
    public async Task<IActionResult> SuspendUser(int userId)
    {
        var utilisateur = await _utilisateurRepository.GetByIdAsync(userId);
        if (utilisateur == null)
        {
            return NotFound(new { message = "Utilisateur non trouvé" });
        }

        utilisateur.EstActif = false;
        await _utilisateurRepository.UpdateAsync(utilisateur);

        _logger.LogInformation($"Utilisateur {userId} suspendu");

        return Ok(new { message = "Utilisateur suspendu" });
    }

    [HttpPut("activate-user/{userId}")]
    public async Task<IActionResult> ActivateUser(int userId)
    {
        var utilisateur = await _utilisateurRepository.GetByIdAsync(userId);
        if (utilisateur == null)
        {
            return NotFound(new { message = "Utilisateur non trouvé" });
        }

        utilisateur.EstActif = true;
        await _utilisateurRepository.UpdateAsync(utilisateur);

        _logger.LogInformation($"Utilisateur {userId} activé");

        return Ok(new { message = "Utilisateur activé" });
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var covoituragesCount = await _covoiturageRepository.GetCovoituragesCountByDateAsync(start, end);
        var platformCredits = await _covoiturageRepository.GetPlatformCreditsEarnedByDateAsync(start, end);

        var totalCredits = platformCredits.Values.Sum();

        return Ok(new
        {
            covoituragesParJour = covoituragesCount,
            creditsParJour = platformCredits,
            totalCreditsGagnes = totalCredits
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var utilisateurs = await _utilisateurRepository.GetAllAsync();

        var result = utilisateurs.Select(u => new
        {
            u.UtilisateurId,
            u.Pseudo,
            u.Email,
            u.Nom,
            u.Prenom,
            u.EstActif,
            u.Credit,
            u.DateCreation,
            Roles = u.UtilisateurRoles.Select(ur => ur.Role.Libelle).ToList()
        }).ToList();

        return Ok(result);
    }
}

public class CreateEmployeeDTO
{
    public string Pseudo { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
}
