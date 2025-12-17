using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.DTOs;
using EcoRide.Backend.Repositories;
using EcoRide.Backend.Services;

namespace EcoRide.Backend.Controllers;

[Route("api/[controller]")]
[Authorize]
public class UserController : BaseController
{
    private readonly IUserRepository _userRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IPreferenceService _preferenceService;
    private readonly ILogger<UserController> _logger;

    public UserController(
        IUserRepository userRepository,
        IVehicleRepository vehicleRepository,
        IPreferenceService preferenceService,
        ILogger<UserController> logger)
    {
        _userRepository = userRepository;
        _vehicleRepository = vehicleRepository;
        _preferenceService = preferenceService;
        _logger = logger;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var roles = await _userRepository.GetUserRolesAsync(userId);
        var averageRating = await _userRepository.GetAverageRatingAsync(userId);
        var reviewCount = await _userRepository.GetRatingCountAsync(userId);

        var profile = new UserProfileDTO
        {
            UserId = user.UserId,
            Username = user.Username,
            Email = user.Email,
            LastName = user.LastName,
            FirstName = user.FirstName,
            Phone = user.Phone,
            Address = user.Address,
            BirthDate = user.BirthDate,
            Photo = user.Photo,
            Credits = user.Credits,
            Roles = roles,
            AverageRating = averageRating,
            ReviewCount = reviewCount
        };

        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO updateDto)
    {
        var userId = GetCurrentUserId();
        var user = await _userRepository.GetByIdAsync(userId);

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.LastName = updateDto.LastName ?? user.LastName;
        user.FirstName = updateDto.FirstName ?? user.FirstName;
        user.Phone = updateDto.Phone ?? user.Phone;
        user.Address = updateDto.Address ?? user.Address;
        user.BirthDate = updateDto.BirthDate ?? user.BirthDate;
        user.Photo = updateDto.Photo ?? user.Photo;

        await _userRepository.UpdateAsync(user);

        return Ok(new { message = "Profile updated successfully" });
    }

    [HttpPost("add-role/{roleId}")]
    public async Task<IActionResult> AddRole(int roleId)
    {
        var userId = GetCurrentUserId();
        var roles = await _userRepository.GetUserRolesAsync(userId);

        // Prevent adding Employee or Administrator roles
        if (roleId == 3 || roleId == 4)
        {
            return Forbid();
        }

        await _userRepository.AddUserRoleAsync(userId, roleId);
        _logger.LogInformation($"Role {roleId} added to user {userId}");

        return Ok(new { message = "Role added successfully" });
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles()
    {
        var userId = GetCurrentUserId();
        var vehicles = await _vehicleRepository.GetByUserAsync(userId);

        var result = vehicles.Select(v => new VehicleDTO
        {
            VehicleId = v.VehicleId,
            Model = v.Model,
            RegistrationNumber = v.RegistrationNumber,
            EnergyType = v.EnergyType,
            Color = v.Color,
            FirstRegistrationDate = v.FirstRegistrationDate,
            BrandId = v.BrandId,
            BrandLabel = v.Brand.Label,
            SeatCount = v.SeatCount
        }).ToList();

        return Ok(result);
    }

    [HttpPost("vehicles")]
    public async Task<IActionResult> AddVehicle([FromBody] CreateVehicleDTO createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();

        var vehicle = new Models.Vehicle
        {
            Model = createDto.Model,
            RegistrationNumber = createDto.RegistrationNumber,
            EnergyType = createDto.EnergyType,
            Color = createDto.Color,
            FirstRegistrationDate = createDto.FirstRegistrationDate,
            BrandId = createDto.BrandId,
            UserId = userId,
            SeatCount = createDto.SeatCount
        };

        var created = await _vehicleRepository.CreateAsync(vehicle);
        _logger.LogInformation($"New vehicle added: {created.VehicleId}");

        return CreatedAtAction(nameof(GetVehicles), new { id = created.VehicleId }, created);
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences()
    {
        var userId = GetCurrentUserId();
        var preferences = await _preferenceService.GetPreferencesAsync(userId);

        if (preferences == null)
        {
            return Ok(new { });
        }

        return Ok(preferences);
    }

    [HttpPost("preferences")]
    public async Task<IActionResult> SavePreferences([FromBody] Dictionary<string, object> preferences)
    {
        var userId = GetCurrentUserId();
        await _preferenceService.CreateOrUpdatePreferencesAsync(userId, preferences);

        return Ok(new { message = "Preferences saved successfully" });
    }
}
