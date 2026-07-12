import { Router } from 'express';
import { getMenu, getMenuItem, agregarAlCarrito, verCarrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito, confirmarPedido, getPedidosByUser, getPedidosByRestaurant, getPedidoById, actualizarStatus, cancelarPedido, editarPedidoPorRestaurante } from './order.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { validateRole } from '../../middlewares/validate-role.js';

const router = Router();

/**
 * @swagger
 * /add-restaurant/v1/orders/menu/{restaurantId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener menú de un restaurante
 *     description: Devuelve todos los platillos disponibles de un restaurante. Endpoint público, no requiere autenticación. Se puede filtrar por categoría
 *     parameters:
 *       - name: restaurantId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *         example: "69a33af023a771da6aecdd4e"
 *       - name: category
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar platillos por categoría
 *         example: "Pizzas"
 *     responses:
 *       200:
 *         description: Menú obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu obtenido con exito"
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/menu/:restaurantId', getMenu);

/**
 * @swagger
 * /add-restaurant/v1/orders/menu/{restaurantId}/{itemId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener detalle de un platillo del menú
 *     description: Devuelve la información completa de un platillo específico incluyendo sus aditamentos disponibles. Endpoint público, no requiere autenticación
 *     parameters:
 *       - name: restaurantId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del restaurante
 *         example: "69a33af023a771da6aecdd4e"
 *       - name: itemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del platillo
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Platillo obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MenuItem'
 *       404:
 *         description: Platillo no encontrado o no disponible
 *       500:
 *         description: Error interno del servidor
 */
router.get('/menu/:restaurantId/:itemId', getMenuItem);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}:
 *   post:
 *     tags: [Orders]
 *     summary: Agregar platillo al carrito
 *     description: Agrega un platillo al carrito del usuario. Si el carrito ya contiene platillos de otro restaurante, se limpia automáticamente. Si el mismo platillo con los mismos aditamentos ya existe, se suma la cantidad
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario. Debe coincidir con el token JWT
 *         example: "664f1a2b3c4d5e6f7a8b9c0a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menuItemId
 *               - cantidad
 *             properties:
 *               menuItemId:
 *                 type: string
 *                 description: ID del platillo a agregar
 *                 example: "69a33af023a771da6aecdd4e"
 *               cantidad:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad de platillos a agregar
 *                 example: 2
 *               aditamentos:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Personalizaciones opcionales del platillo
 *                 example: ["extra queso", "sin cebolla"]
 *     responses:
 *       201:
 *         description: Platillo agregado al carrito exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Menu agregado al carrito"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: menuItemId y cantidad son requeridos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No puedes modificar el carrito de otro usuario
 *       404:
 *         description: Platillo no disponible
 *       500:
 *         description: Error interno del servidor
 */
router.post('/cart/:userId', validateJWT, agregarAlCarrito);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Ver carrito del usuario
 *     description: Devuelve el estado actual del carrito incluyendo items, subtotal, IVA y total. El carrito es temporal y no se persiste en base de datos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario. Debe coincidir con el token JWT
 *         example: "664f1a2b3c4d5e6f7a8b9c0a"
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No puedes ver el carrito de otro usuario
 *       500:
 *         description: Error interno del servidor
 */
router.get('/cart/:userId', validateJWT, verCarrito);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}/{menuItemId}:
 *   patch:
 *     tags: [Orders]
 *     summary: Actualizar cantidad de un platillo en el carrito
 *     description: Cambia la cantidad de un platillo en el carrito. Si se envía cantidad 0, el platillo se elimina automáticamente. Si el carrito queda vacío, se elimina por completo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario. Debe coincidir con el token JWT
 *         example: "664f1a2b3c4d5e6f7a8b9c0a"
 *       - name: menuItemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del platillo a actualizar
 *         example: "69a33af023a771da6aecdd4e"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 minimum: 0
 *                 description: Nueva cantidad. Si es 0, el platillo se elimina del carrito
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada o platillo eliminado del carrito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cantidad actualizada"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       400:
 *         description: Cantidad inválida (debe ser >= 0)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No puedes modificar el carrito de otro usuario
 *       404:
 *         description: Carrito o platillo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/cart/:userId/:menuItemId', validateJWT, actualizarCantidad);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}/{menuItemId}:
 *   delete:
 *     tags: [Orders]
 *     summary: Eliminar platillo del carrito
 *     description: Elimina un platillo específico del carrito. Si el carrito queda vacío tras la eliminación, se elimina por completo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario. Debe coincidir con el token JWT
 *         example: "664f1a2b3c4d5e6f7a8b9c0a"
 *       - name: menuItemId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del platillo a eliminar
 *         example: "69a33af023a771da6aecdd4e"
 *     responses:
 *       200:
 *         description: Platillo eliminado del carrito exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Platillo eliminado del carrito"
 *                 data:
 *                   $ref: '#/components/schemas/Cart'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No puedes modificar el carrito de otro usuario
 *       404:
 *         description: Carrito o platillo no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/cart/:userId/:menuItemId', validateJWT, eliminarDelCarrito);

