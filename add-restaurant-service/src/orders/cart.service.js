import redis from '../../configs/redis.js';

const CART_TTL = 60 * 60;
const cartKey = (userId) => `cart:${userId}`;

const calcularSubtotal = (precio, cantidad) =>
    parseFloat((precio * cantidad).toFixed(2));

const calcularTotalesCarrito = (items) => {
    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    const iva = parseFloat((subtotal * 0.12).toFixed(2));
    const total = parseFloat((subtotal + iva).toFixed(2));
    return { subtotal: parseFloat(subtotal.toFixed(2)), iva, total };
};

const getCarrito = async (userId) => {
    const data = await redis.get(cartKey(userId));
    return data ? JSON.parse(data) : null;
};

const saveCarrito = async (userId, carrito) => {
    await redis.set(cartKey(userId), JSON.stringify(carrito), 'EX', CART_TTL);
};

export const obtenerCarrito = async (userId) => {
    const carrito = await getCarrito(userId);
    if (!carrito) return null;

    const totales = calcularTotalesCarrito(carrito.items);
    return {
        ...carrito,
        ...totales
    };
};

//se agrega un menu al carrito - solo puede tener menus del mismo rest
export const agregarAlCarrito = async (userId, restaurantId, item) => {
    //item = { menuItemId, nombre, precio, cantidad, aditamentos }

    let carrito = await getCarrito(userId);

    //si el carrito existe pero es de otro restaurante, lo limpiamos
    if (carrito && carrito.restaurantId !== restaurantId.toString()) {
        carrito = null;
    }

    if (!carrito) {
        carrito = { restaurantId: restaurantId.toString(), items: [] };
    }

    //ver si ya existe el mismo platillo con los mismos aditamentos
    const aditamentosKey = JSON.stringify((item.aditamentos || []).sort());
    const existente = carrito.items.find(
        i => i.menuItemId === item.menuItemId.toString() &&
            JSON.stringify([...i.aditamentos].sort()) === aditamentosKey
    );

    if (existente) {
        existente.cantidad += item.cantidad;
        existente.subtotal = calcularSubtotal(existente.precio, existente.cantidad);

    } else {

        carrito.items.push({
            menuItemId: item.menuItemId.toString(),
            nombre: item.nombre,
            precio: item.precio,
            cantidad: item.cantidad,
            aditamentos: item.aditamentos || [],
            subtotal: calcularSubtotal(item.precio, item.cantidad),
        });
    }

    await saveCarrito(userId, carrito);
    const totales = calcularTotalesCarrito(carrito.items);
    return { ...carrito, ...totales };
};


//cambiaar la cantidad de un platillo en el carro
export const actualizarCantidad = async (userId, menuItemId, nuevaCantidad) => {
    const carrito = await getCarrito(userId);
    if (!carrito) return null;

    const idx = carrito.items.findIndex(i => i.menuItemId == menuItemId.toString());
    if (idx == -1) return null;

    if (nuevaCantidad <= 0) {
        carrito.items.splice(idx, 1);
    } else {
        carrito.items[idx].cantidad = nuevaCantidad;
        carrito.items[idx].subtotal = calcularSubtotal(
            carrito.items[idx].precio,
            nuevaCantidad
        );
    }

    //si el carrito quedó vacío, eliminarlo
    if (carrito.items.length === 0) {
        await redis.del(cartKey(userId));
        return { restaurantId: carrito.restaurantId, items: [], subtotal: 0, iva: 0, total: 0 };
    }

    await saveCarrito(userId, carrito);
    const totales = calcularTotalesCarrito(carrito.items);
    return { ...carrito, ...totales };
};

//eliminar un menu/platillo especifico al carrito por su menuItemId
export const eliminarDelCarrito = async (userId, menuItemId) => {
    const carrito = await getCarrito(userId);
    if (!carrito) return null;

    const antes = carrito.items.length;
    carrito.items = carrito.items.filter(i => i.menuItemId !== menuItemId.toString());

    if (carrito.items.length === antes) return null; // n encontró el platillo

    if (carrito.items.length === 0) {
        await redis.del(cartKey(userId));
        return { restaurantId: carrito.restaurantId, items: [], subtotal: 0, iva: 0, total: 0 };
    }

    await saveCarrito(userId, carrito);
    const totales = calcularTotalesCarrito(carrito.items);
    return { ...carrito, ...totales };
};


export const vaciarCarrito = async (userId) => {
    await redis.del(cartKey(userId));
};


export const obtenerItemsParaOrden = async (userId) => {
    const carrito = await getCarrito(userId);
    if (!carrito || carrito.items.length === 0) return null;
    return carrito;
};