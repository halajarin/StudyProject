using EcoRide.Backend.Models;
using EcoRide.Backend.DTOs;

namespace EcoRide.Backend.Repositories;

public interface ICarpoolRepository
{
    Task<Carpool?> GetByIdAsync(int id);
    Task<List<Carpool>> GetAllAsync();
    Task<List<Carpool>> SearchAsync(SearchCarpoolDTO searchDto);
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
