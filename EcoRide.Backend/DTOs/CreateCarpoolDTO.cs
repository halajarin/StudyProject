using System.ComponentModel.DataAnnotations;

namespace EcoRide.Backend.DTOs;

public class CreateCarpoolDTO
{
    [Required(ErrorMessage = "Departure date is required")]
    public DateTime DepartureDate { get; set; }

    [Required(ErrorMessage = "Departure time is required")]
    public string DepartureTime { get; set; } = string.Empty;

    [Required(ErrorMessage = "Departure location is required")]
    public string DepartureLocation { get; set; } = string.Empty;

    [Required(ErrorMessage = "Departure city is required")]
    public string DepartureCity { get; set; } = string.Empty;

    [Required(ErrorMessage = "Arrival date is required")]
    public DateTime ArrivalDate { get; set; }

    [Required(ErrorMessage = "Arrival time is required")]
    public string ArrivalTime { get; set; } = string.Empty;

    [Required(ErrorMessage = "Arrival location is required")]
    public string ArrivalLocation { get; set; } = string.Empty;

    [Required(ErrorMessage = "Arrival city is required")]
    public string ArrivalCity { get; set; } = string.Empty;

    [Required(ErrorMessage = "Number of seats is required")]
    [Range(1, 8, ErrorMessage = "Number of seats must be between 1 and 8")]
    public int TotalSeats { get; set; }

    [Required(ErrorMessage = "Price per person is required")]
    [Range(2, 1000, ErrorMessage = "Price must be between 2 and 1000 credits (2 credits for the platform)")]
    public float PricePerPerson { get; set; }

    [Required(ErrorMessage = "Vehicle is required")]
    public int VehicleId { get; set; }

    public int? EstimatedDurationMinutes { get; set; }
}
