export const userSchemas = {
    User: {
        type: "object",
        required: ["firstName", "surname", "email", "username", "password"],
        properties: {
            _id: {
                type: "string",
                example: "664f1a2b3c4d5e6f7a8b9c0d"
            },

            firstName: {
                type: "string",
                maxLength: 35,
                example: "Juan"
            },

            surname: {
                type: "string",
                maxLength: 35,
                example: "Pérez"
            },

            email: {
                type: "string",
                format: "email",
                example: "juan.perez@correo.com"
            },

            phone: {
                type: "string",
                maxLength: 16,
                example: "42459699"
            },

            username: {
                type: "string",
                maxLength: 40,
                example: "juanperez"
            },

            role: {
                type: "string",
                enum: ["ADMIN_ROLE", "RES_ADMIN_ROLE", "USER_ROLE"],
                example: "USER_ROLE"
            },

            isActive: {
                type: "boolean",
                example: true
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