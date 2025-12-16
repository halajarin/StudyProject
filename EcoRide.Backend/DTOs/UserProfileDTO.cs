namespace EcoRide.Backend.DTOs;

public class UserProfileDTO
{
    public int UtilisateurId { get; set; }
    public string Pseudo { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Telephone { get; set; }
    public string? Adresse { get; set; }
    public DateTime? DateNaissance { get; set; }
    public byte[]? Photo { get; set; }
    public int Credit { get; set; }
    public List<string> Roles { get; set; } = new List<string>();
    public double NoteMoyenne { get; set; }
    public int NombreAvis { get; set; }
}

public class UpdateProfileDTO
{
    public string? Nom { get; set; }
    public string? Prenom { get; set; }
    public string? Telephone { get; set; }
    public string? Adresse { get; set; }
    public DateTime? DateNaissance { get; set; }
    public byte[]? Photo { get; set; }
}
