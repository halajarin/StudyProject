namespace EcoRide.Backend.Dtos.User;

public class UserProfileDTO
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? Phone { get; set; }
    public byte[]? Photo { get; set; }
    public int Credits { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public bool HasDriverLicense { get; set; }
    public bool HasInsurance { get; set; }
}
