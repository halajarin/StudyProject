using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Data.Models;

[Table("user_role")]
public class UserRole
{
    [Key]
    [Column("user_role_id")]
    public int UserRoleId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("assigned_at")]
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    // Relationships
    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    [ForeignKey("RoleId")]
    public virtual Role Role { get; set; } = null!;
}
