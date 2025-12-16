namespace EcoRide.Backend.DTOs;

public class UserProfileDTO
{
    public int UserId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime? BirthDate { get; set; }
    public byte[]? Photo { get; set; }
    public int Credits { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
    public double AverageRating { get; set; }
    public int ReviewCount { get; set; }
}

public class UpdateProfileDTO
{
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime? BirthDate { get; set; }
    public byte[]? Photo { get; set; }
}
