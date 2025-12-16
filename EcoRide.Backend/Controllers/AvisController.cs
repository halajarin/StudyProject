using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.DTOs;
using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Controllers;

[Route("api/[controller]")]
[Authorize]
public class AvisController : BaseController
{
    private readonly IAvisRepository _avisRepository;
    private readonly IUtilisateurRepository _utilisateurRepository;
    private readonly ICovoiturageRepository _covoiturageRepository;
    private readonly ILogger<AvisController> _logger;

    public AvisController(
        IAvisRepository avisRepository,
        IUtilisateurRepository utilisateurRepository,
        ICovoiturageRepository covoiturageRepository,
        ILogger<AvisController> logger)
    {
        _avisRepository = avisRepository;
        _utilisateurRepository = utilisateurRepository;
        _covoiturageRepository = covoiturageRepository;
        _logger = logger;
    }

    [HttpGet("user/{utilisateurId}")]
    public async Task<IActionResult> GetByUser(int utilisateurId)
    {
        var avis = await _avisRepository.GetByUtilisateurCibleAsync(utilisateurId, "Validé");

        var result = avis.Select(a => new AvisDTO
        {
            AvisId = a.AvisId,
            Commentaire = a.Commentaire,
            Note = a.Note,
            Statut = a.Statut,
            DateCreation = a.DateCreation,
            PseudoAuteur = a.UtilisateurAuteur.Pseudo,
            PseudoCible = a.UtilisateurCible.Pseudo
        }).ToList();

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAvisDTO createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();

        // Vérifier que l'utilisateur a participé au covoiturage
        if (createDto.CovoiturageId.HasValue)
        {
            var participation = await _covoiturageRepository.GetParticipationAsync(
                createDto.CovoiturageId.Value,
                userId
            );

            if (participation == null)
            {
                return BadRequest(new { message = "Vous devez avoir participé au covoiturage pour laisser un avis" });
            }

            if (participation.TrajetValide != true)
            {
                return BadRequest(new { message = "Vous devez d'abord valider le trajet" });
            }
        }

        var avis = new Avis
        {
            Commentaire = createDto.Commentaire,
            Note = createDto.Note,
            UtilisateurAuteurId = userId,
            UtilisateurCibleId = createDto.UtilisateurCibleId,
            CovoiturageId = createDto.CovoiturageId,
            Statut = "En attente",
            DateCreation = DateTime.UtcNow
        };

        var created = await _avisRepository.CreateAsync(avis);
        _logger.LogInformation($"Nouvel avis créé: {created.AvisId}");

        return CreatedAtAction(nameof(GetByUser), new { utilisateurId = createDto.UtilisateurCibleId }, created);
    }

    [Authorize(Roles = "Employe,Administrateur")]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var avis = await _avisRepository.GetPendingAvisAsync();

        var result = avis.Select(a => new AvisDTO
        {
            AvisId = a.AvisId,
            Commentaire = a.Commentaire,
            Note = a.Note,
            Statut = a.Statut,
            DateCreation = a.DateCreation,
            PseudoAuteur = a.UtilisateurAuteur.Pseudo,
            PseudoCible = a.UtilisateurCible.Pseudo
        }).ToList();

        return Ok(result);
    }

    [Authorize(Roles = "Employe,Administrateur")]
    [HttpPut("{id}/validate")]
    public async Task<IActionResult> Validate(int id)
    {
        var avis = await _avisRepository.GetByIdAsync(id);
        if (avis == null)
        {
            return NotFound(new { message = "Avis non trouvé" });
        }

        avis.Statut = "Validé";
        await _avisRepository.UpdateAsync(avis);

        _logger.LogInformation($"Avis {id} validé");
        return Ok(new { message = "Avis validé" });
    }

    [Authorize(Roles = "Employe,Administrateur")]
    [HttpPut("{id}/reject")]
    public async Task<IActionResult> Reject(int id)
    {
        var avis = await _avisRepository.GetByIdAsync(id);
        if (avis == null)
        {
            return NotFound(new { message = "Avis non trouvé" });
        }

        avis.Statut = "Refusé";
        await _avisRepository.UpdateAsync(avis);

        _logger.LogInformation($"Avis {id} refusé");
        return Ok(new { message = "Avis refusé" });
    }
}
