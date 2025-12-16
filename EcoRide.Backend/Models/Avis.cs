using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("avis")]
public class Avis
{
    [Key]
    [Column("avis_id")]
    public int AvisId { get; set; }

    [Column("commentaire")]
    [MaxLength(500)]
    public string Commentaire { get; set; } = string.Empty;

    [Column("note")]
    public int Note { get; set; } // De 1 à 5

    [Column("statut")]
    [MaxLength(80)]
    public string Statut { get; set; } = "En attente"; // En attente, Validé, Refusé

    [Column("date_creation")]
    public DateTime DateCreation { get; set; } = DateTime.UtcNow;

    [Column("utilisateur_auteur_id")]
    public int UtilisateurAuteurId { get; set; }

    [Column("utilisateur_cible_id")]
    public int UtilisateurCibleId { get; set; }

    [Column("covoiturage_id")]
    public int? CovoiturageId { get; set; }

    // Relations
    [ForeignKey("UtilisateurAuteurId")]
    public virtual Utilisateur UtilisateurAuteur { get; set; } = null!;

    [ForeignKey("UtilisateurCibleId")]
    public virtual Utilisateur UtilisateurCible { get; set; } = null!;

    [ForeignKey("CovoiturageId")]
    public virtual Covoiturage? Covoiturage { get; set; }
}
