import { Router } from 'express';
import { createUser, registerUser, activateAccount, login, updatePassword, forgotPassword, resetPasswordController, updateProfile, getUsers, getUserById, toggleUserStatus, deleteUser } from './user.controller.js';
import { validateCreateUser, validateLogin, validateChangePassword, validateForgotPassword, validateResetPassword } from '../middlewares/user-validator.js';
import { refreshTokenController, logoutController, logoutAllController } from './refresh-token.controller.js';
import { validateJWT } from '../middlewares/validate-JWT.js';
import { validateRole } from '../middlewares/validate-role.js';
const router = Router();

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/activate/{token}:
 *   get:
 *     tags: [Auth]
 *     summary: Activar cuenta de usuario
 *     description: Activa la cuenta de un usuario mediante el token enviado por correo electrónico
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de activación recibido por correo
 *     responses:
 *       200:
 *         description: Cuenta activada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cuenta activada exitosamente. Ya puedes iniciar sesión."
 *       400:
 *         description: Token inválido o expirado
 */
router.get('/activate/:token', activateAccount);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     description: Autentica al usuario y retorna un JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nombre de usuario
 *                 example: "admin"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "Admin123!DebuggersEats"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login exitoso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *                       description: JWT de autenticación
 *       401:
 *         description: Credenciales inválidas o cuenta inactiva
 */
router.post('/login', validateLogin, login);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Solicitar restablecimiento de contraseña
 *     description: Envía un correo con el token para restablecer la contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@correo.com"
 *     responses:
 *       200:
 *         description: Instrucciones enviadas al correo exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Se ha enviado un correo con instrucciones para restablecer la contraseña"
 *       400:
 *         description: Correo no encontrado o error en la solicitud
 */
router.post('/forgot-password', validateForgotPassword, forgotPassword);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/reset-password/{token}:
 *   post:
 *     tags: [Auth]
 *     summary: Restablecer contraseña
 *     description: Cambia la contraseña del usuario usando el token de recuperación
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de recuperación recibido por correo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña del usuario
 *                 example: "NuevoPass123!"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña restablecida exitosamente"
 *       400:
 *         description: Token inválido, expirado o contraseña no cumple requisitos
 */
router.post('/reset-password/:token', validateResetPassword, resetPasswordController);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Auto-registro de cliente
 *     description: Permite a un cliente registrarse públicamente. Se envía un correo de activación al completar el registro
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - surname
 *               - email
 *               - username
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 35
 *                 description: Nombre del usuario
 *                 example: "Juan"
 *               surname:
 *                 type: string
 *                 maxLength: 35
 *                 description: Apellido del usuario
 *                 example: "Pérez"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *                 example: "juan.perez@correo.com"
 *               phone:
 *                 type: string
 *                 maxLength: 16
 *                 description: Número de teléfono (opcional)
 *                 example: "42459699"
 *               username:
 *                 type: string
 *                 maxLength: 40
 *                 description: Nombre de usuario único
 *                 example: "juanperez"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "MiPass123!"
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente. Se envía correo de activación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cuenta creada exitosamente. Se ha enviado un correo de activación."
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Errores de validación
 *       409:
 *         description: El email o username ya existe
 */
router.post('/register', registerUser);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth:
 *   post:
 *     tags: [Users]
 *     summary: Crear usuario (admin)
 *     description: Crea un nuevo usuario con cualquier rol. Requiere autenticación y rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - surname
 *               - email
 *               - username
 *               - password
 *               - role
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 35
 *                 description: Nombre del usuario
 *                 example: "María"
 *               surname:
 *                 type: string
 *                 maxLength: 35
 *                 description: Apellido del usuario
 *                 example: "López"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *                 example: "maria.lopez@correo.com"
 *               phone:
 *                 type: string
 *                 maxLength: 16
 *                 description: Número de teléfono (opcional)
 *                 example: "42459700"
 *               username:
 *                 type: string
 *                 maxLength: 40
 *                 description: Nombre de usuario único
 *                 example: "marialopez"
 *               password:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "Admin123!"
 *               role:
 *                 type: string
 *                 enum: [ADMIN_ROLE, RES_ADMIN_ROLE, USER_ROLE]
 *                 description: Rol asignado al usuario
 *                 example: "RES_ADMIN_ROLE"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente. Se envía correo de activación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente. Se ha enviado un correo de activación."
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Errores de validación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    '/',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    validateCreateUser,
    createUser
);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/change-password:
 *   put:
 *     tags: [Auth]
 *     summary: Cambiar contraseña
 *     description: Permite al usuario autenticado cambiar su propia contraseña
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Contraseña actual del usuario
 *                 example: "MiPassActual123!"
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña
 *                 example: "MiPassNueva456!"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente"
 *       400:
 *         description: Contraseña actual incorrecta o nueva contraseña no cumple requisitos
 *       401:
 *         description: No autorizado
 */
router.put(
    '/change-password',
    validateJWT,
    validateChangePassword,
    updatePassword
);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Actualizar perfil propio
 *     description: Permite al usuario autenticado editar su propia información de perfil
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 maxLength: 35
 *                 description: Nuevo nombre
 *                 example: "Juan"
 *               surname:
 *                 type: string
 *                 maxLength: 35
 *                 description: Nuevo apellido
 *                 example: "Pérez"
 *               phone:
 *                 type: string
 *                 maxLength: 16
 *                 description: Nuevo número de teléfono
 *                 example: "42459701"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Perfil actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Errores de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put(
    '/profile',
    validateJWT,
    updateProfile
);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/users:
 *   get:
 *     tags: [Users]
 *     summary: Obtener todos los usuarios
 *     description: Devuelve la lista completa de usuarios. Requiere rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuarios obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 total:
 *                   type: integer
 *                   description: Cantidad total de usuarios
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/users',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    getUsers
);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     description: Devuelve la información de un usuario específico. Requiere rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/users/:id',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    getUserById
);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Activar o desactivar usuario
 *     description: Cambia el estado de activación de un usuario (toggle). Requiere rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Estado del usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario activado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
    '/users/:id/status',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    toggleUserStatus
);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema. Requiere rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
    '/users/:id',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    deleteUser
);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar tokens
 *     description: |
 *       Rota el refresh token y devuelve un nuevo par (accessToken + refreshToken).
 *       Si el token ya fue usado anteriormente, revoca toda la familia de tokens
 *       (detección de robo de sesión).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token recibido en el login
 *     responses:
 *       200:
 *         description: Tokens renovados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: number
 *                   example: 900
 *       401:
 *         description: Token inválido, expirado o sesión comprometida
 */
router.post(
    '/refresh',
    refreshTokenController
);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión
 *     description: Revoca el refresh token actual
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 */
router.post(
    '/logout',
    logoutController
);

/**
 * @swagger
 * /debuggersEatsAdmin/v1/auth/logout-all:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión en todos los dispositivos
 *     description: Revoca todos los refresh tokens del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las sesiones cerradas
 *       401:
 *         description: No autorizado
 */
router.post(
    '/logout-all',
    validateJWT,
    logoutAllController
);

export default router;