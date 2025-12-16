using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.DTOs;
using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;
using EcoRide.Backend.Services;

namespace EcoRide.Backend.Controllers;

[Route("api/[controller]")]
public class CovoiturageController : BaseController
{
    private readonly ICovoiturageRepository _covoiturageRepository;
    private readonly IUtilisateurRepository _utilisateurRepository;
    private readonly IVoitureRepository _voitureRepository;
    private readonly ICovoiturageService _covoiturageService;
    private readonly ILogger<CovoiturageController> _logger;

    public CovoiturageController(
        ICovoiturageRepository covoiturageRepository,
        IUtilisateurRepository utilisateurRepository,
        IVoitureRepository voitureRepository,
        ICovoiturageService covoiturageService,
        ILogger<CovoiturageController> logger)
    {
        _covoiturageRepository = covoiturageRepository;
        _utilisateurRepository = utilisateurRepository;
        _voitureRepository = voitureRepository;
        _covoiturageService = covoiturageService;
        _logger = logger;
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] SearchCovoiturageDTO searchDto)
    {
        var covoiturages = await _covoiturageRepository.SearchAsync(searchDto);

        var result = new List<CovoiturageDTO>();
        foreach (var cov in covoiturages)
        {
            var noteMoyenne = await _utilisateurRepository.GetAverageRatingAsync(cov.UtilisateurId);

            // Filtrer par note si demandé
            if (searchDto.NoteMinimale.HasValue && noteMoyenne < searchDto.NoteMinimale.Value)
            {
                continue;
            }

            result.Add(new CovoiturageDTO
            {
                CovoiturageId = cov.CovoiturageId,
                DateDepart = cov.DateDepart,
                HeureDepart = cov.HeureDepart,
                LieuDepart = cov.LieuDepart,
                VilleDepart = cov.VilleDepart,
                DateArrivee = cov.DateArrivee,
                HeureArrivee = cov.HeureArrivee,
                LieuArrivee = cov.LieuArrivee,
                VilleArrivee = cov.VilleArrivee,
                Statut = cov.Statut,
                NbPlace = cov.NbPlace,
                NbPlaceRestante = cov.NbPlaceRestante,
                PrixPersonne = cov.PrixPersonne,
                DureeEstimeeMinutes = cov.DureeEstimeeMinutes,
                EstEcologique = cov.Voiture.Energie.ToLower() == "electrique",
                PseudoChauffeur = cov.Chauffeur.Pseudo,
                PhotoChauffeur = cov.Chauffeur.Photo,
                NoteMoyenneChauffeur = noteMoyenne,
                ModeleVoiture = cov.Voiture.Modele,
                MarqueVoiture = cov.Voiture.Marque.Libelle,
                EnergieVoiture = cov.Voiture.Energie,
                CouleurVoiture = cov.Voiture.Couleur
            });
        }

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var covoiturage = await _covoiturageRepository.GetByIdAsync(id);
        if (covoiturage == null)
        {
            return NotFound(new { message = "Covoiturage non trouvé" });
        }

        var noteMoyenne = await _utilisateurRepository.GetAverageRatingAsync(covoiturage.UtilisateurId);

        var result = new CovoiturageDTO
        {
            CovoiturageId = covoiturage.CovoiturageId,
            DateDepart = covoiturage.DateDepart,
            HeureDepart = covoiturage.HeureDepart,
            LieuDepart = covoiturage.LieuDepart,
            VilleDepart = covoiturage.VilleDepart,
            DateArrivee = covoiturage.DateArrivee,
            HeureArrivee = covoiturage.HeureArrivee,
            LieuArrivee = covoiturage.LieuArrivee,
            VilleArrivee = covoiturage.VilleArrivee,
            Statut = covoiturage.Statut,
            NbPlace = covoiturage.NbPlace,
            NbPlaceRestante = covoiturage.NbPlaceRestante,
            PrixPersonne = covoiturage.PrixPersonne,
            DureeEstimeeMinutes = covoiturage.DureeEstimeeMinutes,
            EstEcologique = covoiturage.Voiture.Energie.ToLower() == "electrique",
            PseudoChauffeur = covoiturage.Chauffeur.Pseudo,
            PhotoChauffeur = covoiturage.Chauffeur.Photo,
            NoteMoyenneChauffeur = noteMoyenne,
            ModeleVoiture = covoiturage.Voiture.Modele,
            MarqueVoiture = covoiturage.Voiture.Marque.Libelle,
            EnergieVoiture = covoiturage.Voiture.Energie,
            CouleurVoiture = covoiturage.Voiture.Couleur
        };

        return Ok(result);
    }

    [Authorize(Roles = "Chauffeur")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCovoiturageDTO createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();

        // Vérifier que la voiture appartient à l'utilisateur
        var voiture = await _voitureRepository.GetByIdAsync(createDto.VoitureId);
        if (voiture == null || voiture.UtilisateurId != userId)
        {
            return BadRequest(new { message = "Voiture non trouvée ou non autorisée" });
        }

        var covoiturage = new Covoiturage
        {
            DateDepart = createDto.DateDepart,
            HeureDepart = createDto.HeureDepart,
            LieuDepart = createDto.LieuDepart,
            VilleDepart = createDto.VilleDepart,
            DateArrivee = createDto.DateArrivee,
            HeureArrivee = createDto.HeureArrivee,
            LieuArrivee = createDto.LieuArrivee,
            VilleArrivee = createDto.VilleArrivee,
            NbPlace = createDto.NbPlace,
            NbPlaceRestante = createDto.NbPlace,
            PrixPersonne = createDto.PrixPersonne,
            VoitureId = createDto.VoitureId,
            UtilisateurId = userId,
            DureeEstimeeMinutes = createDto.DureeEstimeeMinutes,
            Statut = "En attente",
            DateCreation = DateTime.UtcNow
        };

        var created = await _covoiturageRepository.CreateAsync(covoiturage);
        _logger.LogInformation($"Nouveau covoiturage créé: {created.CovoiturageId}");

        return CreatedAtAction(nameof(GetById), new { id = created.CovoiturageId }, created);
    }

    [Authorize]
    [HttpPost("{id}/participate")]
    public async Task<IActionResult> Participate(int id)
    {
        var userId = GetCurrentUserId();
        var (success, message, creditRestant) = await _covoiturageService.ParticiperAsync(id, userId);

        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message, creditRestant });
    }

    [Authorize]
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var userId = GetCurrentUserId();
        var covoiturage = await _covoiturageRepository.GetByIdAsync(id);

        if (covoiturage == null)
        {
            return NotFound(new { message = "Covoiturage non trouvé" });
        }

        // Si c'est le chauffeur qui annule
        if (covoiturage.UtilisateurId == userId)
        {
            var (success, message) = await _covoiturageService.AnnulerCovoiturageAsync(id, userId);
            return success ? Ok(new { message }) : BadRequest(new { message });
        }
        else
        {
            // Si c'est un passager qui annule
            var (success, message) = await _covoiturageService.AnnulerParticipationAsync(id, userId);
            return success ? Ok(new { message }) : BadRequest(new { message });
        }
    }

    [Authorize(Roles = "Chauffeur")]
    [HttpPost("{id}/start")]
    public async Task<IActionResult> Start(int id)
    {
        var userId = GetCurrentUserId();
        var (success, message) = await _covoiturageService.DemarrerCovoiturageAsync(id, userId);
        return success ? Ok(new { message }) : BadRequest(new { message });
    }

    [Authorize(Roles = "Chauffeur")]
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(int id)
    {
        var userId = GetCurrentUserId();
        var (success, message) = await _covoiturageService.TerminerCovoiturageAsync(id, userId);
        return success ? Ok(new { message }) : BadRequest(new { message });
    }

    [Authorize]
    [HttpGet("my-trips")]
    public async Task<IActionResult> GetMyTrips()
    {
        var userId = GetCurrentUserId();

        var asDriver = await _covoiturageRepository.GetByDriverAsync(userId);
        var asPassenger = await _covoiturageRepository.GetByPassengerAsync(userId);

        return Ok(new
        {
            asDriver,
            asPassenger
        });
    }
}
