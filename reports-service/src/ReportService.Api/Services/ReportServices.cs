using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using ReportService.Api.Data;
using ReportService.Api.Models;
using ReportService.Api.Models.DTOs;

namespace ReportService.Api.Services;

public class ReportServices
{
    private const string OrdersCollection = "orders";
    private const string StatusEntregado = "Entregado";
    private const string CachePlataformaKey = "plataforma";

    private static readonly TimeZoneInfo ZonaHorariaLocal =
    TimeZoneInfo.CreateCustomTimeZone("Guatemala", TimeSpan.FromHours(-6), "Guatemala", "Guatemala");

    private readonly IMongoCollection<OrderMongo> _orders;
    private readonly IMongoCollection<RestaurantMongo> _restaurants;
    private readonly ReportsDbContext _db;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromHours(1);

    private readonly TimeSpan _cacheRetention = TimeSpan.FromDays(7);

    public ReportServices(IConfiguration config, ReportsDbContext db)
    {
        var client = new MongoClient(config.GetConnectionString("MongoDB"));
        var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
        _orders = database.GetCollection<OrderMongo>(OrdersCollection);
        _restaurants = database.GetCollection<RestaurantMongo>("restaurants");
        _db = db;
    }

    public async Task<ResumenRestauranteDto> GetResumenRestaurante(string restaurantId)
    {
        var cache = await _db.ReportesCache
            .Where(r => r.RestauranteId == restaurantId && r.EsRestaurante)
            .OrderByDescending(r => r.FechaCalculo)
            .FirstOrDefaultAsync();

        if (cache != null && DateTime.UtcNow - cache.FechaCalculo < _cacheDuration)
        {
            var cachedData = JsonSerializer.Deserialize<ResumenRestauranteDto>(cache.DatosJson)!;
            cachedData.Fuente = "cache";
            return cachedData;
        }

        var filter = Builders<OrderMongo>.Filter.And(
            Builders<OrderMongo>.Filter.Eq(o => o.RestaurantId, restaurantId),
            Builders<OrderMongo>.Filter.Eq(o => o.Status, StatusEntregado)
        );

        var orders = await _orders.Find(filter).ToListAsync();

        var resumen = new ResumenRestauranteDto
        {
            RestaurantId = restaurantId,
            TotalIngresos = orders.Sum(o => o.Total),
            TotalSubtotal = orders.Sum(o => o.Subtotal),
            TotalIva = orders.Sum(o => o.Iva),
            TotalPedidos = orders.Count,
            PromedioTicket = orders.Count > 0 ? orders.Average(o => o.Total) : 0,
            FechaCalculo = DateTime.UtcNow,
            Fuente = "calculado",

            IngresosPorDia = orders
                .GroupBy(o => TimeZoneInfo
                    .ConvertTimeFromUtc(o.CreatedAt, ZonaHorariaLocal)
                    .ToString("yyyy-MM-dd"))
                .Select(g => new IngresosPorDiaDto
                {
                    Fecha = g.Key,
                    Ingresos = g.Sum(o => o.Total),
                    CantidadPedidos = g.Count()
                })
                .OrderBy(x => x.Fecha)
                .ToList(),

            PlatosMasVendidos = orders
                .SelectMany(o => o.Items)
                .GroupBy(i => i.Nombre)
                .Select(g => new PlatoMasVendidoDto
                {
                    Nombre = g.Key,
                    CantidadVendida = g.Sum(i => i.Cantidad),
                    IngresoGenerado = g.Sum(i => i.Subtotal)
                })
                .OrderByDescending(x => x.CantidadVendida)
                .Take(10)
                .ToList(),

            HorasPico = orders
                .GroupBy(o => TimeZoneInfo
                    .ConvertTimeFromUtc(o.CreatedAt, ZonaHorariaLocal).Hour)
                .Select(g => new HoraPicoDto
                {
                    Hora = g.Key,
                    HoraFormateada = $"{g.Key:00}:00 - {g.Key:00}:59",
                    CantidadPedidos = g.Count()
                })
                .OrderByDescending(x => x.CantidadPedidos)
                .ToList()
        };

        await PurgarCacheAntiguo(restaurantId, esRestaurante: true);

        _db.ReportesCache.Add(new ReporteCache
        {
            RestauranteId = restaurantId,
            FechaCalculo = DateTime.UtcNow,
            DatosJson = JsonSerializer.Serialize(resumen),
            EsRestaurante = true
        });
        await _db.SaveChangesAsync();

        return resumen;
    }

