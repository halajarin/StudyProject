namespace EcoRide.Backend.DTOs;

public class CovoiturageDTO
{
    public int CovoiturageId { get; set; }
    public DateTime DateDepart { get; set; }
    public string HeureDepart { get; set; } = string.Empty;
    public string LieuDepart { get; set; } = string.Empty;
    public string VilleDepart { get; set; } = string.Empty;
    public DateTime DateArrivee { get; set; }
    public string HeureArrivee { get; set; } = string.Empty;
    public string LieuArrivee { get; set; } = string.Empty;
    public string VilleArrivee { get; set; } = string.Empty;
    public string Statut { get; set; } = string.Empty;
    public int NbPlace { get; set; }
    public int NbPlaceRestante { get; set; }
    public float PrixPersonne { get; set; }
    public int? DureeEstimeeMinutes { get; set; }
    public bool EstEcologique { get; set; }

    // Informations sur le chauffeur
    public string PseudoChauffeur { get; set; } = string.Empty;
    public byte[]? PhotoChauffeur { get; set; }
    public double NoteMoyenneChauffeur { get; set; }

    // Informations sur la voiture
    public string ModeleVoiture { get; set; } = string.Empty;
    public string MarqueVoiture { get; set; } = string.Empty;
    public string EnergieVoiture { get; set; } = string.Empty;
    public string CouleurVoiture { get; set; } = string.Empty;
}
