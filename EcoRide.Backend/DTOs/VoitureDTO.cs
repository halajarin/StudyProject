using System.ComponentModel.DataAnnotations;

namespace EcoRide.Backend.DTOs;

public class VoitureDTO
{
    public int VoitureId { get; set; }
    public string Modele { get; set; } = string.Empty;
    public string Immatriculation { get; set; } = string.Empty;
    public string Energie { get; set; } = string.Empty;
    public string Couleur { get; set; } = string.Empty;
    public DateTime? DatePremiereImmatriculation { get; set; }
    public int MarqueId { get; set; }
    public string MarqueLibelle { get; set; } = string.Empty;
    public int NombrePlaces { get; set; }
}

public class CreateVoitureDTO
{
    [Required(ErrorMessage = "Le modèle est requis")]
    public string Modele { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'immatriculation est requise")]
    public string Immatriculation { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'énergie est requise")]
    public string Energie { get; set; } = string.Empty;

    [Required(ErrorMessage = "La couleur est requise")]
    public string Couleur { get; set; } = string.Empty;

    public DateTime? DatePremiereImmatriculation { get; set; }

    [Required(ErrorMessage = "La marque est requise")]
    public int MarqueId { get; set; }

    [Required(ErrorMessage = "Le nombre de places est requis")]
    [Range(1, 8, ErrorMessage = "Le nombre de places doit être entre 1 et 8")]
    public int NombrePlaces { get; set; }
}
