using System.ComponentModel.DataAnnotations;
using EcoRide.Backend.Dtos.Enums;

namespace EcoRide.Backend.Dtos.Vehicle;

public class VehicleDTO
{
    public int VehicleId { get; set; }
    public string Model { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public EnergyType EnergyType { get; set; }
    public string Color { get; set; } = string.Empty;
    public DateTime? FirstRegistrationDate { get; set; }
    public int BrandId { get; set; }
    public string BrandLabel { get; set; } = string.Empty;
    public int SeatCount { get; set; }
}
