using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("user")]
public class User
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("last_name")]
    [MaxLength(80)]
    public string LastName { get; set; } = string.Empty;

    [Column("first_name")]
    [MaxLength(80)]
    public string FirstName { get; set; } = string.Empty;

    [Column("email")]
    [MaxLength(80)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Column("password")]
    [MaxLength(80)]
    public string Password { get; set; } = string.Empty;

    [Column("phone")]
    [MaxLength(80)]
    public string? Phone { get; set; }

    [Column("address")]
    [MaxLength(80)]
    public string? Address { get; set; }

    [Column("birth_date")]
    public DateTime? BirthDate { get; set; }

    [Column("photo")]
    public byte[]? Photo { get; set; }

    [Column("pseudo")]
    [MaxLength(80)]
    public string Username { get; set; } = string.Empty;

    [Column("credit")]
    public int Credits { get; set; } = 20; // 20 credits on creation

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("preferred_language")]
    [MaxLength(5)]
    public string PreferredLanguage { get; set; } = "en";

    // Relationships
    public virtual ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    public virtual ICollection<CarpoolParticipation> Participations { get; set; } = new List<CarpoolParticipation>();
    public virtual ICollection<Carpool> CarpoolsCreated { get; set; } = new List<Carpool>();
    public virtual ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();
    public virtual ICollection<Review> ReviewsReceived { get; set; } = new List<Review>();
}
