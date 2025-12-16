using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EcoRide.Backend.DTOs;
using EcoRide.Backend.Models;
using EcoRide.Backend.Repositories;
using EcoRide.Backend.Services;

namespace EcoRide.Backend.Controllers;

[Route("api/[controller]")]
public class CarpoolController : BaseController
{
    private readonly ICarpoolRepository _carpoolRepository;
    private readonly IUserRepository _userRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly ICarpoolService _carpoolService;
    private readonly ILogger<CarpoolController> _logger;

    public CarpoolController(
        ICarpoolRepository carpoolRepository,
        IUserRepository userRepository,
        IVehicleRepository vehicleRepository,
        ICarpoolService carpoolService,
        ILogger<CarpoolController> logger)
    {
        _carpoolRepository = carpoolRepository;
        _userRepository = userRepository;
        _vehicleRepository = vehicleRepository;
        _carpoolService = carpoolService;
        _logger = logger;
    }

    private CarpoolDTO MapToCarpoolDTO(Carpool carpool, double averageRating)
    {
        return new CarpoolDTO
        {
            CarpoolId = carpool.CarpoolId,
            DepartureDate = carpool.DepartureDate,
            DepartureTime = carpool.DepartureTime,
            DepartureLocation = carpool.DepartureLocation,
            DepartureCity = carpool.DepartureCity,
            ArrivalDate = carpool.ArrivalDate,
            ArrivalTime = carpool.ArrivalTime,
            ArrivalLocation = carpool.ArrivalLocation,
            ArrivalCity = carpool.ArrivalCity,
            Status = carpool.Status,
            TotalSeats = carpool.TotalSeats,
            AvailableSeats = carpool.AvailableSeats,
            PricePerPerson = carpool.PricePerPerson,
            EstimatedDurationMinutes = carpool.EstimatedDurationMinutes,
            IsEcological = carpool.Vehicle.EnergyType.ToLower() == "electric",
            DriverUsername = carpool.Driver.Username,
            DriverPhoto = carpool.Driver.Photo,
            DriverAverageRating = averageRating,
            VehicleModel = carpool.Vehicle.Model,
            VehicleBrand = carpool.Vehicle.Brand.Label,
            VehicleEnergyType = carpool.Vehicle.EnergyType,
            VehicleColor = carpool.Vehicle.Color
        };
    }

    [HttpPost("search")]
    public async Task<IActionResult> Search([FromBody] SearchCarpoolDTO searchDto)
    {
        var carpools = await _carpoolRepository.SearchAsync(searchDto);

        var result = new List<CarpoolDTO>();
        foreach (var carpool in carpools)
        {
            var averageRating = await _userRepository.GetAverageRatingAsync(carpool.UserId);

            // Filter by rating if requested
            if (searchDto.MinimumRating.HasValue && averageRating < searchDto.MinimumRating.Value)
            {
                continue;
            }

            result.Add(MapToCarpoolDTO(carpool, averageRating));
        }

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var carpool = await _carpoolRepository.GetByIdAsync(id);
        if (carpool == null)
        {
            return NotFound(new { message = "Carpool not found" });
        }

        var averageRating = await _userRepository.GetAverageRatingAsync(carpool.UserId);
        var result = MapToCarpoolDTO(carpool, averageRating);

        return Ok(result);
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

        // Verify that the vehicle belongs to the user
        var vehicle = await _vehicleRepository.GetByIdAsync(createDto.VehicleId);
        if (vehicle == null || vehicle.UserId != userId)
        {
            return BadRequest(new { message = "Vehicle not found or not authorized" });
        }

        var carpool = new Carpool
        {
            DepartureDate = createDto.DepartureDate,
            DepartureTime = createDto.DepartureTime,
            DepartureLocation = createDto.DepartureLocation,
            DepartureCity = createDto.DepartureCity,
            ArrivalDate = createDto.ArrivalDate,
            ArrivalTime = createDto.ArrivalTime,
            ArrivalLocation = createDto.ArrivalLocation,
            ArrivalCity = createDto.ArrivalCity,
            TotalSeats = createDto.TotalSeats,
            AvailableSeats = createDto.TotalSeats,
            PricePerPerson = createDto.PricePerPerson,
            VehicleId = createDto.VehicleId,
            UserId = userId,
            EstimatedDurationMinutes = createDto.EstimatedDurationMinutes,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        var created = await _carpoolRepository.CreateAsync(carpool);
        _logger.LogInformation($"New carpool created: {created.CarpoolId}");

        return CreatedAtAction(nameof(GetById), new { id = created.CarpoolId }, created);
    }

    [Authorize]
    [HttpPost("{id}/participate")]
    public async Task<IActionResult> Participate(int id)
    {
        var userId = GetCurrentUserId();
        var (success, message, remainingCredit) = await _carpoolService.ParticipateAsync(id, userId);

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
        var carpool = await _carpoolRepository.GetByIdAsync(id);

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

        var asDriver = await _carpoolRepository.GetByDriverAsync(userId);
        var asPassenger = await _carpoolRepository.GetByPassengerAsync(userId);

        return Ok(new
        {
            asDriver,
            asPassenger
        });
    }
}
