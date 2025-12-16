using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("utilisateur")]
public class Utilisateur
{
    [Key]
    [Column("utilisateur_id")]
    public int UtilisateurId { get; set; }

    [Column("nom")]
    [MaxLength(80)]
    public string Nom { get; set; } = string.Empty;

    [Column("prenom")]
    [MaxLength(80)]
    public string Prenom { get; set; } = string.Empty;

    [Column("email")]
    [MaxLength(80)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Column("password")]
    [MaxLength(80)]
    public string Password { get; set; } = string.Empty;

    [Column("telephone")]
    [MaxLength(80)]
    public string? Telephone { get; set; }

    [Column("adresse")]
    [MaxLength(80)]
    public string? Adresse { get; set; }

    [Column("date_naissance")]
    public DateTime? DateNaissance { get; set; }

    [Column("photo")]
    public byte[]? Photo { get; set; }

    [Column("pseudo")]
    [MaxLength(80)]
    public string Pseudo { get; set; } = string.Empty;

    [Column("credit")]
    public int Credit { get; set; } = 20; // 20 crédits à la création

    [Column("date_creation")]
    public DateTime DateCreation { get; set; } = DateTime.UtcNow;

    [Column("est_actif")]
    public bool EstActif { get; set; } = true;

    // Relations
    public virtual ICollection<UtilisateurRole> UtilisateurRoles { get; set; } = new List<UtilisateurRole>();
    public virtual ICollection<Voiture> Voitures { get; set; } = new List<Voiture>();
    public virtual ICollection<CovoiturageParticipation> Participations { get; set; } = new List<CovoiturageParticipation>();
    public virtual ICollection<Covoiturage> CovoituragesCreés { get; set; } = new List<Covoiturage>();
    public virtual ICollection<Avis> AvisDonnés { get; set; } = new List<Avis>();
    public virtual ICollection<Avis> AvisReçus { get; set; } = new List<Avis>();
}
