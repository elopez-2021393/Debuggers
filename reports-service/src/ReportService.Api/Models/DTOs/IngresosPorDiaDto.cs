using System;

namespace ReportService.Api.Models.DTOs;

public class IngresosPorDiaDto
{
    public string Fecha { get; set; } = string.Empty;
    public decimal Ingresos { get; set; }
    public int CantidadPedidos { get; set; }
}
