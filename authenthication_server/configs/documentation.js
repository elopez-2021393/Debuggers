import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import {userSchemas} from '../src/user.schema.js';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Debuggers Eats Admin API',
            version: '1.0.0',
            description: 'Documentación de la API de restaurantes DebuggersEats'
        },
        components: {
            schemas:{
                ...userSchemas
            },
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        servers: [
            {
                url: 'http://localhost:3013',
                description: 'Servidor local'
            }
        ]
    },
    apis: ['./src/user.routes.js']
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };