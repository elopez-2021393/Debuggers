import { axiosRestaurant } from './api.js';

export const getRestaurantMenu = async (restaurantId, category) => {
    const params = category ? { category } : {};
    return await axiosRestaurant.get(`/orders/menu/${restaurantId}`, { params })
};

export const getMenuItem = async (restaurantId, itemId) => {
    return await axiosRestaurant.get(`/orders/menu/${restaurantId}/${itemId}`);
};

//Peticiones del carrito
export const addToCart = async (userId, body) => {
    return await axiosRestaurant.post(`/orders/cart/${userId}`, body);
};

export const getCart = async (userId) => {
    return await axiosRestaurant.get(`/orders/cart/${userId}`);
}

export const updateCartItem = async (userId, menuItemId, cantidad) => {
    return await axiosRestaurant.patch(`/orders/cart/${userId}/${menuItemId}`, { cantidad });
}

export const removeCartItem = async (userId, menuItemId) => {
    return await axiosRestaurant.delete(`/orders/cart/${userId}/${menuItemId}`);
}

export const clearCart = async (userId) => {
    return await axiosRestaurant.delete(`/orders/cart/${userId}`);
}

//Servicio de Pedidos
export const confirmOrder = async (body) => {
    return await axiosRestaurant.post(`/orders`, body);
};

export const getUserOrders = async (userId, status) => {
    const params = status ? { status } : {};
    return await axiosRestaurant.get(`/orders/user/${userId}`, { params });
};

export const getOrdersById = async (orderId) => {
    return await axiosRestaurant.get(`/orders/${orderId}`);
};

export const cancelOrder = async (orderId) => {
    return await axiosRestaurant.delete(`/orders/${orderId}`);
};

export const getRestaurantOrders = async (restaurantId, params = {}) => {
    return await axiosRestaurant.get(`/orders/restaurant/${restaurantId}`, { params });
};

export const updateOrderStatus = async (orderId, status) => {
    return await axiosRestaurant.patch(`/orders/${orderId}/status`, { status });
};

export const editOrderByRestaurant = async (orderId, body) => {
    return await axiosRestaurant.patch(`/orders/${orderId}/edit`, body);
};