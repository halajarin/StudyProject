using EcoRide.Backend.Business.Constants;
using EcoRide.Backend.Business.Helpers;
using EcoRide.Backend.Business.Mappers;
using EcoRide.Backend.Business.Services.Interfaces;
using EcoRide.Backend.Data.Enums;
using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.Dtos.Carpool;
using Microsoft.Extensions.Logging;

namespace EcoRide.Backend.Business.Services;

public class CarpoolService : ICarpoolService
{
    private readonly ICarpoolRepository _carpoolRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPreferenceService _preferenceService;
    private readonly IEmailHelper _emailHelper;
    private readonly ILogger<CarpoolService> _logger;

    public CarpoolService(
        ICarpoolRepository carpoolRepository,
        IUserRepository userRepository,
        IPreferenceService preferenceService,
        IEmailHelper emailHelper,
        ILogger<CarpoolService> logger
    )
    {
        _carpoolRepository = carpoolRepository;
        _userRepository = userRepository;
        _preferenceService = preferenceService;
        _emailHelper = emailHelper;
        _logger = logger;
    }

    #region Private Helpers

    private async Task PopulateDriverRatingsAsync(List<CarpoolDTO> carpoolDtos)
    {
        if (carpoolDtos.Count == 0)
            return;

        var driverIds = carpoolDtos.Select(c => c.UserId).Distinct().ToList();
        var ratings = await _userRepository.GetAverageRatingsAsync(driverIds);

        foreach (var dto in carpoolDtos)
        {
            dto.DriverAverageRating = ratings.GetValueOrDefault(dto.UserId, 0);
        }
    }

    private async Task PopulateDriverPreferencesAsync(List<CarpoolDTO> carpoolDtos)
    {
        if (carpoolDtos.Count == 0)
            return;

        var driverIds = carpoolDtos.Select(c => c.UserId).Distinct().ToList();
        var preferencesMap = new Dictionary<int, Dictionary<string, object?>>();

        foreach (var driverId in driverIds)
        {
            var prefs = await _preferenceService.GetPreferencesAsync(driverId);
            if (prefs != null)
                preferencesMap[driverId] = prefs;
        }

        foreach (var dto in carpoolDtos)
        {
            if (!preferencesMap.TryGetValue(dto.UserId, out var prefs))
                continue;

            if (prefs.TryGetValue("smokingAllowed", out var smoking) && smoking is bool s)
                dto.SmokingAllowed = s;
            if (prefs.TryGetValue("petsAllowed", out var pets) && pets is bool p)
                dto.PetsAllowed = p;
            if (prefs.TryGetValue("musicAllowed", out var music) && music is bool m)
                dto.MusicAllowed = m;
            if (prefs.TryGetValue("conversationLevel", out var conv) && conv is string c)
                dto.ConversationLevel = c;
        }
    }

    #endregion

    #region CRUD Operations

    public async Task<CarpoolDTO?> GetByIdAsync(int id)
    {
        var carpool = await _carpoolRepository.GetByIdAsync(id);
        if (carpool == null) return null;

        var dto = carpool.ToDTO();
        dto.DriverAverageRating = await _userRepository.GetAverageRatingAsync(carpool.UserId);
        await PopulateDriverPreferencesAsync(new List<CarpoolDTO> { dto });
        return dto;
    }

    public async Task<List<CarpoolDTO>> GetAllAsync()
    {
        var carpools = await _carpoolRepository.GetAllAsync();
        var dtos = carpools.Select(c => c.ToDTO()).ToList();
        await PopulateDriverRatingsAsync(dtos);
        await PopulateDriverPreferencesAsync(dtos);

        return dtos;
    }

    public async Task<List<CarpoolDTO>> GetAvailableAsync()
    {
        var carpools = await _carpoolRepository.GetAllAsync();
        var available = carpools
            .Where(c => c.Status == CarpoolStatus.Pending && c.AvailableSeats > 0)
            .OrderBy(c => c.DepartureDate)
            .ToList();
        var dtos = available.Select(c => c.ToDTO()).ToList();
        await PopulateDriverRatingsAsync(dtos);
        await PopulateDriverPreferencesAsync(dtos);

        return dtos;
    }

