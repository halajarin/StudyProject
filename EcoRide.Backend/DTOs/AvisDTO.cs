using System.ComponentModel.DataAnnotations;

namespace EcoRide.Backend.DTOs;

public class AvisDTO
{
    public int AvisId { get; set; }
    public string Commentaire { get; set; } = string.Empty;
    public int Note { get; set; }
    public string Statut { get; set; } = string.Empty;
    public DateTime DateCreation { get; set; }
    public string PseudoAuteur { get; set; } = string.Empty;
    public string PseudoCible { get; set; } = string.Empty;
}

public class CreateAvisDTO
{
    [Required(ErrorMessage = "Le commentaire est requis")]
    [MaxLength(500, ErrorMessage = "Le commentaire ne peut pas dépasser 500 caractères")]
    public string Commentaire { get; set; } = string.Empty;

    [Required(ErrorMessage = "La note est requise")]
    [Range(1, 5, ErrorMessage = "La note doit être entre 1 et 5")]
    public int Note { get; set; }

    [Required(ErrorMessage = "L'utilisateur cible est requis")]
    public int UtilisateurCibleId { get; set; }

    public int? CovoiturageId { get; set; }
}
