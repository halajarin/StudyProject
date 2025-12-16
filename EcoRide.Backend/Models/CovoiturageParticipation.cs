using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("covoiturage_participation")]
public class CovoiturageParticipation
{
    [Key]
    [Column("participation_id")]
    public int ParticipationId { get; set; }

    [Column("covoiturage_id")]
    public int CovoiturageId { get; set; }

    [Column("utilisateur_id")]
    public int UtilisateurId { get; set; }

    [Column("date_participation")]
    public DateTime DateParticipation { get; set; } = DateTime.UtcNow;

    [Column("statut")]
    [MaxLength(50)]
    public string Statut { get; set; } = "Confirmé"; // Confirmé, Annulé, Validé

    [Column("credit_utilise")]
    public int CreditUtilise { get; set; }

    [Column("trajet_valide")]
    public bool? TrajetValide { get; set; }

    [Column("commentaire_probleme")]
    public string? CommentaireProbleme { get; set; }

    // Relations
    [ForeignKey("CovoiturageId")]
    public virtual Covoiturage Covoiturage { get; set; } = null!;

    [ForeignKey("UtilisateurId")]
    public virtual Utilisateur Passager { get; set; } = null!;
}
