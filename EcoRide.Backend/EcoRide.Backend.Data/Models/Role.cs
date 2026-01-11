using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Data.Models;

[Table("role")]
public class Role
{
    [Key]
    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("label")]
    [MaxLength(50)]
    public string Label { get; set; } = string.Empty;

    // Relationships
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