/**
 * @swagger
 * /add-restaurant/v1/orders/cart/{userId}:
 *   delete:
 *     tags: [Orders]
 *     summary: Vaciar carrito
 *     description: Elimina todos los platillos del carrito del usuario
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario. Debe coincidir con el token JWT
 *         example: "664f1a2b3c4d5e6f7a8b9c0a"
 *     responses:
 *       200:
 *         description: Carrito vaciado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Carrito vaciado exitosamente"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No puedes vaciar el carrito de otro usuario
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/cart/:userId', validateJWT, vaciarCarrito);

/**
 * @swagger
 * /add-restaurant/v1/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Confirmar pedido
 *     description: Convierte el carrito activo del usuario en un pedido formal almacenado en la base de datos. Los precios se revalidan contra la DB al momento de confirmar. Una vez confirmado, el carrito se vacía automáticamente. El userId se toma del token JWT
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - direccion
 *               - telefono
 *               - tipoPago
 *             properties:
 *               direccion:
 *                 type: object
 *                 required:
 *                   - descripcion
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     enum: [Casa, Trabajo, Otro]
 *                     description: Tipo de dirección de entrega
 *                     example: "Casa"
 *                   descripcion:
 *                     type: string
 *                     description: Descripción de la dirección de entrega
 *                     example: "Zona 1, frente al parque"
 *                   referencias:
 *                     type: string
 *                     description: Referencias adicionales de la dirección
 *                     example: "Casa color azul"
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono de contacto para la entrega
 *                 example: "42459699"
 *               tipoPago:
 *                 type: string
 *                 enum: [Tarjeta, Efectivo]
 *                 description: Método de pago del pedido
 *                 example: "Efectivo"
 *               notas:
 *                 type: string
 *                 description: Instrucciones adicionales para el restaurante (opcional)
 *                 example: "Sin picante por favor"
 *     responses:
 *       201:
 *         description: Pedido confirmado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pedido confirmado exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: "664f1a2b3c4d5e6f7a8b9c0d"
 *                     status:
 *                       type: string
 *                       example: "Pendiente"
 *                     estimadoEntrega:
 *                       type: string
 *                       example: "30-45 minutos"
 *                     subtotal:
 *                       type: number
 *                       example: 80
 *                     iva:
 *                       type: number
 *                       example: 9.6
 *                     total:
 *                       type: number
 *                       example: 89.6
 *                     tipoPago:
 *                       type: string
 *                       example: "Efectivo"
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order/properties/items/items'
 *       400:
 *         description: Faltan campos requeridos o el carrito está vacío
 *       401:
 *         description: No autorizado
 *       409:
 *         description: Un platillo del carrito ya no está disponible
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', validateJWT, confirmarPedido);

/**
 * @swagger
 * /add-restaurant/v1/orders/user/{userId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener historial de pedidos del usuario
 *     description: Devuelve todos los pedidos realizados por el usuario ordenados del más reciente al más antiguo. El usuario solo puede ver sus propios pedidos. Se puede filtrar por estado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario. Debe coincidir con el token JWT
 *         example: "664f1a2b3c4d5e6f7a8b9c0a"
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Pendiente, En_preparación, Aceptado, Listo, Entregado, Cancelado]
 *         description: Filtrar pedidos por estado
 *         example: "Pendiente"
 *     responses:
 *       200:
 *         description: Pedidos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 3
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No puedes ver los pedidos de otro usuario
 *       500:
 *         description: Error interno del servidor
 */
router.get('/user/:userId', validateJWT, getPedidosByUser);

