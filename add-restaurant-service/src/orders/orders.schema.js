export const orderSchemas = {
    Order: {
        type: "object",
        required: [
            "restaurantId",
            "userId",
            "items",
            "direccion",
            "telefono",
            "tipoPago"
        ],
        properties: {
            _id: {
                type: "string",
                example: "664f1a2b3c4d5e6f7a8b9c0d"
            },
            restaurantId: {
                type: "string",
                example: "69a33af023a771da6aecdd4e"
            },
            userId: {
                type: "string",
                example: "664f1a2b3c4d5e6f7a8b9c0a"
            },

            items: {
                type: "array",
                minItems: 1,
                items: {
                    type: "object",
                    required: ["menuItemId", "nombre", "precio", "cantidad", "subtotal"],
                    properties: {
                        menuItemId: {
                            type: "string",
                            example: "69a33af023a771da6aecdd4e"
                        },
                        nombre: {
                            type: "string",
                            example: "Pizza Debug"
                        },
                        precio: {
                            type: "number",
                            example: 40
                        },
                        cantidad: {
                            type: "integer",
                            minimum: 1,
                            example: 2
                        },
                        aditamentos: {
                            type: "array",
                            items: {
                                type: "string"
                            },
                            example: ["extra queso", "sin cebolla"]
                        },
                        subtotal: {
                            type: "number",
                            example: 80
                        }
                    }
                }
            },

            direccion: {
                type: "object",
                required: ["descripcion"],
                properties: {
                    tipo: {
                        type: "string",
                        enum: ["Casa", "Trabajo", "Otro"],
                        example: "Casa"
                    },
                    descripcion: {
                        type: "string",
                        example: "Zona 1, frente al parque"
                    },
                    referencias: {
                        type: "string",
                        example: "Casa color azul"
                    }
                }
            },

            telefono: {
                type: "string",
                example: "42459699"
            },

            tipoPago: {
                type: "string",
                enum: ["Tarjeta", "Efectivo"],
                example: "Efectivo"
            },

            estimadoEntrega: {
                type: "string",
                example: "30-45 minutos"
            },

            subtotal: {
                type: "number",
                example: 80
            },
            iva: {
                type: "number",
                example: 9.6
            },
            total: {
                type: "number",
                example: 89.6
            },

            status: {
                type: "string",
                enum: ["Pendiente", "En_preparación", "Aceptado", "Listo", "Entregado", "Cancelado"],
                example: "Pendiente"
            },

            notas: {
                type: "string",
                example: "Sin picante"
            },

            historialStatus: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            example: "Pendiente"
                        },
                        cambiadoEn: {
                            type: "string",
                            format: "date-time",
                            example: "2026-04-11T10:00:00.000Z"
                        }
                    }
                }
            },

            createdAt: {
                type: "string",
                format: "date-time",
                example: "2026-04-11T10:00:00.000Z"
            },
            updatedAt: {
                type: "string",
                format: "date-time",
                example: "2026-04-11T10:00:00.000Z"
            }
        }
    }
};