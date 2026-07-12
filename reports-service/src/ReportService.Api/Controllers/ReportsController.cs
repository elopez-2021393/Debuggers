using Microsoft.AspNetCore.Mvc;
using ReportService.Api.Models.DTOs;
using ReportService.Api.Services;

namespace ReportService.Api.Controllers;

/// <summary>
/// Gestión de reportes y estadísticas de DebuggersEats
/// </summary>
[ApiController]
[Route("api/reports")]
[Produces("application/json")]
public class ReportsController : ControllerBase
{
    private readonly ReportServices _service;

    public ReportsController(ReportServices service)
    {
        _service = service;
    }

    /// <summary>
    /// Health check del servicio
    /// </summary>
    /// <remarks>
    /// Verifica que el servicio de reportes esté corriendo correctamente
    /// </remarks>
    /// <response code="200">Servicio funcionando correctamente</response>
    [HttpGet("health")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public IActionResult Health() => Ok(new
    {
        status = "Healthy",
        service = "Debuggers Eats Reports Service",
        timestamp = DateTime.UtcNow
    });

    /// <summary>
    /// Obtener reporte de un restaurante
    /// </summary>
    /// <remarks>
    /// Devuelve el resumen de ingresos, pedidos, platos más vendidos y horas pico de un restaurante.
    /// El resultado se cachea en PostgreSQL por 1 hora. Si existe caché válido se devuelve directamente,
    /// de lo contrario se recalcula desde MongoDB y se guarda en caché
    /// </remarks>
    /// <param name="restaurantId">ID del restaurante en MongoDB</param>
    /// <response code="200">Reporte obtenido exitosamente</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("restaurant/{restaurantId}")]
    [ProducesResponseType(typeof(ApiResponse<ResumenRestauranteDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetResumen(string restaurantId)
    {
        try
        {
            var resumen = await _service.GetResumenRestaurante(restaurantId);
            return Ok(new { success = true, data = resumen });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Obtener reporte global de la plataforma
    /// </summary>
    /// <remarks>
    /// Devuelve el resumen agregado de toda la plataforma: ingresos totales, pedidos totales,
    /// cantidad de restaurantes activos y los platos más vendidos globalmente.
    /// El resultado se cachea en PostgreSQL por 1 hora
    /// </remarks>
    /// <response code="200">Reporte de plataforma obtenido exitosamente</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpGet("plataforma")]
    [ProducesResponseType(typeof(ApiResponse<ResumenPlataformaDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetResumenPlataforma()
    {
        try
        {
            var resumen = await _service.GetResumenPlataforma();
            return Ok(new { success = true, data = resumen });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Limpiar caché de un restaurante
    /// </summary>
    /// <remarks>
    /// Elimina todas las entradas de caché almacenadas en PostgreSQL para el restaurante indicado.
    /// El siguiente GET a ese restaurante recalculará el reporte desde MongoDB
    /// </remarks>
    /// <param name="restaurantId">ID del restaurante cuyo caché se desea limpiar</param>
    /// <response code="200">Caché limpiado exitosamente</response>
    /// <response code="500">Error interno del servidor</response>
    [HttpDelete("cache/{restaurantId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> LimpiarCache(string restaurantId)
    {
        try
        {
            await _service.LimpiarCache(restaurantId);
            return Ok(new { success = true, message = "Caché limpiado exitosamente" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = ex.Message });
        }
    }
}

/// <summary>
/// Wrapper genérico para respuestas de la API
/// </summary>
/// <typeparam name="T">Tipo del campo data</typeparam>
public class ApiResponse<T>
{
    /// <example>true</example>
    public bool Success { get; set; }
    /// <summary>Datos del reporte</summary>
    public T? Data { get; set; }
}
