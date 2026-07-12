import Table from './table.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createTableRecord = async ({ tableData, userId }) => {
    const restaurant = await Restaurant.findById(tableData.restaurantId);
    if (!restaurant) {
        const e = new Error('Restaurante no encontrado');
        e.statusCode = 404;
        throw e;
    }

    if (!restaurant.assignedAdmin || restaurant.assignedAdmin.toString() !== userId) {
        const e = new Error('No tienes permisos para agregar mesas a este restaurante');
        e.statusCode = 403;
        throw e;
    }

    const table = new Table({ ...tableData });
    await table.save();
    return table;
};

export const getTablesByRestaurantRecord = async (restaurantId) => {
    return Table.find({ restaurantId }).sort({ tableNumber: 1 });
};

export const getTableByIdRecord = async (tableId) => {
    const table = await Table.findById(tableId);
    if (!table) {
        const e = new Error('Mesa no encontrada');
        e.statusCode = 404;
        throw e;
    }
    return table;
};

export const updateTableRecord = async ({ tableId, userId, data }) => {
    const table = await Table.findById(tableId).populate('restaurantId');
    if (!table) {
        const e = new Error('Mesa no encontrada');
        e.statusCode = 404;
        throw e;
    }

    if (!table.restaurantId.assignedAdmin || table.restaurantId.assignedAdmin.toString() !== userId) {
        const e = new Error('No tienes permisos para editar esta mesa');
        e.statusCode = 403;
        throw e;
    }

    const { restaurantId: _rid, ...safeData } = data;
    Object.assign(table, safeData);
    await table.save();
    return table;
};

export const toggleTableStatusRecord = async ({ tableId, userId }) => {
    const table = await Table.findById(tableId).populate('restaurantId');
    if (!table) {
        const e = new Error('Mesa no encontrada');
        e.statusCode = 404;
        throw e;
    }

    if (!table.restaurantId.assignedAdmin || table.restaurantId.assignedAdmin.toString() !== userId) {
        const e = new Error('No tienes permisos para modificar esta mesa');
        e.statusCode = 403;
        throw e;
    }

    table.isActive = !table.isActive;
    await table.save();
    return table;
};

export const deleteTableRecord = async ({ tableId, userId }) => {
    const table = await Table.findById(tableId).populate('restaurantId');
    if (!table) {
        const e = new Error('Mesa no encontrada');
        e.statusCode = 404;
        throw e;
    }

    if (!table.restaurantId.assignedAdmin || table.restaurantId.assignedAdmin.toString() !== userId) {
        const e = new Error('No tienes permisos para eliminar esta mesa');
        e.statusCode = 403;
        throw e;
    }

    await Table.deleteOne({ _id: tableId });
    return { deleted: true, tableId };
};