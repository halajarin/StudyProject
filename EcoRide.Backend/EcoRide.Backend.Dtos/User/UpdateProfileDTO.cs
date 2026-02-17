namespace EcoRide.Backend.Dtos.User;

public class UpdateProfileDTO
{
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
    public string? Phone { get; set; }
    public byte[]? Photo { get; set; }
    public bool? HasDriverLicense { get; set; }
    public bool? HasInsurance { get; set; }
}
