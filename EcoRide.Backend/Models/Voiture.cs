using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("voiture")]
public class Voiture
{
    [Key]
    [Column("voiture_id")]
    public int VoitureId { get; set; }

    [Column("modele")]
    [MaxLength(80)]
    public string Modele { get; set; } = string.Empty;

    [Column("immatriculation")]
    [MaxLength(80)]
    public string Immatriculation { get; set; } = string.Empty;

    [Column("energie")]
    [MaxLength(80)]
    public string Energie { get; set; } = string.Empty; // Electrique, Essence, Diesel, Hybride

    [Column("couleur")]
    [MaxLength(80)]
    public string Couleur { get; set; } = string.Empty;

    [Column("date_premiere_immatriculation")]
    public DateTime? DatePremiereImmatriculation { get; set; }

    [Column("marque_id")]
    public int MarqueId { get; set; }

    [Column("utilisateur_id")]
    public int UtilisateurId { get; set; }

    [Column("nombre_places")]
    public int NombrePlaces { get; set; }

    // Relations
    [ForeignKey("MarqueId")]
    public virtual Marque Marque { get; set; } = null!;

    [ForeignKey("UtilisateurId")]
    public virtual Utilisateur Utilisateur { get; set; } = null!;

    public virtual ICollection<Covoiturage> Covoiturages { get; set; } = new List<Covoiturage>();
}
