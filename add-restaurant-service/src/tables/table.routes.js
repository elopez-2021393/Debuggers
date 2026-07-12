import { Router } from 'express';
import { createTable, getTablesByRestaurant, getTableById, updateTable, toggleTableStatus, deleteTable } from './table.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

/**
 * @swagger
 * /add-restaurant/v1/tables:
 *   post:
 *     tags: [Tables]
 *     summary: Crear una nueva mesa
 *     description: Crea una mesa asociada a un restaurante. Solo el administrador del restaurante puede crear mesas. No se permiten dos mesas con el mismo número en el mismo restaurante. Requiere autenticación y rol RES_ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - tableNumber
 *               - capacity
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 description: ID del restaurante al que pertenece la mesa
 *                 example: "69a33af023a771da6aecdd4e"
 *               tableNumber:
 *                 type: string
 *                 maxLength: 20
 *                 description: Número o nombre identificador de la mesa
 *                 example: "Mesa 5"
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Capacidad máxima de personas en la mesa
 *                 example: 4
 *               location:
 *                 type: string
 *                 maxLength: 100
 *                 description: Ubicación de la mesa dentro del restaurante (opcional)
 *                 example: "Terraza"
 *     responses:
 *       201:
 *         description: Mesa creada exitosamente
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
 *                   example: "Mesa creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para agregar mesas a este restaurante
 *       404:
 *         description: Restaurante no encontrado
 *       409:
 *         description: Ya existe una mesa con ese número en este restaurante
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    '/',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    createTable
);

/**
 * @swagger
 * /add-restaurant/v1/tables/restaurant/{restaurantId}:
 *   get:
 *     tags: [Tables]
 *     summary: Obtener mesas de un restaurante
 *     description: Devuelve todas las mesas de un restaurante ordenadas por número de mesa. Requiere autenticación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: restaurantId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *         example: "69a33af023a771da6aecdd4e"
 *     responses:
 *       200:
 *         description: Mesas obtenidas exitosamente
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
 *                   description: Cantidad total de mesas del restaurante
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Table'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/restaurant/:restaurantId',
    validateJWT,
    getTablesByRestaurant
);

/**
 * @swagger
 * /add-restaurant/v1/tables/{id}:
 *   get:
 *     tags: [Tables]
 *     summary: Obtener una mesa por ID
 *     description: Devuelve la información completa de una mesa específica. Requiere autenticación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Mesa obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Mesa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/:id',
    validateJWT,
    getTableById
);

/**
 * @swagger
 * /add-restaurant/v1/tables/{id}:
 *   patch:
 *     tags: [Tables]
 *     summary: Actualizar una mesa
 *     description: Actualiza los datos de una mesa existente. No se permite cambiar el restaurante al que pertenece la mesa. Requiere autenticación y rol RES_ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableNumber:
 *                 type: string
 *                 maxLength: 20
 *                 description: Nuevo número o nombre de la mesa
 *                 example: "Mesa 7"
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Nueva capacidad de la mesa
 *                 example: 6
 *               location:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nueva ubicación de la mesa
 *                 example: "Interior"
 *     responses:
 *       200:
 *         description: Mesa actualizada exitosamente
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
 *                   example: "Mesa actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para editar esta mesa
 *       404:
 *         description: Mesa no encontrada
 *       409:
 *         description: Ya existe una mesa con ese número en este restaurante
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    updateTable
);

/**
 * @swagger
 * /add-restaurant/v1/tables/{id}/status:
 *   patch:
 *     tags: [Tables]
 *     summary: Habilitar o inhabilitar una mesa
 *     description: Cambia el estado de activación de una mesa (toggle). Requiere autenticación y rol RES_ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Estado de la mesa actualizado exitosamente
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
 *                   example: "Mesa habilitada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para modificar esta mesa
 *       404:
 *         description: Mesa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
    '/:id/status',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    toggleTableStatus
);

/**
 * @swagger
 * /add-restaurant/v1/tables/{id}:
 *   delete:
 *     tags: [Tables]
 *     summary: Eliminar una mesa
 *     description: Elimina permanentemente una mesa del sistema. Requiere autenticación y rol RES_ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mesa a eliminar
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Mesa eliminada exitosamente
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
 *                   example: "Mesa eliminada exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deleted:
 *                       type: boolean
 *                       example: true
 *                     tableId:
 *                       type: string
 *                       example: "664f1a2b3c4d5e6f7a8b9c0d"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para eliminar esta mesa
 *       404:
 *         description: Mesa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    deleteTable
);

export default router;