/**
 * @swagger
 * /add-restaurant/v1/orders/restaurant/{restaurantId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener cola de pedidos del restaurante
 *     description: Devuelve los pedidos activos del restaurante ordenados del más antiguo al más reciente (cola FIFO). Por defecto excluye pedidos Entregados y Cancelados. Requiere ser el administrador del restaurante (RES_ADMIN_ROLE)
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
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Pendiente, En_preparación, Aceptado, Listo, Entregado, Cancelado]
 *         description: Filtrar pedidos por estado específico
 *         example: "Pendiente"
 *       - name: todos
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Si se envía como true, devuelve todos los pedidos incluyendo Entregados y Cancelados
 *         example: true
 *     responses:
 *       200:
 *         description: Pedidos del restaurante obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 4
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para ver los pedidos de este restaurante
 *       404:
 *         description: Restaurante no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get(
    '/restaurant/:restaurantId',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    getPedidosByRestaurant
);

/**
 * @swagger
 * /add-restaurant/v1/orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener detalle de un pedido
 *     description: Devuelve la información completa de un pedido. El cliente solo puede ver sus propios pedidos. El RES_ADMIN puede ver pedidos de su restaurante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Pedido obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para ver este pedido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:orderId', validateJWT, getPedidoById);

/**
 * @swagger
 * /add-restaurant/v1/orders/{orderId}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Actualizar estado del pedido
 *     description: >
 *       Cambia el estado de un pedido siguiendo el flujo de transiciones válidas.
 *       Solo accesible por el administrador del restaurante al que pertenece el pedido.
 *       Transiciones permitidas: Pendiente → Aceptado | Cancelado,
 *       Aceptado → En_preparación | Cancelado,
 *       En_preparación → Listo,
 *       Listo → Entregado
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Aceptado, En_preparación, Listo, Entregado, Cancelado]
 *                 description: Nuevo estado del pedido
 *                 example: "Aceptado"
 *     responses:
 *       200:
 *         description: Estado del pedido actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pedido actualizado a Aceptado"
 *                 data:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: string
 *                       example: "664f1a2b3c4d5e6f7a8b9c0d"
 *                     status:
 *                       type: string
 *                       example: "Aceptado"
 *                     historial:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                             example: "Aceptado"
 *                           cambiadoEn:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-04-11T10:05:00.000Z"
 *       400:
 *         description: Transición de estado inválida
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para actualizar este pedido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
    '/:orderId/status',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    actualizarStatus
);

/**
 * @swagger
 * /add-restaurant/v1/orders/{orderId}/edit:
 *   patch:
 *     tags: [Orders]
 *     summary: Editar pedido por el restaurante
 *     description: Permite al administrador del restaurante ajustar los items o notas de un pedido. Solo es posible cuando el pedido está en estado Pendiente o Aceptado. Los items se revalidan contra la base de datos al momento de editar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido a editar
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 description: Lista actualizada de platillos del pedido (opcional)
 *                 items:
 *                   type: object
 *                   required:
 *                     - menuItemId
 *                     - cantidad
 *                   properties:
 *                     menuItemId:
 *                       type: string
 *                       example: "69a33af023a771da6aecdd4e"
 *                     cantidad:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *                     aditamentos:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["sin cebolla"]
 *               notas:
 *                 type: string
 *                 description: Notas o instrucciones actualizadas (opcional)
 *                 example: "El cliente solicitó que venga bien caliente"
 *     responses:
 *       200:
 *         description: Pedido actualizado por el restaurante exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pedido actualizado por el restaurante"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: El pedido no está en un estado editable (debe ser Pendiente o Aceptado)
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para editar este pedido
 *       404:
 *         description: Pedido no encontrado
 *       409:
 *         description: Algún platillo del pedido ya no está disponible
 *       500:
 *         description: Error interno del servidor
 */
router.patch(
    '/:orderId/edit',
    validateJWT,
    validateRole('RES_ADMIN_ROLE'),
    editarPedidoPorRestaurante
);

/**
 * @swagger
 * /add-restaurant/v1/orders/{orderId}:
 *   delete:
 *     tags: [Orders]
 *     summary: Cancelar pedido
 *     description: >
 *       Cancela un pedido según las siguientes reglas de negocio:
 *       Cliente — solo puede cancelar si el pedido está en estado Pendiente y dentro de los primeros 5 minutos desde su creación.
 *       RES_ADMIN — puede cancelar si el pedido está en estado Pendiente o Aceptado, siempre que el pedido pertenezca a su restaurante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del pedido a cancelar
 *         example: "664f1a2b3c4d5e6f7a8b9c0d"
 *     responses:
 *       200:
 *         description: Pedido cancelado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pedido cancelado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: El pedido no se puede cancelar. Puede ser porque el estado no lo permite o porque expiró la ventana de cancelación de 5 minutos
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No tienes permisos para cancelar este pedido
 *       404:
 *         description: Pedido no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:orderId', validateJWT, cancelarPedido);

export default router;