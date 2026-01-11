using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using EcoRide.Backend.Dtos.Enums;

namespace EcoRide.Backend.Data.Models;

[Table("vehicle")]
public class Vehicle
{
    [Key]
    [Column("vehicle_id")]
    public int VehicleId { get; set; }

    [Column("model")]
    [MaxLength(80)]
    public string Model { get; set; } = string.Empty;

    [Column("registration_number")]
    [MaxLength(80)]
    public string RegistrationNumber { get; set; } = string.Empty;

    [Column("energy_type")]
    public EnergyType EnergyType { get; set; } = EnergyType.Gasoline;

    [Column("color")]
    [MaxLength(80)]
    public string Color { get; set; } = string.Empty;

    [Column("first_registration_date")]
    public DateTime? FirstRegistrationDate { get; set; }

    [Column("brand_id")]
    public int BrandId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("seat_count")]
    public int SeatCount { get; set; }

    // Relationships
    [ForeignKey("BrandId")]
    public virtual Brand Brand { get; set; } = null!;

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;

    public virtual ICollection<Carpool> Carpools { get; set; } = new List<Carpool>();
}
