import {
    createRestaurantRecord,
    getAllRestaurantsRecord,
    deleteRestaurantRecord,
    uploadRestaurantPhotoService,
    deleteRestaurantPhotoService
} from './restaurant.services.js';
import Restaurant from './restaurant.model.js';

export const createRestaurant = async (req, res) => {
    try {

        const restaurant = await createRestaurantRecord({
            restaurantData: req.body,
            userId: req.user.id,
            file: req.file //faltaba
        });

        res.status(201).json({
            success: true,
            message: 'Restaurante registrado exitosamente',
            data: restaurant
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: `Ya existe un restaurante con ese nombre`
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error al registrar el restaurante',
            error: error.message
        });
    }
};

export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            total: restaurants.length,
            data: restaurants
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }
        res.json({ success: true, data: restaurant });
    } catch (err) {
        res.status(500).json({
            success: false, message: err.message
        });
    }
};

export const updateRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurante no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Restaurante actualizado correctamente',
            data: restaurant
        });
    } catch (err) {
        if (err.code == 11000) {
            return res.status(409).json({
                success: false,
                message: 'Ya existe un restaurante con ese nombre'
            });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteRestaurant = async (req, res) => {
    try {
        await deleteRestaurantRecord(req.params.id);
        res.json({
            success: true,
            message: 'Restaurante eliminado exitosamente'
        });
    } catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};

//imagenes con cloudinary
export const uploadRestaurantPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ninguna imagen'
            });
        }

        const restaurant = await uploadRestaurantPhotoService({
            restaurantId: req.params.id,
            file: req.file
        });

        res.status(200).json({
            success: true,
            message: 'Foto del restaurante actualizada exitosamente',
            data: restaurant
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al subir la foto del restaurante',
            error: error.message
        });
    }
};

export const deleteRestaurantPhoto = async (req, res) => {
    try {
        const restaurant = await deleteRestaurantPhotoService(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Foto del restaurante eliminada exitosamente',
            data: restaurant
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la foto del restaurante',
            error: error.message
        });
    }
};