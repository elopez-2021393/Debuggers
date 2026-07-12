export const reservationSchemas = {
    Reservation: {
        type: "object",
        required: [
            "userId",
            "reservationDate",
            "reservationHour",
            "peopleName",
            "restaurantName",
            "tableId",
            "peopleNumber"
        ],
        properties: {
            _id: {
                type: "string",
                example: "664f1a2b3c4d5e6f7a8b9c0d"
            },
            userId: {
                type: "string",
                example: "user_123"
            },
            reservationDate: {
                type: "string",
                format: "date",
                example: "2026-04-11"
            },
            reservationHour: {
                type: "string",
                example: "19:00"
            },
            peopleName: {
                type: "string",
                maxLength: 100,
                example: "Juan Pérez"
            },
            restaurantName: {
                type: "string",
                example: "La Parrilla Grill"
            },
            tableId: {
                type: "string",
                description: "ID de la mesa asignada",
                example: "69a33af023a771da6aecdd4e"
            },
            peopleNumber: {
                type: "integer",
                minimum: 1,
                maximum: 20,
                example: 4
            },
            observation: {
                type: "string",
                maxLength: 255,
                example: "Mesa cerca de la ventana"
            },
            status: {
                type: "string",
                enum: ["PENDIENTE", "CONFIRMADA", "CANCELADA", "FINALIZADA"],
                example: "PENDIENTE"
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