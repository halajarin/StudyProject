using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Services;

public class CarpoolService : ICarpoolService
{
    private readonly ICarpoolRepository _carpoolRepository;
    private readonly IUserRepository _userRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<CarpoolService> _logger;

    public CarpoolService(
        ICarpoolRepository carpoolRepository,
        IUserRepository userRepository,
        IEmailService emailService,
        ILogger<CarpoolService> logger)
    {
        _carpoolRepository = carpoolRepository;
        _userRepository = userRepository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, int? RemainingCredit)> JoinCarpoolAsync(int carpoolId, int userId)
    {
        var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
        if (carpool == null)
            return (false, "Carpool not found", null);

        if (carpool.AvailableSeats <= 0)
            return (false, "No seats available", null);

        if (carpool.UserId == userId)
            return (false, "You cannot join your own carpool", null);

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.Credits < carpool.PricePerPerson)
            return (false, "Insufficient credits", null);

        var existingParticipation = await _carpoolRepository.GetParticipationAsync(carpoolId, userId);
        if (existingParticipation != null)
            return (false, "You are already participating in this carpool", null);

        // Create participation
        var participation = new CarpoolParticipation
        {
            CarpoolId = carpoolId,
            UserId = userId,
            ParticipationDate = DateTime.UtcNow,
            Status = "Confirmed",
            CreditsUsed = (int)carpool.PricePerPerson
        };

        await _carpoolRepository.AddParticipationAsync(participation);

        // Update credits and seats
        user.Credits -= (int)carpool.PricePerPerson;
        await _userRepository.UpdateAsync(user);

        carpool.AvailableSeats--;
        await _carpoolRepository.UpdateAsync(carpool);

        _logger.LogInformation("Participation added: User {UserId} for carpool {CarpoolId}",
            userId, carpoolId);

        return (true, "Participation confirmed", user.Credits);
    }

    public async Task<(bool Success, string Message)> CancelParticipationAsync(int carpoolId, int userId)
    {
        var participation = await _carpoolRepository.GetParticipationAsync(carpoolId, userId);
        if (participation == null)
            return (false, "Participation not found");

        participation.Status = "Cancelled";
        await _carpoolRepository.UpdateParticipationAsync(participation);

        // Refund credits
        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            user.Credits += participation.CreditsUsed;
            await _userRepository.UpdateAsync(user);
        }

        // Free up seat
        var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
        if (carpool != null)
        {
            carpool.AvailableSeats++;
            await _carpoolRepository.UpdateAsync(carpool);
        }

        _logger.LogInformation("Participation cancelled: User {UserId} for carpool {CarpoolId}",
            userId, carpoolId);

        return (true, "Participation cancelled and credits refunded");
    }

    public async Task<(bool Success, string Message)> CancelCarpoolAsync(int carpoolId, int userId)
    {
        var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
        if (carpool == null)
            return (false, "Carpool not found");

        if (carpool.UserId != userId)
            return (false, "You are not the driver of this carpool");

        carpool.Status = "Cancelled";
        await _carpoolRepository.UpdateAsync(carpool);

        // Refund all participants
        var participations = await _carpoolRepository.GetParticipationsAsync(carpoolId);
        foreach (var participation in participations.Where(p => p.Status == "Confirmed"))
        {
            var passenger = await _userRepository.GetByIdAsync(participation.UserId);
            if (passenger != null)
            {
                passenger.Credits += participation.CreditsUsed;
                await _userRepository.UpdateAsync(passenger);

                var tripInfo = $"{carpool.DepartureCity} → {carpool.ArrivalCity} on {carpool.DepartureDate:MM/dd/yyyy}";
                await _emailService.SendCarpoolCancellationAsync(passenger.Email, passenger.Username, tripInfo);
            }
        }

        _logger.LogInformation("Carpool cancelled by driver: {CarpoolId}", carpoolId);

        return (true, "Carpool cancelled and participants refunded");
    }

    public async Task<(bool Success, string Message)> StartCarpoolAsync(int carpoolId, int userId)
    {
        var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
        if (carpool == null)
            return (false, "Carpool not found");

        if (carpool.UserId != userId)
            return (false, "You are not the driver of this carpool");

        if (carpool.Status != "Pending")
            return (false, "Carpool cannot be started");

        carpool.Status = "InProgress";
        await _carpoolRepository.UpdateAsync(carpool);

        _logger.LogInformation("Carpool started: {CarpoolId}", carpoolId);

        return (true, "Carpool started");
    }

    public async Task<(bool Success, string Message)> CompleteCarpoolAsync(int carpoolId, int userId)
    {
        var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
        if (carpool == null)
            return (false, "Carpool not found");

        if (carpool.UserId != userId)
            return (false, "You are not the driver of this carpool");

        if (carpool.Status != "InProgress")
            return (false, "Carpool is not in progress");

        carpool.Status = "Completed";
        await _carpoolRepository.UpdateAsync(carpool);

        // Send emails to participants
        var participations = await _carpoolRepository.GetParticipationsAsync(carpoolId);
        foreach (var participation in participations.Where(p => p.Status == "Confirmed"))
        {
            var passenger = await _userRepository.GetByIdAsync(participation.UserId);
            if (passenger != null)
            {
                await _emailService.SendCarpoolCompletedAsync(passenger.Email, passenger.Username, carpoolId);
            }
        }

        _logger.LogInformation("Carpool completed: {CarpoolId}", carpoolId);

        return (true, "Carpool completed. Participants have been notified.");
    }
}
