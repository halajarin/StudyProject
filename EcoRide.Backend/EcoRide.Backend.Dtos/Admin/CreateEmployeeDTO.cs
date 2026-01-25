namespace EcoRide.Backend.Dtos.Admin;

public class CreateEmployeeDTO
{
    public string Pseudo { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? LastName { get; set; }
    public string? FirstName { get; set; }
}
