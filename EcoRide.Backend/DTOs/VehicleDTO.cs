using System.ComponentModel.DataAnnotations;

namespace EcoRide.Backend.DTOs;

public class VehicleDTO
{
    public int VehicleId { get; set; }
    public string Model { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string EnergyType { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public DateTime? FirstRegistrationDate { get; set; }
    public int BrandId { get; set; }
    public string BrandLabel { get; set; } = string.Empty;
    public int SeatCount { get; set; }
}

public class CreateVehicleDTO
{
    [Required(ErrorMessage = "Model is required")]
    public string Model { get; set; } = string.Empty;

    [Required(ErrorMessage = "Registration number is required")]
    public string RegistrationNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Energy type is required")]
    public string EnergyType { get; set; } = string.Empty;

    [Required(ErrorMessage = "Color is required")]
    public string Color { get; set; } = string.Empty;

    public DateTime? FirstRegistrationDate { get; set; }

    [Required(ErrorMessage = "Brand is required")]
    public int BrandId { get; set; }

    [Required(ErrorMessage = "Number of seats is required")]
    [Range(1, 8, ErrorMessage = "Number of seats must be between 1 and 8")]
    public int SeatCount { get; set; }
}
