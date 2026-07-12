import {
    createGastronomicEventService,
    getGastronomicEventsService,
    getGastronomicEventByIdService,
    updateGastronomicEventService,
    deleteGastronomicEventService,
    joinEventService,
    leaveEventService,
    applyEventService,
    getEventsByRestaurantService
} from './event.services.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createGastronomicEvent = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ assignedAdmin: req.user.id });
        if (!restaurant) {
            return res.status(400).json({
                success: false,
                message: 'No tienes un restaurante asignado'
            });
        }

        const event = await createGastronomicEventService({
            ...req.body,
            restaurant_id: restaurant._id,
            created_by: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'Evento gastronómico creado',
            data: event
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Error al crear el evento gastronómico',
            error: e.message
        });
    }
};

export const getGastronomicEvents = async (req, res) => {
    try {
        const events = await getGastronomicEventsService();
        res.status(200).json({
            success: true,
            data: events
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los eventos gastronómicos',
            error: e.message
        });
    }
};

export const getGastronomicEventById = async (req, res) => {
    try {
        const event = await getGastronomicEventByIdService(req.params.id);
        res.status(200).json({
            success: true,
            data: event
        });
    } catch (e) {
        res.status(404).json({
            success: false,
            message: e.message
        });
    }
};

export const updateGastronomicEvent = async (req, res) => {
    try {
        const event = await updateGastronomicEventService(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Evento gastronómico actualizado',
            data: event
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

export const deleteGastronomicEvent = async (req, res) => {
    try {
        await deleteGastronomicEventService(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Evento gastronómico eliminado'
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

export const joinEvent = async (req, res) => {
    try {
        const result = await joinEventService(req.params.id, req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

export const leaveEvent = async (req, res) => {
    try {
        const result = await leaveEventService(req.params.id, req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

export const applyEvent = async (req, res) => {
    try {
        const result = await applyEventService(req.params.id, req.user.id);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};

export const getEventsByRestaurant = async (req, res) => {
    try {
        const events = await getEventsByRestaurantService(req.params.restaurantId);
        res.json({
            success: true,
            total: events.length,
            data: events
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};