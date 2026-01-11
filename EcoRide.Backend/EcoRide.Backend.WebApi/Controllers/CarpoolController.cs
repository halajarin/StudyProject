using EcoRide.Backend.Business.Services.Interfaces;
using EcoRide.Backend.Dtos.Carpool;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EcoRide.Backend.WebApi.Controllers;

[Route("api/[controller]")]
public class CarpoolController : BaseController
{
    private readonly ICarpoolService _carpoolService;
    private readonly ILogger<CarpoolController> _logger;

    public CarpoolController(ICarpoolService carpoolService, ILogger<CarpoolController> logger)
    {
        _carpoolService = carpoolService;
        _logger = logger;
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] SearchCarpoolDTO searchDto)
    {
        var result = await _carpoolService.SearchAsync(searchDto);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var carpool = await _carpoolService.GetByIdAsync(id);
        if (carpool == null)
        {
            return NotFound(new { message = "Carpool not found" });
        }

        return Ok(carpool);
    }

    [Authorize(Roles = "Driver")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCarpoolDTO createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        var created = await _carpoolService.CreateAsync(createDto, userId);

        _logger.LogInformation($"New carpool created: {created.CarpoolId}");

        return CreatedAtAction(nameof(GetById), new { id = created.CarpoolId }, created);
    }

    [Authorize]
    [HttpPost("{id}/participate")]
    public async Task<IActionResult> Participate(int id)
    {
        var userId = GetCurrentUserId();
        var (success, message, remainingCredit) = await _carpoolService.ParticipateAsync(
            id,
            userId
        );

        if (!success)
        {
            return BadRequest(new { message });
        }

        return Ok(new { message, remainingCredit });
    }

    [Authorize]
    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var userId = GetCurrentUserId();
        var carpool = await _carpoolService.GetByIdAsync(id);

        if (carpool == null)
        {
            return NotFound(new { message = "Carpool not found" });
        }

        // If the driver is canceling
        if (carpool.UserId == userId)
        {
            var (success, message) = await _carpoolService.CancelCarpoolAsync(id, userId);
            return success ? Ok(new { message }) : BadRequest(new { message });
        }
        else
        {
            // If a passenger is canceling
            var (success, message) = await _carpoolService.CancelParticipationAsync(id, userId);
            return success ? Ok(new { message }) : BadRequest(new { message });
        }
    }

    [Authorize(Roles = "Driver")]
    [HttpPost("{id}/start")]
    public async Task<IActionResult> Start(int id)
    {
        var userId = GetCurrentUserId();
        var (success, message) = await _carpoolService.StartCarpoolAsync(id, userId);
        return success ? Ok(new { message }) : BadRequest(new { message });
    }

    [Authorize(Roles = "Driver")]
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> Complete(int id)
    {
        var userId = GetCurrentUserId();
        var (success, message) = await _carpoolService.CompleteCarpoolAsync(id, userId);
        return success ? Ok(new { message }) : BadRequest(new { message });
    }

    [Authorize]
    [HttpGet("my-trips")]
    public async Task<IActionResult> GetMyTrips()
    {
        var userId = GetCurrentUserId();

        var asDriver = await _carpoolService.GetByDriverAsync(userId);
        var asPassenger = await _carpoolService.GetByPassengerAsync(userId);

        return Ok(new { asDriver, asPassenger });
    }
}
