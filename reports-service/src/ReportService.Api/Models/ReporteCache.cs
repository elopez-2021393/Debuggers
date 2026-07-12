using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReportService.Api.Models;
//masd rapido
[Table("reportes_cache")]
public class ReporteCache
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string RestauranteId { get; set; } = string.Empty;

    public DateTime FechaCalculo { get; set; } = DateTime.UtcNow;

    [Required]
    public string DatosJson { get; set; } = string.Empty;

    public bool EsRestaurante { get; set; } = true;
}