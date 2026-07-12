import { Router } from 'express';
import { createMenu, getMenus, getMenuById, updateMenu, deleteMenu, getMenusByRestaurant, uploadMenuPhoto, deleteMenuPhoto } from './menu.controller.js';

import { validateJWT } from '../../middlewares/validate-jwt.js'
import { validateRole } from '../../middlewares/validate-role.js';
import { uploadMenuPhoto as uploadMenuPhotoMiddleware, handleUploadError } from '../../middlewares/file-uploader.js';


const router = Router();

/**
 * @swagger
 * /add-restaurant/v1/menus:
 *   get:
 *     tags: [Menu]
 *     summary: Listar todos los platos
 *     description: Devuelve todos los platos registrados en el sistema. Solo accesible por administradores globales (ADMIN_ROLE).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de platos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: Sin permisos de ADMIN_ROLE
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', validateJWT, validateRole('ADMIN_ROLE', 'RES_ADMIN_ROLE', 'USER_ROLE'), getMenus);

/**
 * @swagger
 * /add-restaurant/v1/menus/restaurant/{restaurantId}:
 *   get:
 *     tags: [Menu]
 *     summary: Obtener menú de un restaurante
 *     description: Devuelve todos los platos de un restaurante específico. No requiere autenticación.
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
 *         description: Lista de platos obtenida exitosamente
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
 *                     $ref: '#/components/schemas/MenuItem'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/restaurant/:restaurantId', getMenusByRestaurant)

/**
 * @swagger
 * /add-restaurant/v1/menus/{id}:
 *   get:
 *     tags: [Menu]
 *     summary: Obtener plato por ID
 *     description: Devuelve el detalle completo de un plato específico. No requiere autenticación.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plato
 *         example: "69a33af023a771da6aecdd4e"
 *     responses:
 *       200:
 *         description: Plato obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Plato no encontrado
 */
router.get('/:id', getMenuById);

/**
 * @swagger
 * /add-restaurant/v1/menus:
 *   post:
 *     tags: [Menu]
 *     summary: Crear un nuevo plato
 *     description: Registra un nuevo plato en el menú del restaurante. La foto es opcional, si no se envía el plato se crea sin imagen.
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
 *               - price
 *               - category
 *               - restaurantId
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nombre del plato
 *                 example: "Pizza Debug"
 *               description:
 *                 type: string
 *                 maxLength: 255
 *                 description: Descripción del plato (opcional)
 *                 example: "Buenas pizzas y baratas"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 description: Precio del plato, no puede ser negativo
 *                 example: 40
 *               category:
 *                 type: string
 *                 enum: [DESAYUNO, ALMUERZO, CENA, BEBIDA, POSTRE]
 *                 description: Categoría del plato
 *                 example: "ALMUERZO"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de ingredientes (opcional)
 *                 example: ["queso", "tomate", "jamón"]
 *               availability[days]:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO]
 *                 description: Días en que el plato está disponible (opcional)
 *                 example: ["LUNES", "MIERCOLES", "VIERNES"]
 *               restaurantId:
 *                 type: string
 *                 description: ID del restaurante al que pertenece el plato
 *                 example: "69a33af023a771da6aecdd4e"
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del plato (opcional)
 *     responses:
 *       201:
 *         description: Plato creado exitosamente
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
 *                   example: "Menu creado"
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: Sin permisos de RES_ADMIN_ROLE
 *       500:
 *         description: Error interno del servidor
 */
// La foto es opcional al crear: si viene se sube, si no viene se crea sin foto
router.post(
    '/',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    uploadMenuPhotoMiddleware.single('photo'),
    handleUploadError,
    createMenu
);

/**
 * @swagger
 * /add-restaurant/v1/menus/{id}:
 *   put:
 *     tags: [Menu]
 *     summary: Actualizar datos de un plato
 *     description: Modifica los campos de un plato existente. No gestiona fotos, para eso usar POST /menus/{id}/photo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plato a actualizar
 *         example: "69a33af023a771da6aecdd4e"
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
 *                 example: "Pizza Debug Especial"
 *               description:
 *                 type: string
 *                 maxLength: 255
 *                 example: "Descripción actualizada"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 45
 *               category:
 *                 type: string
 *                 enum: [DESAYUNO, ALMUERZO, CENA, BEBIDA, POSTRE]
 *                 example: "CENA"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["queso extra", "tomate", "champiñones"]
 *               availability:
 *                 type: object
 *                 properties:
 *                   days:
 *                     type: array
 *                     items:
 *                       type: string
 *                       enum: [LUNES, MARTES, MIERCOLES, JUEVES, VIERNES, SABADO, DOMINGO]
 *                     example: ["LUNES", "VIERNES"]
 *               available:
 *                 type: boolean
 *                 description: Si el plato está disponible para ordenar
 *                 example: true
 *     responses:
 *       200:
 *         description: Plato actualizado exitosamente
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
 *                   example: "Menu actualizado"
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: Sin permisos de RES_ADMIN_ROLE
 */
router.put(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    uploadMenuPhotoMiddleware.single('photo'),
    handleUploadError,
    updateMenu
);

/**
 * @swagger
 * /add-restaurant/v1/menus/{id}:
 *   delete:
 *     tags: [Menu]
 *     summary: Eliminar un plato
 *     description: Elimina permanentemente un plato del menú del restaurante.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plato a eliminar
 *         example: "69a33af023a771da6aecdd4e"
 *     responses:
 *       200:
 *         description: Plato eliminado exitosamente
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
 *                   example: "Menu eliminado"
 *       400:
 *         description: Plato no encontrado
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: Sin permisos de RES_ADMIN_ROLE
 */
router.delete(
    '/:id',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    deleteMenu
);

/**
 * @swagger
 * /add-restaurant/v1/menus/{id}/photo:
 *   post:
 *     tags: [Menu]
 *     summary: Subir o reemplazar foto de un plato
 *     description: Sube una imagen para un plato ya existente. Si el plato ya tenía foto, será reemplazada automáticamente.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plato al que se le asignará la foto
 *         example: "69a33af023a771da6aecdd4e"
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
 *                 description: Archivo de imagen del plato
 *     responses:
 *       200:
 *         description: Foto actualizada exitosamente
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
 *                   example: "Foto del plato actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: No se proporcionó ninguna imagen
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: Sin permisos de RES_ADMIN_ROLE
 *       500:
 *         description: Error al subir la foto del plato
 */
// Subir o reemplazar foto de un plato ya existente
router.post(
    '/:id/photo',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    uploadMenuPhotoMiddleware.single('photo'),
    handleUploadError,
    uploadMenuPhoto
);

/**
 * @swagger
 * /add-restaurant/v1/menus/{id}/photo:
 *   delete:
 *     tags: [Menu]
 *     summary: Eliminar foto de un plato
 *     description: Elimina la imagen asociada al plato. El campo photo queda en null.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del plato cuya foto se eliminará
 *         example: "69a33af023a771da6aecdd4e"
 *     responses:
 *       200:
 *         description: Foto eliminada exitosamente
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
 *                   example: "Foto del plato eliminada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       401:
 *         description: Token JWT inválido o no proporcionado
 *       403:
 *         description: Sin permisos de RES_ADMIN_ROLE
 *       500:
 *         description: Error al eliminar la foto del plato
 */
// Eliminar foto del plato
router.delete(
    '/:id/photo',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    deleteMenuPhoto
);

export default router;