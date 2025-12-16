using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Services;

public class CovoiturageService : ICovoiturageService
{
    private readonly ICovoiturageRepository _covoiturageRepository;
    private readonly IUtilisateurRepository _utilisateurRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<CovoiturageService> _logger;

    public CovoiturageService(
        ICovoiturageRepository covoiturageRepository,
        IUtilisateurRepository utilisateurRepository,
        IEmailService emailService,
        ILogger<CovoiturageService> logger)
    {
        _covoiturageRepository = covoiturageRepository;
        _utilisateurRepository = utilisateurRepository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, int? CreditRestant)> ParticiperAsync(int covoiturageId, int utilisateurId)
    {
        var covoiturage = await _covoiturageRepository.GetByIdAsync(covoiturageId);
        if (covoiturage == null)
            return (false, "Covoiturage non trouvé", null);

        if (covoiturage.NbPlaceRestante <= 0)
            return (false, "Plus de place disponible", null);

        if (covoiturage.UtilisateurId == utilisateurId)
            return (false, "Vous ne pouvez pas participer à votre propre covoiturage", null);

        var utilisateur = await _utilisateurRepository.GetByIdAsync(utilisateurId);
        if (utilisateur == null || utilisateur.Credit < covoiturage.PrixPersonne)
            return (false, "Crédit insuffisant", null);

        var existingParticipation = await _covoiturageRepository.GetParticipationAsync(covoiturageId, utilisateurId);
        if (existingParticipation != null)
            return (false, "Vous participez déjà à ce covoiturage", null);

        // Créer la participation
        var participation = new CovoiturageParticipation
        {
            CovoiturageId = covoiturageId,
            UtilisateurId = utilisateurId,
            DateParticipation = DateTime.UtcNow,
            Statut = "Confirmé",
            CreditUtilise = (int)covoiturage.PrixPersonne
        };

        await _covoiturageRepository.AddParticipationAsync(participation);

        // Mettre à jour crédit et places
        utilisateur.Credit -= (int)covoiturage.PrixPersonne;
        await _utilisateurRepository.UpdateAsync(utilisateur);

        covoiturage.NbPlaceRestante--;
        await _covoiturageRepository.UpdateAsync(covoiturage);

        _logger.LogInformation("Participation ajoutée: Utilisateur {UserId} pour covoiturage {CovoiturageId}",
            utilisateurId, covoiturageId);

        return (true, "Participation confirmée", utilisateur.Credit);
    }

    public async Task<(bool Success, string Message)> AnnulerParticipationAsync(int covoiturageId, int utilisateurId)
    {
        var participation = await _covoiturageRepository.GetParticipationAsync(covoiturageId, utilisateurId);
        if (participation == null)
            return (false, "Participation non trouvée");

        participation.Statut = "Annulé";
        await _covoiturageRepository.UpdateParticipationAsync(participation);

        // Rembourser
        var utilisateur = await _utilisateurRepository.GetByIdAsync(utilisateurId);
        if (utilisateur != null)
        {
            utilisateur.Credit += participation.CreditUtilise;
            await _utilisateurRepository.UpdateAsync(utilisateur);
        }

        // Libérer la place
        var covoiturage = await _covoiturageRepository.GetByIdAsync(covoiturageId);
        if (covoiturage != null)
        {
            covoiturage.NbPlaceRestante++;
            await _covoiturageRepository.UpdateAsync(covoiturage);
        }

        _logger.LogInformation("Participation annulée: Utilisateur {UserId} pour covoiturage {CovoiturageId}",
            utilisateurId, covoiturageId);

        return (true, "Participation annulée et crédits remboursés");
    }

    public async Task<(bool Success, string Message)> AnnulerCovoiturageAsync(int covoiturageId, int utilisateurId)
    {
        var covoiturage = await _covoiturageRepository.GetByIdAsync(covoiturageId);
        if (covoiturage == null)
            return (false, "Covoiturage non trouvé");

        if (covoiturage.UtilisateurId != utilisateurId)
            return (false, "Vous n'êtes pas le chauffeur de ce covoiturage");

        covoiturage.Statut = "Annulé";
        await _covoiturageRepository.UpdateAsync(covoiturage);

        // Rembourser tous les participants
        var participations = await _covoiturageRepository.GetParticipationsAsync(covoiturageId);
        foreach (var participation in participations.Where(p => p.Statut == "Confirmé"))
        {
            var passager = await _utilisateurRepository.GetByIdAsync(participation.UtilisateurId);
            if (passager != null)
            {
                passager.Credit += participation.CreditUtilise;
                await _utilisateurRepository.UpdateAsync(passager);

                var trajetInfo = $"{covoiturage.VilleDepart} → {covoiturage.VilleArrivee} le {covoiturage.DateDepart:dd/MM/yyyy}";
                await _emailService.SendCovoiturageAnnulationAsync(passager.Email, passager.Pseudo, trajetInfo);
            }
        }

        _logger.LogInformation("Covoiturage annulé par le chauffeur: {CovoiturageId}", covoiturageId);

        return (true, "Covoiturage annulé et participants remboursés");
    }

    public async Task<(bool Success, string Message)> DemarrerCovoiturageAsync(int covoiturageId, int utilisateurId)
    {
        var covoiturage = await _covoiturageRepository.GetByIdAsync(covoiturageId);
        if (covoiturage == null)
            return (false, "Covoiturage non trouvé");

        if (covoiturage.UtilisateurId != utilisateurId)
            return (false, "Vous n'êtes pas le chauffeur de ce covoiturage");

        if (covoiturage.Statut != "En attente")
            return (false, "Le covoiturage ne peut pas être démarré");

        covoiturage.Statut = "En cours";
        await _covoiturageRepository.UpdateAsync(covoiturage);

        _logger.LogInformation("Covoiturage démarré: {CovoiturageId}", covoiturageId);

        return (true, "Covoiturage démarré");
    }

    public async Task<(bool Success, string Message)> TerminerCovoiturageAsync(int covoiturageId, int utilisateurId)
    {
        var covoiturage = await _covoiturageRepository.GetByIdAsync(covoiturageId);
        if (covoiturage == null)
            return (false, "Covoiturage non trouvé");

        if (covoiturage.UtilisateurId != utilisateurId)
            return (false, "Vous n'êtes pas le chauffeur de ce covoiturage");

        if (covoiturage.Statut != "En cours")
            return (false, "Le covoiturage n'est pas en cours");

        covoiturage.Statut = "Terminé";
        await _covoiturageRepository.UpdateAsync(covoiturage);

        // Envoyer emails aux participants
        var participations = await _covoiturageRepository.GetParticipationsAsync(covoiturageId);
        foreach (var participation in participations.Where(p => p.Statut == "Confirmé"))
        {
            var passager = await _utilisateurRepository.GetByIdAsync(participation.UtilisateurId);
            if (passager != null)
            {
                await _emailService.SendCovoiturageTermineAsync(passager.Email, passager.Pseudo, covoiturageId);
            }
        }

        _logger.LogInformation("Covoiturage terminé: {CovoiturageId}", covoiturageId);

        return (true, "Covoiturage terminé. Les participants ont été notifiés.");
    }
}
