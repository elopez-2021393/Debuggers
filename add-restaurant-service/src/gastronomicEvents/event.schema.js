export const gastronomicEventSchemas = {
    TimeSlot: {
        type: "object",
        required: ["from", "to"],
        properties: {
            from: {
                type: "string",
                example: "18:00",
                description: "Hora de inicio (HH:MM)"
            },
            to: {
                type: "string",
                example: "22:00",
                description: "Hora de fin (HH:MM)"
            }
        }
    },

    Schedule: {
        type: "object",
        required: ["start_date", "end_date"],
        properties: {
            start_date: {
                type: "string",
                format: "date-time",
                example: "2025-06-01T00:00:00.000Z"
            },
            end_date: {
                type: "string",
                format: "date-time",
                example: "2025-06-30T00:00:00.000Z"
            },
            recurrence: {
                type: "string",
                enum: ["none", "daily", "weekly", "monthly"],
                default: "none"
            },
            days_of_week: {
                type: "array",
                items: {
                    type: "integer",
                    minimum: 0,
                    maximum: 6
                },
                description: "0 = Domingo, 6 = Sábado",
                example: [5, 6]
            },
            time_slots: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/TimeSlot"
                }
            }
        }
    },

    GastronomicEvent: {
        type: "object",
        properties: {
            _id: {
                type: "string",
                example: "664a1f2e8b3c4d0012345678"
            },
            name: {
                type: "string",
                example: "Noche de tapas españolas"
            },
            description: {
                type: "string",
                example: "Una velada con los mejores tapas de la temporada"
            },
            type: {
                type: "string",
                enum: ["event", "promotion", "coupon"]
            },
            status: {
                type: "string",
                enum: ["draft", "active", "paused", "expired", "cancelled"],
                default: "draft"
            },
            restaurant_id: {
                type: "string",
                example: "664a1f2e8b3c4d0098765432"
            },
            schedule: {
                $ref: "#/components/schemas/Schedule"
            },
            visibility: {
                type: "string",
                enum: ["public", "private", "members_only"],
                default: "public"
            },
            max_capacity: {
                type: "integer",
                example: 50
            },
            current_capacity: {
                type: "integer",
                example: 12
            },
            tags: {
                type: "array",
                items: {
                    type: "string"
                },
                example: ["tapas", "español"]
            },
            max_usos: {
                type: "integer",
                nullable: true,
                example: 100
            },
            usos_actuales: {
                type: "integer",
                example: 5
            },
            created_by: {
                type: "string",
                example: "664a1f2e8b3c4d0011223344"
            },
            created_at: {
                type: "string",
                format: "date-time",
                example: "2026-04-11T10:00:00.000Z"
            },
            updated_at: {
                type: "string",
                format: "date-time",
                example: "2026-04-11T10:00:00.000Z"
            }
        }
    },

    GastronomicEventInput: {
        type: "object",
        required: ["name", "type", "restaurant_id", "schedule"],
        properties: {
            name: {
                type: "string",
                minLength: 3,
                maxLength: 100,
                example: "Noche de tapas españolas"
            },
            description: {
                type: "string",
                maxLength: 500,
                example: "Una velada con los mejores tapas de la temporada"
            },
            type: {
                type: "string",
                enum: ["event", "promotion", "coupon"],
                example: "event"
            },
            status: {
                type: "string",
                enum: ["draft", "active", "paused", "expired", "cancelled"],
                default: "draft"
            },
            restaurant_id: {
                type: "string",
                example: "664a1f2e8b3c4d0098765432"
            },
            schedule: {
                $ref: "#/components/schemas/Schedule"
            },
            visibility: {
                type: "string",
                enum: ["public", "private", "members_only"],
                default: "public"
            },
            max_capacity: {
                type: "integer",
                minimum: 1,
                maximum: 10000,
                example: 50
            },
            tags: {
                type: "array",
                maxItems: 10,
                items: {
                    type: "string"
                },
                example: ["tapas", "español"]
            },
            max_usos: {
                type: "integer",
                nullable: true,
                example: 100
            }
        }
    },

    ErrorResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: false
            },
            message: {
                type: "string",
                example: "Descripción del error"
            }
        }
    }
};