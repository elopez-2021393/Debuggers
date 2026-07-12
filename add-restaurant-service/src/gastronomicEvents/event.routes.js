import {Router} from 'express';
import {
    createGastronomicEvent,
    getGastronomicEvents,
    getGastronomicEventById,
    updateGastronomicEvent,
    getEventsByRestaurant,
    deleteGastronomicEvent,
    joinEvent,
    leaveEvent,
    applyEvent
} from './events.controller.js';

import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Gastronomic Events
 *   description: Gestión de eventos gastronómicos, promociones y cupones
 */

/**
 * @swagger
 * /add-restaurant/v1/events/restaurant/{restaurantId}:
 *   get:
 *     summary: Obtener eventos activos de un restaurante
 *     description: Devuelve todos los eventos con status `active` del restaurante indicado. No requiere autenticación.
 *     tags: [Gastronomic Events]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante (ObjectId)
 *         example: "664a1f2e8b3c4d0098765432"
 *     responses:
 *       200:
 *         description: Lista de eventos activos
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
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GastronomicEvent'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/restaurant/:restaurantId', getEventsByRestaurant);

/**
 * @swagger
 * /add-restaurant/v1/events:
 *   get:
 *     summary: Listar todos los eventos gastronómicos
 *     description: Devuelve todos los eventos sin filtro. Solo para ADMIN_ROLE y RES_ADMIN_ROLE.
 *     tags: [Gastronomic Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GastronomicEvent'
 *       401:
 *         description: Token JWT no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: El usuario no tiene el rol requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', validateJWT, validateRole('ADMIN_ROLE', 'RES_ADMIN_ROLE'), getGastronomicEvents);

/**
 * @swagger
 * /add-restaurant/v1/events/{id}:
 *   get:
 *     summary: Obtener un evento por ID
 *     description: Devuelve el detalle de un evento gastronómico. No requiere autenticación.
 *     tags: [Gastronomic Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento (ObjectId)
 *         example: "664a1f2e8b3c4d0012345678"
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/GastronomicEvent'
 *       404:
 *         description: Evento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Evento gastronómico no encontrado"
 */
router.get('/:id', getGastronomicEventById);