    public async Task<ResumenPlataformaDto> GetResumenPlataforma()
    {
        var cache = await _db.ReportesCache
            .Where(r => r.RestauranteId == CachePlataformaKey && !r.EsRestaurante)
            .OrderByDescending(r => r.FechaCalculo)
            .FirstOrDefaultAsync();

        if (cache != null && DateTime.UtcNow - cache.FechaCalculo < _cacheDuration)
        {
            var cachedData = JsonSerializer.Deserialize<ResumenPlataformaDto>(cache.DatosJson)!;
            cachedData.Fuente = "cache";
            return cachedData;
        }

        var filter = Builders<OrderMongo>.Filter.Eq(o => o.Status, StatusEntregado);
        var orders = await _orders.Find(filter).ToListAsync();

        var restaurantIds = orders.Select(o => o.RestaurantId).Distinct().ToList();
        var restaurantsFilter = Builders<RestaurantMongo>.Filter.In(r => r.Id, restaurantIds);
        var restaurants = await _restaurants.Find(restaurantsFilter).ToListAsync();
        var restaurantMap = restaurants.ToDictionary(r => r.Id, r => r.Name);

        var resumen = new ResumenPlataformaDto
        {
            TotalIngresosPlataforma = orders.Sum(o => o.Total),
            TotalSubtotalPlataforma = orders.Sum(o => o.Subtotal),
            TotalIvaPlataforma = orders.Sum(o => o.Iva),
            TotalPedidosPlataforma = orders.Count,
            TotalRestaurantes = orders.Select(o => o.RestaurantId).Distinct().Count(),
            FechaCalculo = DateTime.UtcNow,
            Fuente = "calculado",
            PlatosMasVendidosGlobal = orders
                .SelectMany(o => o.Items.Select(i => new { Item = i, o.RestaurantId }))
                .GroupBy(x => new { x.Item.Nombre, x.RestaurantId })
                .Select(g => new PlatoMasVendidoDto
                {
                    Nombre = g.Key.Nombre,
                    RestauranteNombre = restaurantMap.GetValueOrDefault(g.Key.RestaurantId, "Desconocido"),
                    CantidadVendida = g.Sum(x => x.Item.Cantidad),
                    IngresoGenerado = g.Sum(x => x.Item.Subtotal)
                })
                .OrderByDescending(x => x.CantidadVendida)
                .Take(10)
                .ToList()
        };

        await PurgarCacheAntiguo(CachePlataformaKey, esRestaurante: false);

        _db.ReportesCache.Add(new ReporteCache
        {
            RestauranteId = CachePlataformaKey,
            FechaCalculo = DateTime.UtcNow,
            DatosJson = JsonSerializer.Serialize(resumen),
            EsRestaurante = false
        });
        await _db.SaveChangesAsync();

        return resumen;
    }

    public async Task LimpiarCache(string restaurantId)
    {
        var caches = _db.ReportesCache.Where(r => r.RestauranteId == restaurantId);
        _db.ReportesCache.RemoveRange(caches);
        await _db.SaveChangesAsync();
    }

    private async Task PurgarCacheAntiguo(string restaurantId, bool esRestaurante)
    {
        var limite = DateTime.UtcNow - _cacheRetention;
        var viejos = _db.ReportesCache
            .Where(r => r.RestauranteId == restaurantId
                     && r.EsRestaurante == esRestaurante
                     && r.FechaCalculo < limite);
        _db.ReportesCache.RemoveRange(viejos);
        await _db.SaveChangesAsync();
    }
}