using EcoRide.Backend.Models;

namespace EcoRide.Backend.Services;

public interface ICovoiturageService
{
    Task<(bool Success, string Message, int? CreditRestant)> ParticiperAsync(int covoiturageId, int utilisateurId);
    Task<(bool Success, string Message)> AnnulerParticipationAsync(int covoiturageId, int utilisateurId);
    Task<(bool Success, string Message)> AnnulerCovoiturageAsync(int covoiturageId, int utilisateurId);
    Task<(bool Success, string Message)> DemarrerCovoiturageAsync(int covoiturageId, int utilisateurId);
    Task<(bool Success, string Message)> TerminerCovoiturageAsync(int covoiturageId, int utilisateurId);
}
