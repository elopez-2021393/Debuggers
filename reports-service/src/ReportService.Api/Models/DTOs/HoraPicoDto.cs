using System;

namespace ReportService.Api.Models.DTOs;

public class HoraPicoDto
{
    public int Hora { get; set; }
    public string HoraFormateada { get; set; } = string.Empty;
    public int CantidadPedidos { get; set; }
}
