import { Router } from 'express';
import { createReview, getReviewsByRestaurant, updateReview, deleteReview, replyToReview, getMyReviews } from './review.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

router.use(validateJWT);

/**
 * @swagger
 * /add-restaurant/v1/reviews/me:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener mis reseñas
 *     description: Devuelve todas las reseñas publicadas por el usuario autenticado. El userId se toma automáticamente del token JWT.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reseñas obtenidas exitosamente
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
 *                     $ref: '#/components/schemas/Review'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       500:
 *         description: Error al obtener las reseñas
 */
// ver mis propias reseñas — usuario autenticado
router.get('/me', getMyReviews);

/**
 * @swagger
 * /add-restaurant/v1/reviews/restaurant/{restaurantId}:
 *   get:
 *     tags: [Reviews]
 *     summary: Obtener reseñas de un restaurante
 *     description: Devuelve todas las reseñas de un restaurante específico. Requiere autenticación.
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
 *         description: Reseñas obtenidas exitosamente
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
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Review'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       500:
 *         description: Error al obtener los comentarios
 */
// ver comentarios de un restaurante — cualquier usuario
router.get('/restaurant/:restaurantId', getReviewsByRestaurant);

/**
 * @swagger
 * /add-restaurant/v1/reviews/restaurant/{restaurantId}:
 *   post:
 *     tags: [Reviews]
 *     summary: Publicar una reseña
 *     description: Permite a cualquier usuario autenticado publicar una reseña en un restaurante. El userId y userName se toman automáticamente del token JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: restaurantId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante a reseñar
 *         example: "69a33af023a771da6aecdd4e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - comment
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Calificación del restaurante del 1 al 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 description: Texto de la reseña
 *                 example: "Excelente servicio y comida, muy recomendado"
 *     responses:
 *       201:
 *         description: Comentario publicado exitosamente
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
 *                   example: "Comentario publicado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       500:
 *         description: Error al publicar el comentario
 */
// publicar comentario — cualquier usuario autenticado
router.post('/restaurant/:restaurantId', createReview);

/**
 * @swagger
 * /add-restaurant/v1/reviews/{id}:
 *   patch:
 *     tags: [Reviews]
 *     summary: Editar una reseña propia
 *     description: Modifica el rating y/o comment de una reseña existente. Solo el autor original puede editarla, verificado por userId del token JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña a editar
 *         example: "69a33af023a771da6aecdd4e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Nueva calificación
 *                 example: 4
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 description: Nuevo texto de la reseña
 *                 example: "Actualizo mi reseña: el servicio mejoró bastante"
 *     responses:
 *       200:
 *         description: Comentario actualizado exitosamente
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
 *                   example: "Comentario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: El usuario no es el autor de la reseña
 *       500:
 *         description: Error al actualizar el comentario
 */
// editar propio comentario
router.patch('/:id', updateReview);

/**
 * @swagger
 * /add-restaurant/v1/reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Eliminar una reseña
 *     description: Elimina una reseña existente. Permitido al propio autor o a un administrador global (ADMIN_ROLE). El rol se verifica desde el token JWT.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña a eliminar
 *         example: "69a33af023a771da6aecdd4e"
 *     responses:
 *       200:
 *         description: Comentario eliminado exitosamente
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
 *                   example: "Comentario eliminado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: Sin permisos para eliminar esta reseña
 *       500:
 *         description: Error al eliminar el comentario
 */
// eliminar: propio usuario o ADMIN
router.delete('/:id', deleteReview);

/**
 * @swagger
 * /add-restaurant/v1/reviews/{id}/reply:
 *   post:
 *     tags: [Reviews]
 *     summary: Responder a una reseña
 *     description: Permite al administrador del restaurante (RES_ADMIN_ROLE) publicar una respuesta oficial a una reseña. Registra también quién respondió y cuándo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la reseña a la que se responde
 *         example: "69a33af023a771da6aecdd4e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reply
 *             properties:
 *               reply:
 *                 type: string
 *                 maxLength: 500
 *                 description: Texto de la respuesta oficial del restaurante
 *                 example: "Gracias por su visita, esperamos verle pronto"
 *     responses:
 *       200:
 *         description: Respuesta publicada exitosamente
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
 *                   example: "Respuesta publicada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Review'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: Sin permisos de RES_ADMIN_ROLE
 *       500:
 *         description: Error al publicar la respuesta
 */
// Respuesta del RES_ADMIN a un comentario
router.post('/:id/reply', validateRole('RES_ADMIN_ROLE'), replyToReview);

export default router;