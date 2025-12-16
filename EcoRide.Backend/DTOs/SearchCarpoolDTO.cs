namespace EcoRide.Backend.DTOs;

public class SearchCarpoolDTO
{
    public string DepartureCity { get; set; } = string.Empty;
    public string ArrivalCity { get; set; } = string.Empty;
    public DateTime DepartureDate { get; set; }

    // Optional filters
    public bool? IsEcological { get; set; }
    public float? MaxPrice { get; set; }
    public int? MaxDurationMinutes { get; set; }
    public int? MinimumRating { get; set; }
}
