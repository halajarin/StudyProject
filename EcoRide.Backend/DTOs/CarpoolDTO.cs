namespace EcoRide.Backend.DTOs;

public class CarpoolDTO
{
    public int CarpoolId { get; set; }
    public DateTime DepartureDate { get; set; }
    public string DepartureTime { get; set; } = string.Empty;
    public string DepartureLocation { get; set; } = string.Empty;
    public string DepartureCity { get; set; } = string.Empty;
    public DateTime ArrivalDate { get; set; }
    public string ArrivalTime { get; set; } = string.Empty;
    public string ArrivalLocation { get; set; } = string.Empty;
    public string ArrivalCity { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TotalSeats { get; set; }
    public int AvailableSeats { get; set; }
    public float PricePerPerson { get; set; }
    public int? EstimatedDurationMinutes { get; set; }
    public bool IsEcological { get; set; }

    // Driver information
    public string DriverUsername { get; set; } = string.Empty;
    public byte[]? DriverPhoto { get; set; }
    public double DriverAverageRating { get; set; }

    // Vehicle information
    public string VehicleModel { get; set; } = string.Empty;
    public string VehicleBrand { get; set; } = string.Empty;
    public string VehicleEnergyType { get; set; } = string.Empty;
    public string VehicleColor { get; set; } = string.Empty;
}
