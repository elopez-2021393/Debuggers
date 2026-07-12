using System;

namespace ReportService.Api.Models.DTOs;

public class PlatoMasVendidoDto
{
    public string Nombre { get; set; } = string.Empty;
    public int CantidadVendida { get; set; }
    public decimal IngresoGenerado { get; set; }
    public string RestauranteNombre { get; set; } = string.Empty;
}