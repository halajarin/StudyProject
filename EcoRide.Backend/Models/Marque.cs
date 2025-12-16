using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("marque")]
public class Marque
{
    [Key]
    [Column("marque_id")]
    public int MarqueId { get; set; }

    [Column("libelle")]
    [MaxLength(80)]
    public string Libelle { get; set; } = string.Empty;

    // Relations
    public virtual ICollection<Voiture> Voitures { get; set; } = new List<Voiture>();
}
