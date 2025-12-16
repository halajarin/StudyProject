using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using EcoRide.Backend.DTOs;
using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;
using EcoRide.Backend.Services;

namespace EcoRide.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CovoiturageController : ControllerBase
{
    private readonly ICovoiturageRepository _covoiturageRepository;
    private readonly IUtilisateurRepository _utilisateurRepository;
    private readonly IVoitureRepository _voitureRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<CovoiturageController> _logger;

    public CovoiturageController(
        ICovoiturageRepository covoiturageRepository,
        IUtilisateurRepository utilisateurRepository,
        IVoitureRepository voitureRepository,
        IEmailService emailService,
        ILogger<CovoiturageController> logger)
    {
        _covoiturageRepository = covoiturageRepository;
        _utilisateurRepository = utilisateurRepository;
        _voitureRepository = voitureRepository;
        _emailService = emailService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.Parse(userIdClaim!);
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
        var covoiturage = await _covoiturageRepository.GetByIdAsync(id);

        if (covoiturage == null)
        {
            return NotFound(new { message = "Covoiturage non trouvé" });
        }

        if (covoiturage.NbPlaceRestante <= 0)
        {
            return BadRequest(new { message = "Plus de place disponible" });
        }

        if (covoiturage.UtilisateurId == userId)
        {
            return BadRequest(new { message = "Vous ne pouvez pas participer à votre propre covoiturage" });
        }

        var utilisateur = await _utilisateurRepository.GetByIdAsync(userId);
        if (utilisateur == null || utilisateur.Credit < covoiturage.PrixPersonne)
        {
            return BadRequest(new { message = "Crédit insuffisant" });
        }

        // Vérifier si déjà participant
        var existingParticipation = await _covoiturageRepository.GetParticipationAsync(id, userId);
        if (existingParticipation != null)
        {
            return BadRequest(new { message = "Vous participez déjà à ce covoiturage" });
        }

        // Créer la participation
        var participation = new CovoiturageParticipation
        {
            CovoiturageId = id,
            UtilisateurId = userId,
            DateParticipation = DateTime.UtcNow,
            Statut = "Confirmé",
            CreditUtilise = (int)covoiturage.PrixPersonne
        };

        await _covoiturageRepository.AddParticipationAsync(participation);

        // Mettre à jour le crédit et le nombre de places
        utilisateur.Credit -= (int)covoiturage.PrixPersonne;
        await _utilisateurRepository.UpdateAsync(utilisateur);

        covoiturage.NbPlaceRestante--;
        await _covoiturageRepository.UpdateAsync(covoiturage);

        _logger.LogInformation($"Participation ajoutée: Utilisateur {userId} pour covoiturage {id}");

        return Ok(new { message = "Participation confirmée", creditRestant = utilisateur.Credit });
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
            covoiturage.Statut = "Annulé";
            await _covoiturageRepository.UpdateAsync(covoiturage);

            // Rembourser tous les participants et envoyer des emails
            var participations = await _covoiturageRepository.GetParticipationsAsync(id);
            foreach (var participation in participations)
            {
                if (participation.Statut == "Confirmé")
                {
                    var passager = await _utilisateurRepository.GetByIdAsync(participation.UtilisateurId);
                    if (passager != null)
                    {
                        passager.Credit += participation.CreditUtilise;
                        await _utilisateurRepository.UpdateAsync(passager);

                        // Envoyer email
                        var trajetInfo = $"{covoiturage.VilleDepart} → {covoiturage.VilleArrivee} le {covoiturage.DateDepart:dd/MM/yyyy}";
                        await _emailService.SendCovoiturageAnnulationAsync(passager.Email, passager.Pseudo, trajetInfo);
                    }
                }
            }

            return Ok(new { message = "Covoiturage annulé et participants remboursés" });
        }
        else
        {
            // Si c'est un passager qui annule
            var participation = await _covoiturageRepository.GetParticipationAsync(id, userId);
            if (participation == null)
            {
                return BadRequest(new { message = "Participation non trouvée" });
            }

            participation.Statut = "Annulé";
            await _covoiturageRepository.UpdateParticipationAsync(participation);

            // Rembourser et libérer la place
            var utilisateur = await _utilisateurRepository.GetByIdAsync(userId);
            if (utilisateur != null)
            {
                utilisateur.Credit += participation.CreditUtilise;
                await _utilisateurRepository.UpdateAsync(utilisateur);
            }

            covoiturage.NbPlaceRestante++;
            await _covoiturageRepository.UpdateAsync(covoiturage);

            return Ok(new { message = "Participation annulée et crédits remboursés" });
        }
    }

    [Authorize(Roles = "Chauffeur")]
    [HttpPost("{id}/start")]
    public async Task<IActionResult> Start(int id)
    {
        var userId = GetCurrentUserId();
        var covoiturage = await _covoiturageRepository.GetByIdAsync(id);

        if (covoiturage == null)
        {
            return NotFound(new { message = "Covoiturage non trouvé" });
        }

        if (covoiturage.UtilisateurId != userId)
        {
            return Forbid();
        }

        covoiturage.Statut = "En cours";
        await _covoiturageRepository.UpdateAsync(covoiturage);

        return Ok(new { message = "Covoiturage démarré" });
    }

    [Authorize(Roles = "Chauffeur")]
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(int id)
    {
        var userId = GetCurrentUserId();
        var covoiturage = await _covoiturageRepository.GetByIdAsync(id);

        if (covoiturage == null)
        {
            return NotFound(new { message = "Covoiturage non trouvé" });
        }

        if (covoiturage.UtilisateurId != userId)
        {
            return Forbid();
        }

        covoiturage.Statut = "Terminé";
        await _covoiturageRepository.UpdateAsync(covoiturage);

        // Envoyer des emails aux participants
        var participations = await _covoiturageRepository.GetParticipationsAsync(id);
        foreach (var participation in participations)
        {
            if (participation.Statut == "Confirmé")
            {
                var passager = await _utilisateurRepository.GetByIdAsync(participation.UtilisateurId);
                if (passager != null)
                {
                    await _emailService.SendCovoiturageTermineAsync(passager.Email, passager.Pseudo, id);
                }
            }
        }

        return Ok(new { message = "Covoiturage terminé. Les participants ont été notifiés." });
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
