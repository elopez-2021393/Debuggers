import Reservation from './reservation.model.js';
import Table from '../tables/table.model.js';
import { createReservationRecord, getReservationRecord, updateReservationRecord, deleteReservationRecord, tokenAction } from "./reservation.service.js";
import { getRestaurantByName } from "../restaurants/restaurant.services.js";

export const createReservation = async (req, res) => {
    try {
        const result = await createReservationRecord({
            reservationData: req.body,
            userId: req.user.id
        });

        res.status(201).json({
            success: true,
            message: result.message,
            data: result.reservation,
            confirmationToken: result.confirmationToken,
            tokenExpiresAt: result.tokenExpiresAt
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al crear la reservación'
        })
    }//try-catch
}//CrearReservacion

export const confirmOrCancelReservation = async (req, res) => {
    try {
        const { token, action } = req.body;

        const reservation = await tokenAction({ token, action });

        const actionLabel = action === 'CONFIRMAR' ? 'confirmada' : 'cancelada';

        res.status(200).json({
            success: true,
            message: `Reservación ${actionLabel} exitosamente`,
            data: reservation
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al procesar la acción'
        });
    }
};

export const getReservation = async (req, res) => {
    try {
        const filters = {};
        const reservations = await getReservationRecord(req.user.id, filters);
        res.status(200).json({
            success: true,
            total: reservations.length,
            data: reservations
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al obtener las reservaciones'
        });
    }//try-catch
}//getReservation


export const updateReservation = async (req, res) => {
    try {
        const reservation = await updateReservationRecord({
            reservationId: req.params.id,
            userId: req.user.id,
            data: req.body
        });

        res.status(200).json({
            success: true,
            message: 'Reservación actualizada exitosamente',
            data: reservation
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al actualizar la reservación'
        });
    }//try-catch
}//update

export const deleteReservation = async (req, res) => {
    try {
        const result = await deleteReservationRecord({
            reservationId: req.params.id,
            userId: req.user.id
        });

        res.status(200).json({
            success: true,
            message: 'Reservación eliminada exitosamente',
            data: result
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: e.message || 'Error al eliminar la reservación'
        });
    }
};

//Disponibilidad por mesas en lugar de capacidad total
export const checkDisponibilidad = async (req, res) => {
    const { restaurantName } = req.params;
    const { date, hour } = req.query;

    try {
        const restaurant = await getRestaurantByName(restaurantName);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurante no encontrado' });
        }

        const reservationDate = new Date(date);
        reservationDate.setHours(0, 0, 0, 0);

        //obtener todas las mesas activas del restaurante
        const allTables = await Table.find({ restaurantId: restaurant._id, isActive: true });

        //obtener reservaciones activas para ese slot
        const reservedTableIds = await Reservation.find({
            restaurantName,
            reservationDate,
            reservationHour: hour,
            status: { $in: ['PENDIENTE', 'CONFIRMADA'] }
        }).distinct('tableId');

        const reservedSet = new Set(reservedTableIds.map(id => id.toString()));

        const availableTables = allTables.filter(t => !reservedSet.has(t._id.toString()));
        const occupiedTables = allTables.filter(t => reservedSet.has(t._id.toString()));

        res.json({
            success: true,
            data: {
                restaurante: restaurantName,
                fecha: date,
                hora: hour,
                totalMesas: allTables.length,
                mesasDisponibles: availableTables.length,
                mesasOcupadas: occupiedTables.length,
                disponible: availableTables.length > 0,
                mesas: availableTables.map(t => ({
                    id: t._id,
                    tableNumber: t.tableNumber,
                    capacity: t.capacity,
                    location: t.location
                })),
                mensaje: availableTables.length === 0
                    ? 'No hay mesas disponibles para esa fecha y hora'
                    : availableTables.length <= 2
                        ? `¡Solo quedan ${availableTables.length} mesa(s) disponible(s)!`
                        : `Hay ${availableTables.length} mesas disponibles`
            }
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
//Disponibilidad por mesas en lugar de capacidad total

export const getReservationsByRestaurant = async (req, res) => {
    const { restaurantName } = req.params;
    const { status, date } = req.query;

    try {
        const query = { restaurantName };
        if (status) query.status = status;
        if (date) {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            query.reservationDate = d;
        }

        const reservations = await Reservation.find(query)
            .select('+confirmationToken')
            .populate('tableId', 'tableNumber capacity location')
            .sort({ reservationDate: 1, reservationHour: 1 });

        res.json({
            success: true,
            total: reservations.length,
            data: reservations
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};
