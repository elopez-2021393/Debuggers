import { body, param } from 'express-validator';
import User from '../src/user.model.js';
import { checkValidators } from './check-validators.js';

export const validateCreateUser = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 35 })
        .withMessage('El nombre debe de tener entre 2 y 35 caracteres.'),
    body('surname')
        .trim()
        .notEmpty()
        .withMessage('El apellido es obligatorio')
        .isLength({ min: 2, max: 35 })
        .withMessage('El apellido debe de tener entre 2 y 35 caracteres.'),
    body('email')
        .notEmpty()
        .withMessage('El correo es obligatorio')
        .isEmail()
        .withMessage('El correo debe de tener un formato válido')
        .custom(async (value) => {
            const existUser = await User.findOne({ email: value });
            if (existUser) {
                throw new Error("Correo ya registrado. Por favor ingrese otro correo.");
            }
            return true;
        }),
    body('phone')
        .optional()
        .isNumeric()
        .withMessage('Debe de ingresar números en el teléfono')
        .isLength({ min: 8, max: 16 })
        .withMessage('El teléfono debe de tener entre 8 y 16 caracteres.'),
    body('username')
        .trim()
        .notEmpty()
        .withMessage('El username es obligatorio')
        .isLength({ min: 2, max: 40 })
        .withMessage('El username debe de tener entre 2 y 40 caracteres.')
        .custom(async (value) => {
            const existUser = await User.findOne({ username: value });
            if (existUser) {
                throw new Error("Username ya registrado. Por favor ingrese otro username");
            }
            return true;
        }),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Debe de crear una contraseña')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe de contener como mínimo 8 caracteres'),
    body('role')
        .notEmpty()
        .withMessage('El rol es obligatorio')
        .isIn(['ADMIN_ROLE', 'RES_ADMIN_ROLE', 'USER_ROLE'])
        .withMessage('Rol no válido'),
    body('restaurantId')
        .optional()
        .custom((value, { req }) => {
            if (req.body.role === 'RES_ADMIN_ROLE' && !value) {
                throw new Error('Debe asignar un restaurante al RES_ADMIN_ROLE');
            }
            return true;
        }),
    checkValidators,
];

//auto-registro público de clientes
export const validateRegisterUser = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 35 })
        .withMessage('El nombre debe de tener entre 2 y 35 caracteres.'),
    body('surname')
        .trim()
        .notEmpty()
        .withMessage('El apellido es obligatorio')
        .isLength({ min: 2, max: 35 })
        .withMessage('El apellido debe de tener entre 2 y 35 caracteres.'),
    body('email')
        .notEmpty()
        .withMessage('El correo es obligatorio')
        .isEmail()
        .withMessage('El correo debe de tener un formato válido')
        .custom(async (value) => {
            const existUser = await User.findOne({ email: value });
            if (existUser) {
                throw new Error("Correo ya registrado. Por favor ingrese otro correo.");
            }
            return true;
        }),
    body('phone')
        .optional()
        .isNumeric()
        .withMessage('Debe de ingresar números en el teléfono')
        .isLength({ min: 8, max: 16 })
        .withMessage('El teléfono debe de tener entre 8 y 16 caracteres.'),
    body('username')
        .trim()
        .notEmpty()
        .withMessage('El username es obligatorio')
        .isLength({ min: 2, max: 40 })
        .withMessage('El username debe de tener entre 2 y 40 caracteres.')
        .custom(async (value) => {
            const existUser = await User.findOne({ username: value });
            if (existUser) {
                throw new Error("Username ya registrado. Por favor ingrese otro username");
            }
            return true;
        }),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Debe de crear una contraseña')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe de contener como mínimo 8 caracteres'),
    checkValidators,
];

export const validateLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('El username o email es obligatorio'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('La contraseña es obligatoria'),
    checkValidators,
];

export const validateChangePassword = [
    body('currentPassword')
        .trim()
        .notEmpty()
        .withMessage('La contraseña actual es obligatoria'),
    body('newPassword')
        .trim()
        .notEmpty()
        .withMessage('La nueva contraseña es obligatoria')
        .isLength({ min: 8 })
        .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('La nueva contraseña debe ser diferente a la actual');
            }
            return true;
        }),
    checkValidators,
];

export const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('El correo electrónico es obligatorio')
        .isEmail()
        .withMessage('Debe proporcionar un correo electrónico válido'),
    checkValidators,
];

export const validateResetPassword = [
    body('newPassword')
        .trim()
        .notEmpty()
        .withMessage('La nueva contraseña es obligatoria')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),
    checkValidators,
];

//aqui empieza ls validaciones edición de perfil propio
export const validateUpdateProfile = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 35 })
        .withMessage('El nombre debe de tener entre 2 y 35 caracteres.'),
    body('surname')
        .optional()
        .trim()
        .isLength({ min: 2, max: 35 })
        .withMessage('El apellido debe de tener entre 2 y 35 caracteres.'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('El correo debe de tener un formato válido'),
    body('phone')
        .optional()
        .isNumeric()
        .withMessage('Debe de ingresar números en el teléfono')
        .isLength({ min: 8, max: 16 })
        .withMessage('El teléfono debe de tener entre 8 y 16 caracteres.'),
    body('username')
        .optional()
        .trim()
        .isLength({ min: 2, max: 40 })
        .withMessage('El username debe de tener entre 2 y 40 caracteres.'),
    body('password')
        .not().exists()
        .withMessage('Para cambiar la contraseña usa el endpoint /change-password'),
    body('role')
        .not().exists()
        .withMessage('No puedes cambiar tu propio rol'),
    checkValidators,
];