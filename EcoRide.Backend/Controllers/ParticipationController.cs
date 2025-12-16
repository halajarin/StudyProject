using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Controllers;

[Route("api/[controller]")]
[Authorize]
public class ParticipationController : BaseController
{
    private readonly ICarpoolRepository _carpoolRepository;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<ParticipationController> _logger;

    public ParticipationController(
        ICarpoolRepository carpoolRepository,
        IUserRepository userRepository,
        ILogger<ParticipationController> logger)
    {
        _carpoolRepository = carpoolRepository;
        _userRepository = userRepository;
        _logger = logger;
    }

    [HttpPost("{carpoolId}/validate")]
    public async Task<IActionResult> ValidateTrip(int carpoolId, [FromBody] ValidateTripDTO validateDto)
    {
        var userId = GetCurrentUserId();
        var participation = await _carpoolRepository.GetParticipationAsync(carpoolId, userId);

        if (participation == null)
        {
            return NotFound(new { message = "Participation not found" });
        }

        if (validateDto.TripOk)
        {
            participation.TripValidated = true;
            participation.Status = "Validated";

            // Credit the driver
            var carpool = await _carpoolRepository.GetByIdAsync(carpoolId);
            if (carpool != null)
            {
                var driver = await _userRepository.GetByIdAsync(carpool.UserId);
                if (driver != null)
                {
                    // Driver receives the price - 2 credits (platform commission)
                    var driverCredit = (int)carpool.PricePerPerson - 2;
                    driver.Credits += driverCredit;
                    await _userRepository.UpdateAsync(driver);
                }
            }
        }
        else
        {
            participation.TripValidated = false;
            participation.ProblemComment = validateDto.Comment;
        }

        await _carpoolRepository.UpdateParticipationAsync(participation);
        _logger.LogInformation($"Trip {(validateDto.TripOk ? "validated" : "problem reported")} for participation {participation.ParticipationId}");

        return Ok(new { message = validateDto.TripOk ? "Trip validated" : "Problem reported" });
    }

    [Authorize(Roles = "Employee,Administrator")]
    [HttpGet("problems")]
    public async Task<IActionResult> GetProblematicTrips()
    {
        // This functionality would require a method in the repository
        // For now, return an empty list
        return Ok(new List<object>());
    }
}

public class ValidateTripDTO
{
    public bool TripOk { get; set; }
    public string? Comment { get; set; }
}
