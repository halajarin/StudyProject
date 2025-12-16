using System.ComponentModel.DataAnnotations;

namespace EcoRide.Backend.DTOs;

public class CreateCovoiturageDTO
{
    [Required(ErrorMessage = "La date de départ est requise")]
    public DateTime DateDepart { get; set; }

    [Required(ErrorMessage = "L'heure de départ est requise")]
    public string HeureDepart { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le lieu de départ est requis")]
    public string LieuDepart { get; set; } = string.Empty;

    [Required(ErrorMessage = "La ville de départ est requise")]
    public string VilleDepart { get; set; } = string.Empty;

    [Required(ErrorMessage = "La date d'arrivée est requise")]
    public DateTime DateArrivee { get; set; }

    [Required(ErrorMessage = "L'heure d'arrivée est requise")]
    public string HeureArrivee { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le lieu d'arrivée est requis")]
    public string LieuArrivee { get; set; } = string.Empty;

    [Required(ErrorMessage = "La ville d'arrivée est requise")]
    public string VilleArrivee { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nombre de places est requis")]
    [Range(1, 8, ErrorMessage = "Le nombre de places doit être entre 1 et 8")]
    public int NbPlace { get; set; }

    [Required(ErrorMessage = "Le prix par personne est requis")]
    [Range(2, 1000, ErrorMessage = "Le prix doit être entre 2 et 1000 crédits (2 crédits pour la plateforme)")]
    public float PrixPersonne { get; set; }

    [Required(ErrorMessage = "La voiture est requise")]
    public int VoitureId { get; set; }

    public int? DureeEstimeeMinutes { get; set; }
}
