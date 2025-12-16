using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("covoiturage")]
public class Covoiturage
{
    [Key]
    [Column("covoiturage_id")]
    public int CovoiturageId { get; set; }

    [Column("date_depart")]
    public DateTime DateDepart { get; set; }

    [Column("heure_depart")]
    [MaxLength(80)]
    public string HeureDepart { get; set; } = string.Empty;

    [Column("lieu_depart")]
    [MaxLength(80)]
    public string LieuDepart { get; set; } = string.Empty;

    [Column("ville_depart")]
    [MaxLength(100)]
    public string VilleDepart { get; set; } = string.Empty;

    [Column("date_arrivee")]
    public DateTime DateArrivee { get; set; }

    [Column("heure_arrivee")]
    [MaxLength(80)]
    public string HeureArrivee { get; set; } = string.Empty;

    [Column("lieu_arrivee")]
    [MaxLength(80)]
    public string LieuArrivee { get; set; } = string.Empty;

    [Column("ville_arrivee")]
    [MaxLength(100)]
    public string VilleArrivee { get; set; } = string.Empty;

    [Column("statut")]
    [MaxLength(80)]
    public string Statut { get; set; } = "En attente"; // En attente, En cours, Terminé, Annulé

    [Column("nb_place")]
    public int NbPlace { get; set; }

    [Column("nb_place_restante")]
    public int NbPlaceRestante { get; set; }

    [Column("prix_personne")]
    public float PrixPersonne { get; set; }

    [Column("voiture_id")]
    public int VoitureId { get; set; }

    [Column("utilisateur_id")]
    public int UtilisateurId { get; set; }

    [Column("date_creation")]
    public DateTime DateCreation { get; set; } = DateTime.UtcNow;

    [Column("duree_estimee_minutes")]
    public int? DureeEstimeeMinutes { get; set; }

    // Relations
    [ForeignKey("VoitureId")]
    public virtual Voiture Voiture { get; set; } = null!;

    [ForeignKey("UtilisateurId")]
    public virtual Utilisateur Chauffeur { get; set; } = null!;

    public virtual ICollection<CovoiturageParticipation> Participations { get; set; } = new List<CovoiturageParticipation>();
}
