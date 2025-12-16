using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.Services;

namespace EcoRide.Backend.Controllers;

[Route("api/[controller]")]
[Authorize]
public class ParticipationController : BaseController
{
    private readonly ICarpoolService _carpoolService;
    private readonly ILogger<ParticipationController> _logger;

    public ParticipationController(
        ICarpoolService carpoolService,
        ILogger<ParticipationController> logger)
    {
        _carpoolService = carpoolService;
        _logger = logger;
    }

    [HttpPost("{carpoolId}/validate")]
    public async Task<IActionResult> ValidateTrip(int carpoolId, [FromBody] ValidateTripDTO validateDto)
    {
        var userId = GetCurrentUserId();
        var (success, message) = await _carpoolService.ValidateTripAsync(carpoolId, userId, validateDto.TripOk, validateDto.Comment);

        if (!success)
        {
            return NotFound(new { message });
        }

        return Ok(new { message });
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
