export const restaurantSchemas = {
    Restaurant: {
        type: "object",
        required: ["name", "capacity", "address", "phone", "category", "createdBy"],
        properties: {
            _id: {
                type: "string",
                example: "664f1a2b3c4d5e6f7a8b9c0d"
            },

            name: {
                type: "string",
                maxLength: 100,
                example: "La Trattoria"
            },

            photo: {
                type: "string",
                nullable: true,
                example: "restaurant-550e8400-e29b-41d4-a716-446655440000.jpg"
            },

            capacity: {
                type: "integer",
                minimum: 20,
                example: 50
            },

            address: {
                type: "string",
                example: "6a Avenida 3-45, Zona 1, Ciudad de Guatemala"
            },

            businessHours: {
                type: "object",
                properties: {
                    open: {
                        type: "string",
                        example: "08:00"
                    },
                    close: {
                        type: "string",
                        example: "22:00"
                    }
                }
            },

            phone: {
                type: "string",
                pattern: "^\\d{8}$",
                example: "22345678"
            },

            category: {
                type: "string",
                enum: ["COMIDA_RAPIDA", "ITALIANA", "CHINA", "MEXICANA", "CAFETERIA"],
                example: "ITALIANA"
            },

            contactInfo: {
                type: "object",
                properties: {
                    managerName: {
                        type: "string",
                        example: "Carlos Méndez"
                    },
                    email: {
                        type: "string",
                        format: "email",
                        example: "contacto@latrattoria.com"
                    }
                }
            },

            createdBy: {
                type: "string",
                example: "664f1a2b3c4d5e6f7a8b9c0d"
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
