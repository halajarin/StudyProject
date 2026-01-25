namespace EcoRide.Backend.Dtos.User;

public class UserStatsDTO
{
    public List<string> Roles { get; set; } = new();
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}