/**
 * @swagger
 * /add-restaurant/v1/events:
 *   post:
 *     summary: Crear un nuevo evento gastronómico
 *     description: Crea un evento, promoción o cupón. El campo `created_by` se toma automáticamente del JWT. Requiere rol RES_ADMIN_ROLE.
 *     tags: [Gastronomic Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GastronomicEventInput'
 *           example:
 *             name: "Noche de tapas españolas"
 *             description: "Una velada con los mejores tapas de la temporada"
 *             type: "event"
 *             restaurant_id: "664a1f2e8b3c4d0098765432"
 *             schedule:
 *               start_date: "2025-06-01T00:00:00.000Z"
 *               end_date: "2025-06-30T00:00:00.000Z"
 *               recurrence: "weekly"
 *               days_of_week: [5, 6]
 *               time_slots:
 *                 - from: "18:00"
 *                   to: "22:00"
 *             visibility: "public"
 *             max_capacity: 50
 *             tags: ["tapas", "español"]
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
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
 *                   example: "Evento gastronómico creado"
 *                 data:
 *                   $ref: '#/components/schemas/GastronomicEvent'
 *       401:
 *         description: Token JWT no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: El usuario no tiene el rol RES_ADMIN_ROLE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error al crear el evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    createGastronomicEvent
);

/**
 * @swagger
 * /add-restaurant/v1/events/{id}:
 *   patch:
 *     summary: Actualizar un evento gastronómico
 *     description: Actualiza parcialmente los campos de un evento. Requiere JWT y rol RES_ADMIN_ROLE.
 *     tags: [Gastronomic Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento a actualizar
 *         example: "664a1f2e8b3c4d0012345678"
 *     requestBody:
 *       required: true
 *       description: Campos a actualizar (todos opcionales)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GastronomicEventInput'
 *           example:
 *             status: "active"
 *             max_capacity: 75
 *     responses:
 *       200:
 *         description: Evento actualizado exitosamente
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
 *                   example: "Evento gastronómico actualizado"
 *                 data:
 *                   $ref: '#/components/schemas/GastronomicEvent'
 *       400:
 *         description: Evento no encontrado o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token JWT no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: El usuario no tiene el rol requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    updateGastronomicEvent
);

/**
 * @swagger
 * /add-restaurant/v1/events/{id}:
 *   delete:
 *     summary: Eliminar un evento gastronómico
 *     description: Elimina permanentemente un evento. Requiere JWT y rol RES_ADMIN_ROLE.
 *     tags: [Gastronomic Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento a eliminar
 *         example: "664a1f2e8b3c4d0012345678"
 *     responses:
 *       200:
 *         description: Evento eliminado exitosamente
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
 *                   example: "Evento gastronómico eliminado"
 *       400:
 *         description: Evento no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token JWT no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: El usuario no tiene el rol requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    deleteGastronomicEvent
);

/**
 * @swagger
 * /add-restaurant/v1/events/{id}/join:
 *   post:
 *     summary: Inscribirse a un evento
 *     description: |
 *       Permite que un usuario autenticado se inscriba a un evento de tipo `event`.
 *       - El evento debe estar `active`.
 *       - No puede superar el `max_capacity`.
 *       - El usuario no puede inscribirse dos veces.
 *     tags: [Gastronomic Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *         example: "664a1f2e8b3c4d0012345678"
 *     responses:
 *       200:
 *         description: Inscripción exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     evento:
 *                       type: string
 *                       example: "Noche de tapas españolas"
 *                     cuposRestantes:
 *                       oneOf:
 *                         - type: integer
 *                           example: 38
 *                         - type: string
 *                           example: "sin limite"
 *                     fechaEvento:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-01T00:00:00.000Z"
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               tipoInvalido:
 *                 summary: Tipo de evento incorrecto
 *                 value:
 *                   success: false
 *                   message: "Solo puedes inscribirte a eventos, no a promociones o cupones"
 *               eventoLleno:
 *                 summary: Sin cupos disponibles
 *                 value:
 *                   success: false
 *                   message: "El evento está lleno"
 *               yaInscrito:
 *                 summary: Usuario ya inscrito
 *                 value:
 *                   success: false
 *                   message: "Ya estás inscrito a este evento"
 *       401:
 *         description: Token JWT no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/:id/join',
    validateJWT,
    joinEvent
);

/**
 * @swagger
 * /add-restaurant/v1/events/{id}/join:
 *   delete:
 *     summary: Cancelar inscripción a un evento
 *     description: Permite que un usuario autenticado cancele su inscripción. El usuario debe estar previamente inscrito.
 *     tags: [Gastronomic Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *         example: "664a1f2e8b3c4d0012345678"
 *     responses:
 *       200:
 *         description: Inscripción cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Inscripción cancelada con éxito"
 *       400:
 *         description: El usuario no estaba inscrito o el evento no existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No estás inscrito en dicho evento"
 *       401:
 *         description: Token JWT no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
    '/:id/join',
    validateJWT,
    leaveEvent
);

/**
 * @swagger
 * /add-restaurant/v1/events/{id}/apply:
 *   post:
 *     summary: Aplicar una promoción o cupón
 *     description: |
 *       Permite que un usuario autenticado aplique una promoción o cupón.
 *       - Solo válido para tipos `promotion` o `coupon` (no para `event`).
 *       - El evento debe estar `active` y dentro del rango de fechas.
 *       - Si tiene `max_usos`, no puede superarse.
 *       - Los cupones (`coupon`) solo pueden usarse una vez por usuario.
 *     tags: [Gastronomic Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la promoción o cupón
 *         example: "664a1f2e8b3c4d0012345678"
 *     responses:
 *       200:
 *         description: Promoción o cupón aplicado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     mensaje:
 *                       type: string
 *                       example: "Promoción aplicado exitosamente"
 *                     evento:
 *                       type: string
 *                       example: "2x1 en postres"
 *       400:
 *         description: Error de validación al aplicar
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               tipoInvalido:
 *                 summary: Tipo de evento incorrecto
 *                 value:
 *                   success: false
 *                   message: "Este endpoint es solo para las promociones y cupones"
 *               limiteAlcanzado:
 *                 summary: Límite de usos alcanzado
 *                 value:
 *                   success: false
 *                   message: "Esta promoción ya alcanzo el límite de usos"
 *               cuponYaUsado:
 *                 summary: Cupón ya utilizado
 *                 value:
 *                   success: false
 *                   message: "Ya has usado este cupón"
 *               fueraDeVigencia:
 *                 summary: Fuera de fechas
 *                 value:
 *                   success: false
 *                   message: "Está promoción ya no está vigente. Lo sentimos"
 *       401:
 *         description: Token JWT no proporcionado o inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    '/:id/apply',
    validateJWT,
    applyEvent
);

export default router;