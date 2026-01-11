using EcoRide.Backend.Dtos.Carpool;

namespace EcoRide.Backend.Business.Services.Interfaces;

public interface ICarpoolService
{
    // CRUD operations
    Task<CarpoolDTO?> GetByIdAsync(int id);
    Task<List<CarpoolDTO>> GetAllAsync();
    Task<List<CarpoolDTO>> SearchAsync(SearchCarpoolDTO searchDto);
    Task<List<CarpoolDTO>> GetByDriverAsync(int userId);
    Task<List<CarpoolDTO>> GetByPassengerAsync(int userId);
    Task<CarpoolDTO> CreateAsync(CreateCarpoolDTO createDto, int userId);
    Task DeleteAsync(int id);

    // Lifecycle management
    Task<(bool Success, string Message)> StartCarpoolAsync(int carpoolId, int userId);
    Task<(bool Success, string Message)> CompleteCarpoolAsync(int carpoolId, int userId);
    Task<(bool Success, string Message)> CancelCarpoolAsync(int carpoolId, int userId);

    // Participation management
    Task<(bool Success, string Message, int? RemainingCredit)> ParticipateAsync(int carpoolId, int userId);
    Task<(bool Success, string Message)> CancelParticipationAsync(int carpoolId, int userId);
    Task<(bool Success, string Message)> ValidateTripAsync(int carpoolId, int userId, bool tripOk, string? problemComment);
}
