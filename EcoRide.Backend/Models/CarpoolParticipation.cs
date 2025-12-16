using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("carpool_participation")]
public class CarpoolParticipation
{
    [Key]
    [Column("participation_id")]
    public int ParticipationId { get; set; }

    [Column("carpool_id")]
    public int CarpoolId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("participation_date")]
    public DateTime ParticipationDate { get; set; } = DateTime.UtcNow;

    [Column("status")]
    [MaxLength(50)]
    public string Status { get; set; } = "Confirmed"; // Confirmed, Cancelled, Validated

    [Column("credits_used")]
    public int CreditsUsed { get; set; }

    [Column("trip_validated")]
    public bool? TripValidated { get; set; }

    [Column("problem_comment")]
    public string? ProblemComment { get; set; }

    // Relationships
    [ForeignKey("CarpoolId")]
    public virtual Carpool Carpool { get; set; } = null!;

    [ForeignKey("UserId")]
    public virtual User Passenger { get; set; } = null!;
}
