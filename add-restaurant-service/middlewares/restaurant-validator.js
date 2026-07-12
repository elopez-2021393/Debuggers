import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

const CATEGORIES = ['COMIDA_RAPIDA', 'ITALIANA', 'CHINA', 'MEXICANA', 'CAFETERIA'];
export const validateCreateRestaurant = [

    body('name')
        .notEmpty().withMessage('Nombre requerido'),

    body('address')
        .notEmpty().withMessage('Dirección requerida'),

    body('phone')
        .notEmpty().withMessage('Teléfono requerido')
        .isNumeric().withMessage('El teléfono debe contener solo números')
        .isLength({ min: 8, max: 8 }).withMessage('El teléfono debe tener exactamente 8 dígitos')
        .custom(value => {
            if (parseInt(value, 10) < 0) {
                throw new Error('El teléfono no puede ser negativo');
            }
            return true;
        }),

    body('category')
        .notEmpty().withMessage('Categoría requerida')
        .isIn(CATEGORIES)
        .withMessage(`Categoría no válida. Opciones permitidas: ${CATEGORIES.join(', ')}`),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errors.array()
            });
        }

        next();
    }
];