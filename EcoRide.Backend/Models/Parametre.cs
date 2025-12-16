using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EcoRide.Backend.Models;

[Table("parametre")]
public class Parametre
{
    [Key]
    [Column("parametre_id")]
    public int ParametreId { get; set; }

    [Column("propriete")]
    [MaxLength(50)]
    public string Propriete { get; set; } = string.Empty;

    [Column("valeur")]
    [MaxLength(50)]
    public string Valeur { get; set; } = string.Empty;

    [Column("id_configuration")]
    public int IdConfiguration { get; set; }

    // Relations
    [ForeignKey("IdConfiguration")]
    public virtual Configuration Configuration { get; set; } = null!;
}
