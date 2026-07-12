import {
    createMenuService, getMenusService, getMenuByIdService, updateMenuService, deleteMenuService, uploadMenuPhotoService, deleteMenuPhotoService, getMenusByRestaurantService
} from './menu.services.js';

export const createMenu = async (req, res) => {
    try {
        const menu = await createMenuService(req.body, req.file);

        res.status(201).json({
            success: true,
            message: 'Menu creado',
            data: menu
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Error al crear menu',
            error: e.message
        });
    }
};//Crear el menú

export const getMenus = async (req, res) => {
    try {
        const menus = await getMenusService();

        res.status(200).json({
            success: true,
            data: menus
        });
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener menus',
            error: e.message
        });
    }
};//Listar menús

export const getMenuById = async (req, res) => {
    try {
        const menu = await getMenuByIdService(req.params.id);

        res.status(200).json({
            success: true,
            data: menu
        });
    } catch (e) {
        res.status(404).json({
            success: false,
            message: e.message
        });
    }
};

export const getMenusByRestaurant = async (req, res) => {
    try {
        const menus = await getMenusByRestaurantService(req.params.restaurantId);
        res.status(200).json({ success: true, data: menus });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

export const updateMenu = async (req, res) => {
    try {
        const menu = await updateMenuService(
            req.params.id,
            req.body,
            req.file);
        res.status(200).json({
            success: true,
            message: 'Menu actualizado',
            data: menu
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};//Actualizar un menú

export const deleteMenu = async (req, res) => {
    try {
        await deleteMenuService(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Menu eliminado'
        });
    } catch (e) {
        res.status(400).json({
            success: false,
            message: e.message
        });
    }
};//Eliminar un menú

export const uploadMenuPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ninguna imagen'
            });
        }

        const menu = await uploadMenuPhotoService({
            menuId: req.params.id,
            file: req.file
        });

        res.status(200).json({
            success: true,
            message: 'Foto del plato actualizada exitosamente',
            data: menu
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al subir la foto del plato',
            error: error.message
        });
    }
};

export const deleteMenuPhoto = async (req, res) => {
    try {
        const menu = await deleteMenuPhotoService(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Foto del plato eliminada exitosamente',
            data: menu
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la foto del plato',
            error: error.message
        });
    }
};