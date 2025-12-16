using EcoRide.Backend.Models;

namespace EcoRide.Backend.Services;

public interface ICarpoolService
{
    Task<(bool Success, string Message, int? RemainingCredit)> ParticipateAsync(int carpoolId, int userId);
    Task<(bool Success, string Message)> CancelParticipationAsync(int carpoolId, int userId);
    Task<(bool Success, string Message)> CancelCarpoolAsync(int carpoolId, int userId);
    Task<(bool Success, string Message)> StartCarpoolAsync(int carpoolId, int userId);
    Task<(bool Success, string Message)> CompleteCarpoolAsync(int carpoolId, int userId);
}
