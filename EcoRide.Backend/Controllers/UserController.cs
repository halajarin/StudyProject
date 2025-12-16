using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.DTOs;
using EcoRide.Backend.Repositories;
using EcoRide.Backend.Services;

namespace EcoRide.Backend.Controllers;

[Route("api/[controller]")]
[Authorize]
public class UserController : BaseController
{
    private readonly IUtilisateurRepository _utilisateurRepository;
    private readonly IVoitureRepository _voitureRepository;
    private readonly IPreferenceService _preferenceService;
    private readonly ILogger<UserController> _logger;

    public UserController(
        IUtilisateurRepository utilisateurRepository,
        IVoitureRepository voitureRepository,
        IPreferenceService preferenceService,
        ILogger<UserController> logger)
    {
        _utilisateurRepository = utilisateurRepository;
        _voitureRepository = voitureRepository;
        _preferenceService = preferenceService;
        _logger = logger;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var utilisateur = await _utilisateurRepository.GetByIdAsync(userId);

        if (utilisateur == null)
        {
            return NotFound(new { message = "Utilisateur non trouvé" });
        }

        var roles = await _utilisateurRepository.GetUserRolesAsync(userId);
        var noteMoyenne = await _utilisateurRepository.GetAverageRatingAsync(userId);
        var nombreAvis = await _utilisateurRepository.GetRatingCountAsync(userId);

        var profile = new UserProfileDTO
        {
            UtilisateurId = utilisateur.UtilisateurId,
            Pseudo = utilisateur.Pseudo,
            Email = utilisateur.Email,
            Nom = utilisateur.Nom,
            Prenom = utilisateur.Prenom,
            Telephone = utilisateur.Telephone,
            Adresse = utilisateur.Adresse,
            DateNaissance = utilisateur.DateNaissance,
            Photo = utilisateur.Photo,
            Credit = utilisateur.Credit,
            Roles = roles,
            NoteMoyenne = noteMoyenne,
            NombreAvis = nombreAvis
        };

        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO updateDto)
    {
        var userId = GetCurrentUserId();
        var utilisateur = await _utilisateurRepository.GetByIdAsync(userId);

        if (utilisateur == null)
        {
            return NotFound(new { message = "Utilisateur non trouvé" });
        }

        utilisateur.Nom = updateDto.Nom ?? utilisateur.Nom;
        utilisateur.Prenom = updateDto.Prenom ?? utilisateur.Prenom;
        utilisateur.Telephone = updateDto.Telephone ?? utilisateur.Telephone;
        utilisateur.Adresse = updateDto.Adresse ?? utilisateur.Adresse;
        utilisateur.DateNaissance = updateDto.DateNaissance ?? utilisateur.DateNaissance;
        utilisateur.Photo = updateDto.Photo ?? utilisateur.Photo;

        await _utilisateurRepository.UpdateAsync(utilisateur);

        return Ok(new { message = "Profil mis à jour avec succès" });
    }

    [HttpPost("add-role/{roleId}")]
    public async Task<IActionResult> AddRole(int roleId)
    {
        var userId = GetCurrentUserId();
        var roles = await _utilisateurRepository.GetUserRolesAsync(userId);

        // Empêcher l'ajout de rôles Employé ou Administrateur
        if (roleId == 3 || roleId == 4)
        {
            return Forbid();
        }

        await _utilisateurRepository.AddUserRoleAsync(userId, roleId);
        _logger.LogInformation($"Rôle {roleId} ajouté à l'utilisateur {userId}");

        return Ok(new { message = "Rôle ajouté avec succès" });
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles()
    {
        var userId = GetCurrentUserId();
        var voitures = await _voitureRepository.GetByUtilisateurAsync(userId);

        var result = voitures.Select(v => new VoitureDTO
        {
            VoitureId = v.VoitureId,
            Modele = v.Modele,
            Immatriculation = v.Immatriculation,
            Energie = v.Energie,
            Couleur = v.Couleur,
            DatePremiereImmatriculation = v.DatePremiereImmatriculation,
            MarqueId = v.MarqueId,
            MarqueLibelle = v.Marque.Libelle,
            NombrePlaces = v.NombrePlaces
        }).ToList();

        return Ok(result);
    }

    [HttpPost("vehicles")]
    public async Task<IActionResult> AddVehicle([FromBody] CreateVoitureDTO createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();

        var voiture = new Models.Voiture
        {
            Modele = createDto.Modele,
            Immatriculation = createDto.Immatriculation,
            Energie = createDto.Energie,
            Couleur = createDto.Couleur,
            DatePremiereImmatriculation = createDto.DatePremiereImmatriculation,
            MarqueId = createDto.MarqueId,
            UtilisateurId = userId,
            NombrePlaces = createDto.NombrePlaces
        };

        var created = await _voitureRepository.CreateAsync(voiture);
        _logger.LogInformation($"Nouvelle voiture ajoutée: {created.VoitureId}");

        return CreatedAtAction(nameof(GetVehicles), new { id = created.VoitureId }, created);
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences()
    {
        var userId = GetCurrentUserId();
        var preferences = await _preferenceService.GetPreferencesAsync(userId);

        return Ok(preferences ?? new { });
    }

    [HttpPost("preferences")]
    public async Task<IActionResult> SavePreferences([FromBody] Dictionary<string, object> preferences)
    {
        var userId = GetCurrentUserId();
        await _preferenceService.CreateOrUpdatePreferencesAsync(userId, preferences);

        return Ok(new { message = "Préférences enregistrées avec succès" });
    }
}
