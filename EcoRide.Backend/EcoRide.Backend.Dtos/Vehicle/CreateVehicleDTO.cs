using System.ComponentModel.DataAnnotations;
using EcoRide.Backend.Dtos.Enums;

namespace EcoRide.Backend.Dtos.Vehicle;

public class CreateVehicleDTO
{
    [Required(ErrorMessage = "Model is required")]
    public string Model { get; set; } = string.Empty;

    [Required(ErrorMessage = "Registration number is required")]
    public string RegistrationNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Energy type is required")]
    public EnergyType EnergyType { get; set; }

    [Required(ErrorMessage = "Color is required")]
    public string Color { get; set; } = string.Empty;

    public DateTime? FirstRegistrationDate { get; set; }

    [Required(ErrorMessage = "Brand is required")]
    public int BrandId { get; set; }

    [Required(ErrorMessage = "Number of seats is required")]
    [Range(1, 8, ErrorMessage = "Number of seats must be between 1 and 8")]
    public int SeatCount { get; set; }
}
