export const reviewSchemas = {
    Review: {
        type: "object",
        required: ["restaurantId", "userId", "userName", "rating", "comment"],
        properties: {
            _id: {
                type: "string",
                example: "69a33af023a771da6aecdd4e"
            },

            restaurantId: {
                type: "string",
                description: "ID del restaurante reseñado",
                example: "69a33af023a771da6aecdd4e"
            },

            userId: {
                type: "string",
                example: "user_abc123"
            },

            userName: {
                type: "string",
                maxLength: 80,
                example: "Juan Pérez"
            },

            rating: {
                type: "number",
                minimum: 1,
                maximum: 5,
                example: 5
            },

            comment: {
                type: "string",
                maxLength: 500,
                example: "Excelente servicio y comida, muy recomendado"
            },

            reply: {
                type: "string",
                nullable: true,
                maxLength: 500,
                description: "Respuesta del restaurante",
                example: "Gracias por su visita, esperamos verle pronto"
            },

            repliedAt: {
                type: "string",
                format: "date-time",
                nullable: true,
                example: "2026-04-11T10:00:00.000Z"
            },

            repliedBy: {
                type: "string",
                nullable: true,
                description: "userId del administrador que respondió",
                example: "admin_123"
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