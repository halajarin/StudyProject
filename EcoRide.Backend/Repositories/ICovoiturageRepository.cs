using EcoRide.Backend.Models;
using EcoRide.Backend.DTOs;

namespace EcoRide.Backend.Repositories;

public interface ICovoiturageRepository
{
    Task<Covoiturage?> GetByIdAsync(int id);
    Task<List<Covoiturage>> GetAllAsync();
    Task<List<Covoiturage>> SearchAsync(SearchCovoiturageDTO searchDto);
    Task<Covoiturage> CreateAsync(Covoiturage covoiturage);
    Task<Covoiturage> UpdateAsync(Covoiturage covoiturage);
    Task DeleteAsync(int id);
    Task<List<Covoiturage>> GetByDriverAsync(int utilisateurId);
    Task<List<Covoiturage>> GetByPassengerAsync(int utilisateurId);
    Task<CovoiturageParticipation?> GetParticipationAsync(int covoiturageId, int utilisateurId);
    Task<CovoiturageParticipation> AddParticipationAsync(CovoiturageParticipation participation);
    Task UpdateParticipationAsync(CovoiturageParticipation participation);
    Task<List<CovoiturageParticipation>> GetParticipationsAsync(int covoiturageId);
    Task<Dictionary<DateTime, int>> GetCovoituragesCountByDateAsync(DateTime startDate, DateTime endDate);
    Task<Dictionary<DateTime, float>> GetPlatformCreditsEarnedByDateAsync(DateTime startDate, DateTime endDate);
}
