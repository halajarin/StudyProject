using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ParticipationController : ControllerBase
{
    private readonly ICovoiturageRepository _covoiturageRepository;
    private readonly IUtilisateurRepository _utilisateurRepository;
    private readonly ILogger<ParticipationController> _logger;

    public ParticipationController(
        ICovoiturageRepository covoiturageRepository,
        IUtilisateurRepository utilisateurRepository,
        ILogger<ParticipationController> logger)
    {
        _covoiturageRepository = covoiturageRepository;
        _utilisateurRepository = utilisateurRepository;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
    }

    [HttpPost("{covoiturageId}/validate")]
    public async Task<IActionResult> ValidateTrip(int covoiturageId, [FromBody] ValidateTripDTO validateDto)
    {
        var userId = GetCurrentUserId();
        var participation = await _covoiturageRepository.GetParticipationAsync(covoiturageId, userId);

        if (participation == null)
        {
            return NotFound(new { message = "Participation non trouvée" });
        }

        if (validateDto.TrajetOk)
        {
            participation.TrajetValide = true;
            participation.Statut = "Validé";

            // Créditer le chauffeur
            var covoiturage = await _covoiturageRepository.GetByIdAsync(covoiturageId);
            if (covoiturage != null)
            {
                var chauffeur = await _utilisateurRepository.GetByIdAsync(covoiturage.UtilisateurId);
                if (chauffeur != null)
                {
                    // Le chauffeur reçoit le prix - 2 crédits (commission plateforme)
                    var creditChauffeur = (int)covoiturage.PrixPersonne - 2;
                    chauffeur.Credit += creditChauffeur;
                    await _utilisateurRepository.UpdateAsync(chauffeur);
                }
            }
        }
        else
        {
            participation.TrajetValide = false;
            participation.CommentaireProbleme = validateDto.Commentaire;
        }

        await _covoiturageRepository.UpdateParticipationAsync(participation);
        _logger.LogInformation($"Trajet {(validateDto.TrajetOk ? "validé" : "signalé")} pour participation {participation.ParticipationId}");

        return Ok(new { message = validateDto.TrajetOk ? "Trajet validé" : "Problème signalé" });
    }

    [Authorize(Roles = "Employe,Administrateur")]
    [HttpGet("problemes")]
    public async Task<IActionResult> GetProblematicTrips()
    {
        // Cette fonctionnalité nécessiterait une méthode dans le repository
        // Pour l'instant, retournons une liste vide
        return Ok(new List<object>());
    }
}

public class ValidateTripDTO
{
    public bool TrajetOk { get; set; }
    public string? Commentaire { get; set; }
}
