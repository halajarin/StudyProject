using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("carpool")]
public class Carpool
{
    [Key]
    [Column("carpool_id")]
    public int CarpoolId { get; set; }

    [Column("departure_date")]
    public DateTime DepartureDate { get; set; }

    [Column("departure_time")]
    [MaxLength(80)]
    public string DepartureTime { get; set; } = string.Empty;

    [Column("departure_location")]
    [MaxLength(80)]
    public string DepartureLocation { get; set; } = string.Empty;

    [Column("departure_city")]
    [MaxLength(100)]
    public string DepartureCity { get; set; } = string.Empty;

    [Column("arrival_date")]
    public DateTime ArrivalDate { get; set; }

    [Column("arrival_time")]
    [MaxLength(80)]
    public string ArrivalTime { get; set; } = string.Empty;

    [Column("arrival_location")]
    [MaxLength(80)]
    public string ArrivalLocation { get; set; } = string.Empty;

    [Column("arrival_city")]
    [MaxLength(100)]
    public string ArrivalCity { get; set; } = string.Empty;

    [Column("status")]
    [MaxLength(80)]
    public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Cancelled

    [Column("total_seats")]
    public int TotalSeats { get; set; }

    [Column("available_seats")]
    public int AvailableSeats { get; set; }

    [Column("price_per_person")]
    public float PricePerPerson { get; set; }

    [Column("vehicle_id")]
    public int VehicleId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("estimated_duration_minutes")]
    public int? EstimatedDurationMinutes { get; set; }

    // Relationships
    [ForeignKey("VehicleId")]
    public virtual Vehicle Vehicle { get; set; } = null!;

    [ForeignKey("UserId")]
    public virtual User Driver { get; set; } = null!;

    public virtual ICollection<CarpoolParticipation> Participations { get; set; } = new List<CarpoolParticipation>();
}
