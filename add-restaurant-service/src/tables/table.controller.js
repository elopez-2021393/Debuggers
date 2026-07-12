import { createTableRecord, getTablesByRestaurantRecord, getTableByIdRecord, updateTableRecord, toggleTableStatusRecord, deleteTableRecord } from './table.services.js';

export const createTable = async (req, res) => {
    try {
        const table = await createTableRecord({
            tableData: req.body,
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
            data: table
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al crear la mesa',
            error: e.message
        });
    }//try-catch
};//createTable

export const getTablesByRestaurant = async (req, res) => {
    try {
        const tables = await getTablesByRestaurantRecord(req.params.restaurantId);

        res.status(200).json({
            success: true,
            total: tables.length,
            data: tables
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al obtener las mesas',
            error: e.message
        });
    }//try-catch
};//getTablesByRestaurant

export const getTableById = async (req, res) => {
    try {
        const table = await getTableByIdRecord(req.params.id);

        res.status(200).json({
            success: true,
            data: table
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al obtener la mesa',
            error: e.message
        });
    }//try-catch
};//getTableById

export const updateTable = async (req, res) => {
    try {
        const table = await updateTableRecord({
            tableId: req.params.id,
            userId: req.user.id,
            data: req.body
        });

        res.status(200).json({
            success: true,
            message: 'Mesa actualizada exitosamente',
            data: table
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al actualizar la mesa',
            error: e.message
        });
    }//try-catch
};//updateTable

export const toggleTableStatus = async (req, res) => {
    try {
        const table = await toggleTableStatusRecord({
            tableId: req.params.id,
            userId: req.user.id
        });

        res.status(200).json({
            success: true,
            message: `Mesa ${table.isActive ? 'habilitada' : 'inhabilitada'} exitosamente`,
            data: table
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al cambiar el estado de la mesa',
            error: e.message
        });
    }//try-catch
};//toggleTableStatus

export const deleteTable = async (req, res) => {
    try {
        const result = await deleteTableRecord({
            tableId: req.params.id,
            userId: req.user.id
        });

        res.status(200).json({
            success: true,
            message: 'Mesa eliminada exitosamente',
            data: result
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al eliminar la mesa',
            error: e.message
        });
    }//try-catch
};//deleteTable
