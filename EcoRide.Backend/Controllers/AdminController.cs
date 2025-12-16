using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;

namespace EcoRide.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")]
public class AdminController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ICarpoolRepository _carpoolRepository;
    private readonly ILogger<AdminController> _logger;

    public AdminController(
        IUserRepository userRepository,
        ICarpoolRepository carpoolRepository,
        ILogger<AdminController> logger)
    {
        _userRepository = userRepository;
        _carpoolRepository = carpoolRepository;
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
            Pseudo = employeeDto.Pseudo,
            Email = employeeDto.Email,
            Password = BCrypt.Net.BCrypt.HashPassword(employeeDto.Password),
            LastName = employeeDto.LastName ?? string.Empty,
            FirstName = employeeDto.FirstName ?? string.Empty,
            Credit = 0,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var created = await _userRepository.CreateAsync(employee);

        // Add Employee role (RoleId = 3)
        await _userRepository.AddUserRoleAsync(created.UserId, 3);

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
        await _userRepository.UpdateAsync(user);

        _logger.LogInformation($"User {userId} activated");

        return Ok(new { message = "User activated" });
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetStatistics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
        var end = endDate ?? DateTime.UtcNow;

        var carpoolsCount = await _carpoolRepository.GetCarpoolsCountByDateAsync(start, end);
        var platformCredits = await _carpoolRepository.GetPlatformCreditsEarnedByDateAsync(start, end);

        var totalCredits = platformCredits.Values.Sum();

        return Ok(new
        {
            carpoolsPerDay = carpoolsCount,
            creditsPerDay = platformCredits,
            totalCreditsEarned = totalCredits
        });
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userRepository.GetAllAsync();

        var result = users.Select(u => new
        {
            u.UserId,
            u.Pseudo,
            u.Email,
            u.LastName,
            u.FirstName,
            u.IsActive,
            u.Credit,
            u.CreatedAt,
            Roles = u.UserRoles.Select(ur => ur.Role.Label).ToList()
        }).ToList();

        return Ok(result);
    }
}

public class CreateEmployeeDTO
{
    public string Pseudo { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
}
