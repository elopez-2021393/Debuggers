using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ReportService.Api.Models;

[BsonIgnoreExtraElements]

public class OrderMongo
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    [BsonElement("restaurantId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string RestaurantId { get; set; } = string.Empty;

    [BsonElement("userId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = string.Empty;

    [BsonElement("items")]
    public List<OrderItemMongo> Items { get; set; } = new();

    [BsonElement("direccion")]
    public DireccionMongo Direccion { get; set; } = new();

    [BsonElement("telefono")]
    public string Telefono { get; set; } = string.Empty;

    [BsonElement("tipoPago")]
    public string TipoPago { get; set; } = string.Empty;

    [BsonElement("estimadoEntrega")]
    public string EstimadoEntrega { get; set; } = string.Empty;

    [BsonElement("total")]
    public decimal Total { get; set; }

    [BsonElement("subtotal")]
    public decimal Subtotal { get; set; }

    [BsonElement("iva")]
    public decimal Iva { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = string.Empty;

    [BsonElement("notas")]
    public string Notas { get; set; } = string.Empty;

    [BsonElement("historialStatus")]
    public List<HistorialStatusMongo> HistorialStatus { get; set; } = new();

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; }

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; }
}

public class OrderItemMongo
{
    [BsonElement("menuItemId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string MenuItemId { get; set; } = string.Empty;

    [BsonElement("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [BsonElement("precio")]
    public decimal Precio { get; set; }

    [BsonElement("cantidad")]
    public int Cantidad { get; set; }

    [BsonElement("aditamentos")]
    public List<string> Aditamentos { get; set; } = new();

    [BsonElement("subtotal")]
    public decimal Subtotal { get; set; }
}

public class DireccionMongo
{
    [BsonElement("tipo")]
    public string Tipo { get; set; } = string.Empty;

    [BsonElement("descripcion")]
    public string Descripcion { get; set; } = string.Empty;

    [BsonElement("referencias")]
    public string Referencias { get; set; } = string.Empty;
}

public class HistorialStatusMongo
{
    [BsonElement("status")]
    public string Status { get; set; } = string.Empty;

    [BsonElement("cambiadoEn")]
    public DateTime CambiadoEn { get; set; }
}

[BsonIgnoreExtraElements]
public class RestaurantMongo
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)] 
    public string Id { get; set; } = string.Empty;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;
}