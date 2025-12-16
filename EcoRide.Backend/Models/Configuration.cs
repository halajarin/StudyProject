using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("configuration")]
public class Configuration
{
    [Key]
    [Column("id_configuration")]
    public int IdConfiguration { get; set; }

    [Column("libelle")]
    [MaxLength(100)]
    public string Libelle { get; set; } = string.Empty;

    [Column("valeur")]
    [MaxLength(255)]
    public string Valeur { get; set; } = string.Empty;

    [Column("date_modification")]
    public DateTime DateModification { get; set; } = DateTime.UtcNow;

    // Relations
    public virtual ICollection<Parametre> Parametres { get; set; } = new List<Parametre>();
}
