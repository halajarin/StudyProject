using EcoRide.Backend.Data.Models;

namespace EcoRide.Backend.Data.Repositories.Interfaces;

public interface ICarpoolRepository
{
    Task<Carpool?> GetByIdAsync(int id);
    Task<List<Carpool>> GetAllAsync();
    Task<List<Carpool>> SearchAsync(
        string departureCity,
        string arrivalCity,
        DateTime? departureDate,
        bool? isEcological = null,
        float? maxPrice = null,
        int? maxDurationMinutes = null,
        int? minimumRating = null);
    Task<Carpool> CreateAsync(Carpool carpool);
    Task<Carpool> UpdateAsync(Carpool carpool);
    Task DeleteAsync(int id);
    Task<List<Carpool>> GetByDriverAsync(int userId);
    Task<List<Carpool>> GetByPassengerAsync(int userId);
    Task<CarpoolParticipation?> GetParticipationAsync(int carpoolId, int userId);
    Task<CarpoolParticipation> AddParticipationAsync(CarpoolParticipation participation);
    Task UpdateParticipationAsync(CarpoolParticipation participation);
    Task<List<CarpoolParticipation>> GetParticipationsAsync(int carpoolId);
    Task<Dictionary<DateTime, int>> GetCarpoolsCountByDateAsync(DateTime startDate, DateTime endDate);
    Task<Dictionary<DateTime, float>> GetPlatformCreditsEarnedByDateAsync(DateTime startDate, DateTime endDate);
}
