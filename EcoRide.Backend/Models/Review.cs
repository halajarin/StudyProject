using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("review")]
public class Review
{
    [Key]
    [Column("review_id")]
    public int ReviewId { get; set; }

    [Column("comment")]
    [MaxLength(500)]
    public string Comment { get; set; } = string.Empty;

    [Column("note")]
    public int Note { get; set; } // From 1 to 5

    [Column("status")]
    [MaxLength(80)]
    public string Status { get; set; } = "Pending"; // Pending, Validated, Rejected

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("author_user_id")]
    public int AuthorUserId { get; set; }

    [Column("target_user_id")]
    public int TargetUserId { get; set; }

    [Column("carpool_id")]
    public int? CarpoolId { get; set; }

    // Relationships
    [ForeignKey("AuthorUserId")]
    public virtual User Author { get; set; } = null!;

    [ForeignKey("TargetUserId")]
    public virtual User Target { get; set; } = null!;

    [ForeignKey("CarpoolId")]
    public virtual Carpool? Carpool { get; set; }
}
