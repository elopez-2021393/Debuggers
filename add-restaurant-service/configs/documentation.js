import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { restaurantSchemas } from '../src/restaurants/restaurant.schema.js'
import { reservationSchemas } from '../src/reservations/reservation.schema.js';
import { menuItemSchemas } from '../src/menu/menu.schema.js';
import { orderSchemas } from '../src/orders/orders.schema.js';
import { reviewSchemas } from '../src/reviews/review.schema.js';
import { tableSchemas } from '../src/tables/tables.schema.js';
import { gastronomicEventSchemas } from '../src/gastronomicEvents/event.schema.js';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DebuggersEats — Add Restaurant Service',
            version: '1.0.0',
            description: 'Documentación del servicio de restaurantes de DebuggersEats'
        },
        servers: [
            {
                url: 'http://localhost:3014',
                description: 'Servidor local'
            }
        ],
        components: {
            schemas: {
                ...restaurantSchemas,
                ...reservationSchemas,
                ...menuItemSchemas,
                ...orderSchemas,
                ...reviewSchemas,
                ...tableSchemas,
                ...gastronomicEventSchemas
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Restaurants', description: 'Gestión de restaurantes' },
            { name: 'Menu', description: 'Platos y bebidas del menú' },
            { name: 'Orders', description: 'Carrito y pedidos' },
            { name: 'Reservations', description: 'Reservaciones de mesas' },
            { name: 'Tables', description: 'Mesas del restaurante' },
            { name: 'Reviews', description: 'Reseñas y respuestas' },
            { name: 'Gastronomic Events', description: 'Eventos, promociones y cupones' }
        ]
    },
    apis: [
        './src/restaurants/restaurant.routes.js',
        './src/menu/menu.routes.js',
        './src/orders/order.routes.js',
        './src/reservations/reservation.routes.js',
        './src/tables/table.routes.js',
        './src/reviews/review.routes.js',
        './src/gastronomicEvents/event.routes.js'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };