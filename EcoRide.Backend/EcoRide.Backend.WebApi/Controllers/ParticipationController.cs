using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.Business.Services.Interfaces;

namespace EcoRide.Backend.WebApi.Controllers;

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
}

public class ValidateTripDTO
{
    public bool TripOk { get; set; }
    public string? Comment { get; set; }
}
