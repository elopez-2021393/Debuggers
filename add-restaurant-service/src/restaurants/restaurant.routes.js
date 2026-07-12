import { Router } from 'express';
import { createRestaurant, deleteRestaurant, getRestaurantById, updateRestaurant, uploadRestaurantPhoto, deleteRestaurantPhoto, getAllRestaurants } from './restaurant.controller.js';
import { validateCreateRestaurant } from '../../middlewares/restaurant-validator.js'
import { validateRole } from '../../middlewares/validate-role.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { uploadRestaurantPhoto as multerRestaurant, handleUploadError } from '../../middlewares/file-uploader.js'

const router = Router();

/**
 * @swagger
 * /add-restaurant/v1/restaurants:
 *   post:
 *     tags: [Restaurants]
 *     summary: Crear restaurante
 *     description: Registra un nuevo restaurante. La foto es opcional al momento de creación. Requiere autenticación y rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *               - address
 *               - phone
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nombre del restaurante
 *                 example: "La Trattoria"
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del restaurante (opcional)
 *               capacity:
 *                 type: integer
 *                 minimum: 20
 *                 description: Capacidad máxima de personas
 *                 example: 50
 *               address:
 *                 type: string
 *                 description: Dirección del restaurante
 *                 example: "6a Avenida 3-45, Zona 1, Ciudad de Guatemala"
 *               businessHours[open]:
 *                 type: string
 *                 description: Hora de apertura
 *                 example: "08:00"
 *               businessHours[close]:
 *                 type: string
 *                 description: Hora de cierre
 *                 example: "22:00"
 *               phone:
 *                 type: string
 *                 description: Teléfono de 8 dígitos
 *                 example: "22345678"
 *               category:
 *                 type: string
 *                 enum: [COMIDA_RAPIDA, ITALIANA, CHINA, MEXICANA, CAFETERIA]
 *                 description: Categoría gastronómica del restaurante
 *                 example: "ITALIANA"
 *               contactInfo[managerName]:
 *                 type: string
 *                 description: Nombre del gerente o encargado
 *                 example: "Carlos Méndez"
 *               contactInfo[email]:
 *                 type: string
 *                 format: email
 *                 description: Correo de contacto del restaurante
 *                 example: "contacto@latrattoria.com"
 *     responses:
 *       201:
 *         description: Restaurante registrado exitosamente
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
 *                   example: "Restaurante registrado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Errores de validación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       409:
 *         description: Ya existe un restaurante con ese nombre
 *       500:
 *         description: Error interno del servidor
 */
router.post(
    '/',
    multerRestaurant.single('photo'),
    handleUploadError,
    validateJWT,
    validateRole('ADMIN_ROLE'),
    validateCreateRestaurant,
    createRestaurant
);

/**
 * @swagger
 * /add-restaurant/v1/restaurants:
 *   get:
 *     tags: [Restaurants]
 *     summary: Obtener todos los restaurantes
 *     description: Devuelve la lista completa de restaurantes ordenados por fecha de creación. Requiere autenticación y rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurantes obtenidos exitosamente
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
 *                   description: Cantidad total de restaurantes
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/',
    validateJWT,
    validateRole('ADMIN_ROLE', 'RES_ADMIN_ROLE', 'USER_ROLE'),
    getAllRestaurants
);

/**
 * @swagger
 * /add-restaurant/v1/restaurants/{id}/photo:
 *   post:
 *     tags: [Restaurants]
 *     summary: Subir o reemplazar foto de un restaurante
 *     description: Sube una nueva foto al restaurante. Si ya tiene una foto, la reemplaza eliminando la anterior de Cloudinary. Requiere autenticación y rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del restaurante
 *     responses:
 *       200:
 *         description: Foto del restaurante actualizada exitosamente
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
 *                   example: "Foto del restaurante actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: No se proporcionó ninguna imagen
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error al subir la foto del restaurante
 */
router.post(
    '/:id/photo',
    multerRestaurant.single('photo'),
    handleUploadError,
    validateJWT,
    validateRole('ADMIN_ROLE'),
    uploadRestaurantPhoto
);

/**
 * @swagger
 * /add-restaurant/v1/restaurants/{id}:
 *   get:
 *     tags: [Restaurants]
 *     summary: Obtener restaurante por ID
 *     description: Devuelve la información de un restaurante específico. Endpoint público, no requiere autenticación
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Restaurante obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', getRestaurantById);

/**
 * @swagger
 * /add-restaurant/v1/restaurants/{id}:
 *   patch:
 *     tags: [Restaurants]
 *     summary: Actualizar restaurante
 *     description: Actualiza los datos de un restaurante existente. Requiere autenticación y rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nuevo nombre del restaurante
 *                 example: "La Trattoria Renovada"
 *               capacity:
 *                 type: integer
 *                 minimum: 20
 *                 description: Nueva capacidad del restaurante
 *                 example: 80
 *               address:
 *                 type: string
 *                 description: Nueva dirección
 *                 example: "7a Avenida 10-20, Zona 10, Ciudad de Guatemala"
 *               businessHours:
 *                 type: object
 *                 properties:
 *                   open:
 *                     type: string
 *                     example: "09:00"
 *                   close:
 *                     type: string
 *                     example: "23:00"
 *               phone:
 *                 type: string
 *                 description: Nuevo teléfono de 8 dígitos
 *                 example: "23456789"
 *               category:
 *                 type: string
 *                 enum: [COMIDA_RAPIDA, ITALIANA, CHINA, MEXICANA, CAFETERIA]
 *                 description: Nueva categoría gastronómica
 *                 example: "MEXICANA"
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   managerName:
 *                     type: string
 *                     example: "Ana García"
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: "ana@latrattoria.com"
 *     responses:
 *       200:
 *         description: Restaurante actualizado correctamente
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
 *                   example: "Restaurante actualizado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       404:
 *         description: Restaurante no encontrado
 *       409:
 *         description: Ya existe un restaurante con ese nombre
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
    '/:id',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    updateRestaurant
);

/**
 * @swagger
 * /add-restaurant/v1/restaurants/{id}:
 *   delete:
 *     tags: [Restaurants]
 *     summary: Eliminar restaurante
 *     description: Elimina permanentemente un restaurante del sistema. Requiere autenticación y rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante a eliminar
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Restaurante eliminado exitosamente
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
 *                   example: "Restaurante eliminado exitosamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete(
    '/:id',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    deleteRestaurant
);

/**
 * @swagger
 * /add-restaurant/v1/restaurants/{id}/photo:
 *   delete:
 *     tags: [Restaurants]
 *     summary: Eliminar foto de un restaurante
 *     description: Elimina la foto del restaurante de Cloudinary y establece el campo photo como null. Requiere autenticación y rol ADMIN_ROLE
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Foto del restaurante eliminada exitosamente
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
 *                   example: "Foto del restaurante eliminada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Se requiere rol ADMIN_ROLE
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error al eliminar la foto del restaurante
 */
router.delete(
    '/:id/photo',
    validateJWT,
    validateRole('ADMIN_ROLE'),
    deleteRestaurantPhoto
);

export default router;