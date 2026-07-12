export const tableSchemas = {
    Table: {
        type: "object",
        required: ["restaurantId", "tableNumber", "capacity"],
        properties: {
            _id: {
                type: "string",
                example: "69a33af023a771da6aecdd4e"
            },

            restaurantId: {
                type: "string",
                example: "69a33af023a771da6aecdd4e"
            },

            tableNumber: {
                type: "string",
                maxLength: 20,
                example: "Mesa 5"
            },

            capacity: {
                type: "integer",
                minimum: 1,
                maximum: 20,
                example: 4
            },

            location: {
                type: "string",
                maxLength: 100,
                example: "Terraza"
            },

            isActive: {
                type: "boolean",
                example: true,
                description: "Indica si la mesa está habilitada"
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