    public async Task<CarpoolDTO> CreateAsync(CreateCarpoolDTO createDto, int userId)
    {
        var carpool = new Carpool
        {
            UserId = userId,
            VehicleId = createDto.VehicleId,
            DepartureCity = createDto.DepartureCity,
            DepartureLocation = createDto.DepartureLocation,
            DepartureTime = createDto.DepartureTime,
            DepartureDate = DateTime.SpecifyKind(createDto.DepartureDate, DateTimeKind.Utc),
            ArrivalCity = createDto.ArrivalCity,
            ArrivalLocation = createDto.ArrivalLocation,
            ArrivalTime = createDto.ArrivalTime,
            ArrivalDate = DateTime.SpecifyKind(createDto.ArrivalDate, DateTimeKind.Utc),
            TotalSeats = createDto.TotalSeats,
            AvailableSeats = createDto.TotalSeats,
            PricePerPerson = createDto.PricePerPerson,
            EstimatedDurationMinutes = createDto.EstimatedDurationMinutes,
            PausesCount = createDto.PausesCount ?? 0,
            PausesDurationMinutes = createDto.PausesDurationMinutes ?? 0,
            WayBefore = createDto.WayBefore,
            WayAfter = createDto.WayAfter,
            DistanceKm = createDto.DistanceKm,
            Co2SavedKg = createDto.Co2SavedKg,
            Status = CarpoolStatus.Pending,
            CreatedAt = DateTime.UtcNow,
        };

        var createdCarpool = await _carpoolRepository.CreateAsync(carpool);
        var dto = createdCarpool.ToDTO();
        dto.DriverAverageRating = await _userRepository.GetAverageRatingAsync(userId);

        return dto;
    }

    public async Task DeleteAsync(int id)
    {
        await _carpoolRepository.DeleteAsync(id);
    }

    #endregion

    #region Search

    public async Task<List<CarpoolDTO>> SearchAsync(SearchCarpoolDTO searchDto)
    {
        var carpools = await _carpoolRepository.SearchAsync(
            searchDto.DepartureCity,
            searchDto.ArrivalCity,
            searchDto.DepartureDate,
            searchDto.DepartureDateTo,
            searchDto.IsEcological,
            searchDto.MaxPrice,
            searchDto.MaxDurationMinutes,
            searchDto.MinimumRating
        );

        var dtos = carpools.Select(c => c.ToDTO()).ToList();
        await PopulateDriverRatingsAsync(dtos);
        await PopulateDriverPreferencesAsync(dtos);

        return dtos;
    }

    public async Task<List<CarpoolDTO>> GetByDriverAsync(int userId)
    {
        var carpools = await _carpoolRepository.GetByDriverAsync(userId);
        var dtos = carpools.Select(c => c.ToDTO()).ToList();
        await PopulateDriverRatingsAsync(dtos);

        return dtos;
    }

    public async Task<List<CarpoolDTO>> GetByPassengerAsync(int userId)
    {
        var carpools = await _carpoolRepository.GetByPassengerAsync(userId);
        var dtos = carpools.Select(c => c.ToDTO()).ToList();
        await PopulateDriverRatingsAsync(dtos);

        return dtos;
    }

    #endregion

    #region Participation

    public async Task<(bool Success, string Message, int? RemainingCredit)> ParticipateAsync(
        int carpoolId,
        int userId,
        int passengerCount = 1
    )
    {
        if (passengerCount < 1)
            return (false, "Passenger count must be at least 1", null);

        var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
        if (carpool == null)
            return (false, "Carpool not found", null);

        if (carpool.AvailableSeats < passengerCount)
            return (false, "Not enough seats available", null);

        if (carpool.UserId == userId)
            return (false, "You cannot join your own carpool", null);

        var totalCost = (int)carpool.PricePerPerson * passengerCount;

        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || user.Credits < totalCost)
            return (false, "Insufficient credits", null);

        var existingParticipation = await _carpoolRepository.GetParticipationAsync(
            carpoolId,
            userId
        );
        if (existingParticipation != null)
            return (false, "You are already participating in this carpool", null);

        // Create participation
        var participation = new CarpoolParticipation
        {
            CarpoolId = carpoolId,
            UserId = userId,
            ParticipationDate = DateTime.UtcNow,
            Status = ParticipationStatus.Confirmed,
            CreditsUsed = totalCost,
            SeatsReserved = passengerCount,
        };

        await _carpoolRepository.AddParticipationAsync(participation);

        // Update credits and seats
        user.Credits -= totalCost;
        await _userRepository.UpdateAsync(user);

        carpool.AvailableSeats -= passengerCount;
        await _carpoolRepository.UpdateAsync(carpool);

        _logger.LogInformation(
            "Participation added: User {UserId} for carpool {CarpoolId} ({SeatsReserved} seats)",
            userId,
            carpoolId,
            passengerCount
        );

