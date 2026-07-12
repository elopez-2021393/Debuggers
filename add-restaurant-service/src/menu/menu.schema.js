export const menuItemSchemas = {
    MenuItem: {
        type: "object",
        required: ["name", "price", "category", "restaurantId"],
        properties: {
            _id: {
                type: "string",
                example: "69a33af023a771da6aecdd4e"
            },
            name: {
                type: "string",
                maxLength: 100,
                example: "Pizza Debug"
            },
            photo: {
                type: "string",
                nullable: true,
                description: "URL de la foto del plato",
                example: "https://storage.example.com/menus/pizza.jpg"
            },
            description: {
                type: "string",
                maxLength: 255,
                example: "Buenas pizzas y baratas"
            },
            ingredients: {
                type: "array",
                items: {
                    type: "string"
                },
                example: ["queso", "tomate", "jamón"]
            },
            price: {
                type: "number",
                minimum: 0,
                example: 40
            },
            category: {
                type: "string",
                enum: ["DESAYUNO", "ALMUERZO", "CENA", "BEBIDA", "POSTRE"],
                example: "ALMUERZO"
            },
            availability: {
                type: "object",
                properties: {
                    days: {
                        type: "array",
                        items: {
                            type: "string",
                            enum: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]
                        },
                        example: ["LUNES", "MIERCOLES", "VIERNES"]
                    }
                }
            },
            restaurantId: {
                type: "string",
                description: "ID del restaurante",
                example: "69a33af023a771da6aecdd4e"
            },
            available: {
                type: "boolean",
                example: true,
                description: "Indica si el plato está disponible"
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