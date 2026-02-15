using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.Business.Constants;
using EcoRide.Backend.Business.Services.Interfaces;
using EcoRide.Backend.Data.Enums;
using EcoRide.Backend.Data.Models;
using EcoRide.Backend.Data.Repositories.Interfaces;
using EcoRide.Backend.Dtos.Admin;

namespace EcoRide.Backend.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ICarpoolRepository _carpoolRepository;
    private readonly IUserStatsService _userStatsService;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IUserRepository userRepository,
        ICarpoolRepository carpoolRepository,
        IUserStatsService userStatsService,
        ILogger<AdminController> logger)
    {
        _userRepository = userRepository;
        _carpoolRepository = carpoolRepository;
        _userStatsService = userStatsService;
        _logger = logger;
    }

    [HttpPost("create-employee")]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDTO employeeDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Check if email already exists
        if (await _userRepository.EmailExistsAsync(employeeDto.Email))
        {
            return BadRequest(new { message = "Email already exists" });
        }

        var employee = new User
        {
            Username = employeeDto.Pseudo,
            Email = employeeDto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(employeeDto.Password),
            LastName = employeeDto.LastName ?? string.Empty,
            FirstName = employeeDto.FirstName ?? string.Empty,
            Credits = 0,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var created = await _userRepository.CreateAsync(employee);

        // Add Employee role
        await _userRepository.AddUserRoleAsync(created.UserId, RoleConstants.EMPLOYEE);

        _logger.LogInformation($"New employee created: {created.Email}");

        return Ok(new { message = "Employee created successfully", userId = created.UserId });
    }

    [HttpPut("suspend-user/{userId}")]
    public async Task<IActionResult> SuspendUser(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.IsActive = false;
        user.DeactivatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation($"User {userId} suspended");

        return Ok(new { message = "User suspended" });
    }

    [HttpPut("activate-user/{userId}")]
    public async Task<IActionResult> ActivateUser(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        user.IsActive = true;
        user.DeactivatedAt = null;
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation($"User {userId} activated");

        return Ok(new { message = "User activated" });
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics()
    {
        var users = await _userRepository.GetAllAsync();
        var carpools = await _carpoolRepository.GetAllAsync();

        var totalUsers = users.Count;
        var activeUsers = users.Count(u => u.IsActive);
        var totalCarpools = carpools.Count;
        var activeCarpools = carpools.Count(c => c.Status == CarpoolStatus.Pending || c.Status == CarpoolStatus.InProgress);
        var totalCreditsCirculating = users.Sum(u => u.Credits);

        // Platform earns 2 credits per validated participation
        var validatedParticipations = await _carpoolRepository.GetTotalValidatedParticipationsCountAsync();
        var platformCreditsEarned = validatedParticipations * 2;

        return Ok(new
        {
            totalUsers,
            activeUsers,
            totalCarpools,
            activeCarpools,
            totalCreditsCirculating,
            platformCreditsEarned
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();

        var result = users.Select(u => new
        {
            u.UserId,
            u.Username,
            u.Email,
            u.LastName,
            u.FirstName,
            u.IsActive,
            u.Credits,
            u.CreatedAt,
            u.DeactivatedAt,
            Roles = u.UserRoles.Select(ur => ur.Role.Label).ToList(),
            Vehicles = u.Vehicles.Select(v => new
            {
                v.VehicleId,
                Brand = v.Brand?.Label ?? "",
                v.Model,
                v.RegistrationNumber,
                EnergyType = v.EnergyType.ToString(),
                v.Color
            }).ToList()
        }).ToList();

        return Ok(result);
    }

    [HttpGet("carpools")]
    public async Task<IActionResult> GetAllCarpools()
    {
        var carpools = await _carpoolRepository.GetAllAsync();

        var result = carpools.Select(c => new
        {
            c.CarpoolId,
            c.DepartureCity,
            c.ArrivalCity,
            c.DepartureDate,
            c.DepartureTime,
            c.ArrivalDate,
            c.ArrivalTime,
            Status = c.Status.ToString(),
            c.TotalSeats,
            c.AvailableSeats,
            c.PricePerPerson,
            c.EstimatedDurationMinutes,
            DriverUsername = c.Driver.Username,
            DriverId = c.UserId,
            VehicleBrand = c.Vehicle.Brand?.Label ?? "",
            VehicleModel = c.Vehicle.Model,
            VehicleRegistration = c.Vehicle.RegistrationNumber,
            VehicleColor = c.Vehicle.Color,
            VehicleEnergyType = c.Vehicle.EnergyType.ToString(),
            IsEcological = c.Vehicle.EnergyType == Dtos.Enums.EnergyType.Electric,
            c.CreatedAt
        }).ToList();

        return Ok(result);
    }

    [HttpGet("users/{userId}/stats")]
    public async Task<IActionResult> GetUserStats(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var stats = await _userStatsService.GetAdminUserDetailStatsAsync(userId);
        return Ok(stats);
    }
}