        return (true, "Participation confirmed", user.Credits);
    }

    public async Task<(bool Success, string Message)> CancelParticipationAsync(
        int carpoolId,
        int userId
    )
    {
        var participation = await _carpoolRepository.GetParticipationAsync(carpoolId, userId);
        if (participation == null)
            return (false, "Participation not found");

        participation.Status = ParticipationStatus.Cancelled;
        await _carpoolRepository.UpdateParticipationAsync(participation);

        // Refund credits
        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            user.Credits += participation.CreditsUsed;
            await _userRepository.UpdateAsync(user);
        }

        // Free up seats
        var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
        if (carpool != null)
        {
            carpool.AvailableSeats += participation.SeatsReserved;
            await _carpoolRepository.UpdateAsync(carpool);
        }

        _logger.LogInformation(
            "Participation cancelled: User {UserId} for carpool {CarpoolId}",
            userId,
            carpoolId
        );

        return (true, "Participation cancelled and credits refunded");
    }

    #endregion

    #region Carpool Lifecycle

    public async Task<(bool Success, string Message)> CancelCarpoolAsync(int carpoolId, int userId)
    {
        var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
        if (carpool == null)
            return (false, "Carpool not found");

        if (carpool.UserId != userId)
            return (false, "You are not the driver of this carpool");

        carpool.Status = CarpoolStatus.Cancelled;
        await _carpoolRepository.UpdateAsync(carpool);

        // Refund all participants
        var participations = await _carpoolRepository.GetParticipationsAsync(carpoolId);
        foreach (var participation in participations.Where(p => p.Status == ParticipationStatus.Confirmed))
        {
            var passenger = await _userRepository.GetByIdAsync(participation.UserId);
            if (passenger != null)
            {
                passenger.Credits += participation.CreditsUsed;
                await _userRepository.UpdateAsync(passenger);

                var tripInfo =
                    $"{carpool.DepartureCity} → {carpool.ArrivalCity} on {carpool.DepartureDate:MM/dd/yyyy}";
                await _emailHelper.SendCarpoolCancellationAsync(
                    passenger.Email,
                    passenger.Username,
                    tripInfo
                );
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

        if (carpool.Status != CarpoolStatus.Pending)
            return (false, "Carpool cannot be started");

        carpool.Status = CarpoolStatus.InProgress;
        await _carpoolRepository.UpdateAsync(carpool);

        _logger.LogInformation("Carpool started: {CarpoolId}", carpoolId);

        return (true, "Carpool started");
    }

    public async Task<(bool Success, string Message)> CompleteCarpoolAsync(
        int carpoolId,
        int userId
    )
    {
        var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
        if (carpool == null)
            return (false, "Carpool not found");

        if (carpool.UserId != userId)
            return (false, "You are not the driver of this carpool");

        if (carpool.Status != CarpoolStatus.InProgress)
            return (false, "Carpool is not in progress");

        carpool.Status = CarpoolStatus.Completed;
        await _carpoolRepository.UpdateAsync(carpool);

        // Send emails to participants
        var participations = await _carpoolRepository.GetParticipationsAsync(carpoolId);
        foreach (var participation in participations.Where(p => p.Status == ParticipationStatus.Confirmed))
        {
            var passenger = await _userRepository.GetByIdAsync(participation.UserId);
            if (passenger != null)
            {
                await _emailHelper.SendCarpoolCompletedAsync(
                    passenger.Email,
                    passenger.Username,
                    carpoolId
                );
            }
        }

        _logger.LogInformation("Carpool completed: {CarpoolId}", carpoolId);

        return (true, "Carpool completed. Participants have been notified.");
    }

    #endregion

    #region Validation

    public async Task<(bool Success, string Message)> ValidateTripAsync(
        int carpoolId,
        int userId,
        bool tripOk,
        string? problemComment
    )
    {
        var participation = await _carpoolRepository.GetParticipationAsync(carpoolId, userId);
        if (participation == null)
            return (false, "Participation not found");

        // Prevent double validation
        if (participation.TripValidated != null)
            return (false, "Trip already validated or problem already reported");

        if (tripOk)
        {
            participation.TripValidated = true;
            participation.Status = ParticipationStatus.Validated;

            // Credit the driver
            var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
            if (carpool != null)
            {
                var driver = await _userRepository.GetByIdAsync(carpool.UserId);
                if (driver != null)
                {
                    // Driver receives the price minus platform commission
                    var driverCredit = (int)carpool.PricePerPerson - CreditsConstants.PLATFORM_COMMISSION_PER_TRIP;
                    driver.Credits += driverCredit;
                    await _userRepository.UpdateAsync(driver);
                }
            }
        }
        else
        {
            participation.TripValidated = false;
            participation.ProblemComment = problemComment;
        }

        await _carpoolRepository.UpdateParticipationAsync(participation);

        _logger.LogInformation(
            "Trip {Status} for participation {ParticipationId}",
            tripOk ? "validated" : "problem reported",
            participation.ParticipationId
        );

        return (true, tripOk ? "Trip validated" : "Problem reported");
    }

    #endregion
}
