import { Router } from 'express';
import { createReservation, getReservation, updateReservation, deleteReservation, confirmOrCancelReservation, checkDisponibilidad, getReservationsByRestaurant } from './reservation.controller.js';
import { validateCreateReservation, validateUpdateReservation, validateTokenAction } from '../../middlewares/reservation-validator.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js'

const router = Router();

router.use(validateJWT);

/**
 * @swagger
 * /add-restaurant/v1/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Crear una nueva reservación
 *     description: Registra una reservación para el usuario autenticado en un restaurante específico
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationDate
 *               - reservationHour
 *               - peopleName
 *               - restaurantName
 *               - peopleNumber
 *             properties:
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 description: Fecha de la reservación (YYYY-MM-DD)
 *                 example: "2026-05-15"
 *               reservationHour:
 *                 type: string
 *                 pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$'
 *                 description: Hora de la reservación en formato HH:mm
 *                 example: "19:00"
 *               peopleName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nombre del titular de la reservación
 *                 example: "Juan Pérez"
 *               restaurantName:
 *                 type: string
 *                 description: Nombre del restaurante
 *                 example: "La Pergola"
 *               peopleNumber:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Número de personas
 *                 example: 4
 *               observation:
 *                 type: string
 *                 maxLength: 255
 *                 description: Observaciones (opcional)
 *                 example: "Mesa cerca de la ventana"
 *     responses:
 *       201:
 *         description: Reservación creada exitosamente
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
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *                 confirmationToken:
 *                   type: string
 *                 tokenExpiresAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Conflicto (reservación duplicada)
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    '/',
    validateCreateReservation,
    createReservation
);

/**
 * @swagger
 * /add-restaurant/v1/reservations/confirm:
 *   post:
 *     tags: [Reservations]
 *     summary: Confirmar o cancelar una reservación
 *     description: Procesa confirmación o cancelación mediante token
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - action
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de confirmación
 *               action:
 *                 type: string
 *                 enum: [CONFIRMAR, CANCELAR]
 *                 description: Acción a ejecutar
 *     responses:
 *       200:
 *         description: Acción realizada exitosamente
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
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Token inválido o expirado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.post(
    '/confirm',
    validateTokenAction,
    confirmOrCancelReservation);

/**
 * @swagger
 * /add-restaurant/v1/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener reservaciones del usuario
 *     description: Devuelve las reservaciones del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservaciones obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno
 */
router.get(
    '/',
    getReservation
);

/**
 * @swagger
 * /add-restaurant/v1/reservations/{id}:
 *   put:
 *     tags: [Reservations]
 *     summary: Actualizar reservación
 *     description: Modifica una reservación existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "664f1a2b3c4d5e6f7a8b9c0d"
 *         description: ID de la reservación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reservationDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-11"
 *               reservationHour:
 *                 type: string
 *                 pattern: '^([01]\\d|2[0-3]):([0-5]\\d)$'
 *                 example: "19:00"
 *               peopleName:
 *                 type: string
 *                 example: "Juan Pérez"
 *               peopleNumber:
 *                 type: integer
 *                 example: 4
 *               observation:
 *                 type: string
 *                 example: "Mesa cerca de la ventana"
 *     responses:
 *       200:
 *         description: Reservación actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Reservación actualizada correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: No encontrada
 *       500:
 *         description: Error interno
 */
router.put(
    '/:id',
    validateUpdateReservation,
    updateReservation
);

/**
 * @swagger
 * /add-restaurant/v1/reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Eliminar reservación
 *     description: Elimina una reservación existente que pertenezca al usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reservación a eliminar
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Reservación eliminada exitosamente
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
 *                   example: "Reservación eliminada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: El usuario no tiene permiso para eliminar esta reservación
 *       404:
 *         description: Reservación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
    '/:id',
    deleteReservation
);

/**
 * @swagger
 * /add-restaurant/v1/reservations/disponibilidad/{restaurantName}:
 *   get:
 *     tags: [Reservations]
 *     summary: Verificar disponibilidad
 *     description: Consulta disponibilidad por fecha y hora
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: restaurantName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "La Parrilla Grill"
 *       - name: date
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-04-11"
 *       - name: hour
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           example: "19:00"
 *     responses:
 *       200:
 *         description: Disponibilidad obtenida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurantName:
 *                       type: string
 *                     date:
 *                       type: string
 *                     hour:
 *                       type: string
 *                     capacityTotal:
 *                       type: integer
 *                     occupied:
 *                       type: integer
 *                     available:
 *                       type: integer
 *                     isAvailable:
 *                       type: boolean
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Restaurante no encontrado
 */
router.get(
    '/disponibilidad/:restaurantName',
    checkDisponibilidad
);

/**
 * @swagger
 * /add-restaurant/v1/reservations/restaurant/{restaurantName}:
 *   get:
 *     tags: [Reservations]
 *     summary: Obtener reservaciones de un restaurante
 *     description: Requiere rol RES_ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: restaurantName
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "La Parrilla Grill"
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, CONFIRMADA, CANCELADA, FINALIZADA]
 *           example: "CONFIRMADA"
 *       - name: date
 *         in: query
 *         schema:
 *           type: string
 *           format: date
 *           example: "2026-04-11"
 *     responses:
 *       200:
 *         description: Reservaciones obtenidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Reservation'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno
 */
router.get(
    '/restaurant/:restaurantName',
    validateRole('RES_ADMIN_ROLE'),
    getReservationsByRestaurant
)
export default router;