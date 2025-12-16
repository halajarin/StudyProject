namespace EcoRide.Backend.DTOs;

public class SearchCovoiturageDTO
{
    public string VilleDepart { get; set; } = string.Empty;
    public string VilleArrivee { get; set; } = string.Empty;
    public DateTime DateDepart { get; set; }

    // Filtres optionnels
    public bool? EstEcologique { get; set; }
    public float? PrixMax { get; set; }
    public int? DureeMaxMinutes { get; set; }
    public int? NoteMinimale { get; set; }
}
