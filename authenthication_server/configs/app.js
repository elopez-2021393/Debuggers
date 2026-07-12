'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { hash } from '@node-rs/bcrypt';
import User from '../src/user.model.js';
import { corsOptions } from './cors.configuration.js';
import { helmetOptions } from './helmet.configuration.js';
import { dbConnection } from './db.configuration.js';
import { requestLimit } from './rateLimit.configuration.js';
import { errorHandler } from '../middlewares/handle-errors.js';
import authRoutes from '../src/user.routes.js';
import { swaggerSpec, swaggerUi } from "./documentation.js";

const BASE_PATH = '/debuggersEatsAdmin/v1';

const routes = (app) => {
    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timeStamp: new Date().toISOString(),
            service: 'Debuggers Eats Admin Server'
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
    app.use(requestLimit);
};


const seederAdmin = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('Usuario administrador ya existe');
        } else {
            const hashedPassword = await hash('Admin123!DebuggersEats', 10);
            const admin = new User({
                firstName: 'Administrador',
                surname: 'Principal',
                email: 'admin@debuggerseats.com',
                phone: '42459699',
                username: 'admin',
                password: hashedPassword,
                role: 'ADMIN_ROLE',
                isActive: true
            });
            await admin.save();
            console.log('Usuario administrador creado exitosamente');
        }
    } catch (e) {
        console.error('Error al crear administradores:', e.message);
    }
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;
    app.set('trust proxy', 1);

    try {
        middlewares(app);
        await dbConnection();
        await seederAdmin();

        routes(app);
        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Debuggers Eats Server running on port: ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
            console.log(`Swagger docs: http://localhost:${PORT}${BASE_PATH}/api-docs`);
        });
    } catch (e) {
        console.error(`Error al iniciar el servidor: ${e.message}`);
        process.exit(1);
    }
};