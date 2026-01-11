namespace EcoRide.Backend.Dtos.User;

public class UpdateProfileDTO
{
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime? BirthDate { get; set; }
    public byte[]? Photo { get; set; }
}
