import { body, param } from 'express-validator';
import { validateJWT } from './validate-jwt.js';
import { checkValidators } from './check-validators.js';

export const validateCreateReservation = [
    validateJWT,

    body('reservationDate')
        .notEmpty()
        .withMessage('La fecha de reservación es obligatoria.')
        .isISO8601()
        .withMessage('La fecha debe tener formato válido (YYYY-MM-DD).')
        .toDate()
        .custom((value) => {
            const today = new Date();
            today.setHours(0,0,0,0);
            if (value < today) {
                throw new Error('No se puede reservar en fechas pasadas.');
            }
            return true;
        }),

    body('reservationHour')
        .notEmpty()
        .withMessage('La hora de reservación es obligatoria.')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('La hora debe tener formato HH:mm (24 horas).'),

    body('restaurantName')
        .notEmpty()
        .withMessage('Debe seleccionar un restaurante.')
        .trim()
        .isLength({ max: 100 })
        .withMessage('El nombre del restaurante no puede exceder 100 caracteres.'),

    //mesa en reservación
    body('tableId')
        .notEmpty()
        .withMessage('Debe seleccionar una mesa.')
        .isMongoId()
        .withMessage('El ID de mesa no es válido.'),

    body('peopleNumber')
        .notEmpty()
        .withMessage('El número de personas es obligatorio.')
        .isInt({ min: 1 })
        .withMessage('El mínimo de personas es 1.')
        .toInt(),

    body('observation')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Las observaciones no deben exceder 255 caracteres.'),

    checkValidators
];

//ACTUALIZAR
export const validateUpdateReservation = [
    validateJWT,

    param('id')
        .isMongoId()
        .withMessage('El ID de la reservación no es válido.'),

    body('reservationDate')
        .optional()
        .isISO8601()
        .withMessage('La fecha debe tener formato válido (YYYY-MM-DD).')
        .toDate()
        .custom((value) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (value < today) throw new Error('No se puede reservar en fechas pasadas.');
            return true;
        }),

    body('reservationHour')
        .optional()
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .withMessage('La hora debe tener formato HH:mm (24 horas).'),

    body('peopleName')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('El nombre no puede exceder 100 caracteres.'),

    body('peopleNumber')
        .optional()
        .isInt({ min: 1, max: 20 })
        .withMessage('El número de personas debe ser entre 1 y 20.')
        .toInt(),

    //cambio de mesa
    body('tableId')
        .optional()
        .isMongoId()
        .withMessage('El ID de mesa no es válido.'),

    body('observation')
        .optional()
        .trim()
        .isLength({ max: 255 })
        .withMessage('Las observaciones no deben exceder 255 caracteres.'),

    checkValidators
];

//CONFIRMAR/CANCELAR
export const validateTokenAction = [
    body('token')
        .notEmpty()
        .withMessage('El token de confirmación es obligatorio.'),

    body('action')
        .notEmpty()
        .withMessage('La acción es obligatoria.')
        .trim()
        .toUpperCase()
        .isIn(['CONFIRMAR', 'CANCELAR'])
        .withMessage('Acción inválida. Use CONFIRMAR o CANCELAR.'),

    checkValidators
];