using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Data.Models;

[Table("brand")]
public class Brand
{
    [Key]
    [Column("brand_id")]
    public int BrandId { get; set; }

    [Column("label")]
    [MaxLength(80)]
    public string Label { get; set; } = string.Empty;

    // Relationships
    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
