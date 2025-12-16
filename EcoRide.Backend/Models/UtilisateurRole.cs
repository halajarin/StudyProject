using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("utilisateur_role")]
public class UtilisateurRole
{
    [Key]
    [Column("utilisateur_role_id")]
    public int UtilisateurRoleId { get; set; }

    [Column("utilisateur_id")]
    public int UtilisateurId { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("date_attribution")]
    public DateTime DateAttribution { get; set; } = DateTime.UtcNow;

    // Relations
    [ForeignKey("UtilisateurId")]
    public virtual Utilisateur Utilisateur { get; set; } = null!;

    [ForeignKey("RoleId")]
    public virtual Role Role { get; set; } = null!;
}
