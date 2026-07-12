using System;

namespace ReportService.Api.Models.DTOs;

public class ReporteDtos
{
    public string RestaurantId {get; set;} = string.Empty;
    public decimal TotalIngresos { get; set; }
    public int TotalPedidos { get; set; }
    public decimal PromedioTicket { get; set; }
    public List<IngresosPorDiaDto> IngresosPorDia { get; set; } = new();
    public List<PlatoMasVendidoDto> PlatosMasVendidos { get; set; } = new();
    public List<HoraPicoDto> HorasPico { get; set; } = new();
    public DateTime FechaCalculo { get; set; }
    public string Fuente { get; set; } = string.Empty;

}
