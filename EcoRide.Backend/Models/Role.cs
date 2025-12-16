using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("role")]
public class Role
{
    [Key]
    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("libelle")]
    [MaxLength(50)]
    public string Libelle { get; set; } = string.Empty;

    // Relations
    public virtual ICollection<UtilisateurRole> UtilisateurRoles { get; set; } = new List<UtilisateurRole>();
}

// Constantes pour les rôles
public static class RoleConstants
{
    public const string Passager = "Passager";
    public const string Chauffeur = "Chauffeur";
    public const string Employe = "Employe";
    public const string Administrateur = "Administrateur";
}
