'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './cors.configuration.js';
import { helmetOptions } from './helmet.configuration.js';
import { dbConnection } from './db.configuration.js';
import { swaggerSpec, swaggerUi } from "./documentation.js";
import restaurantRoutes from '../src/restaurants/restaurant.routes.js';
import menuRoutes from '../src/menu/menu.routes.js';
import orderRoutes from '../src/orders/order.routes.js';
import eventRoutes from '../src/gastronomicEvents/event.routes.js'
import reservationRoutes from '../src/reservations/reservation.routes.js'
import tableRoutes from '../src/tables/table.routes.js';
import reviewRoutes from '../src/reviews/review.routes.js';

const BASE_PATH = '/add-restaurant/v1';

const routes = (app) => {

    app.use(`${BASE_PATH}/restaurants`, restaurantRoutes);
    app.use(`${BASE_PATH}/menu`, menuRoutes);
    app.use(`${BASE_PATH}/orders`, orderRoutes);
    app.use(`${BASE_PATH}/events`, eventRoutes);
    app.use(`${BASE_PATH}/reservations`, reservationRoutes);
    app.use(`${BASE_PATH}/tables`, tableRoutes);
    app.use(`${BASE_PATH}/reviews`, reviewRoutes);
    app.use(`${BASE_PATH}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timeStamp: new Date().toISOString(),
            service: 'Add Restaurant Service'
        });
    });

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado'
        });
    });
};

const middlewares = (app) => {
    app.use(cors(corsOptions));
    app.use(helmet(helmetOptions));
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
};

export const initServer = async () => {

    const app = express();
    const PORT = process.env.PORT;

    app.set('trust proxy', 1);

    try {
        middlewares(app);
        await dbConnection();
        routes(app);
        //app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Add Restaurant Service running on port ${PORT}`);
            console.log(`Health check endpoint: http://localhost:${PORT}${BASE_PATH}/health`);
            console.log(`Swagger docs: http://localhost:${PORT}${BASE_PATH}/api-docs`);
        });

    } catch (err) {
        console.error(`Add Restaurant Service - Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }
};