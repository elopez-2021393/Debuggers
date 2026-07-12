import Restaurant from './restaurant.model.js';
import { cloudinary } from '../../middlewares/file-uploader.js';

const RESTAURANT_FOLDER = 'add-restaurant/restaurants';

export const createRestaurantRecord = async ({ restaurantData, userId, file }) => {
    const data = { ...restaurantData, createdBy: userId };

    if (file) {
        data.photo = file.path; //URL pública de Cloudinary
    }

    const restaurant = new Restaurant(data);
    await restaurant.save();
    return restaurant;
};

export const getAllRestaurantsRecord = async () => {
    return Restaurant.find().sort({ createdAt: -1 });
};

export const getRestaurantByName = async (name) => {
    return Restaurant.findOne({ name: name.trim() });
};

export const deleteRestaurantRecord = async (restaurantId) => {
    const restaurant = await Restaurant.findByIdAndDelete(restaurantId);

    if (!restaurant) {
        const e = new Error('Restaurante no encontrado');
        e.statusCode = 404;
        throw e;
    }

    return { deleted: true, restaurant };
};

export const uploadRestaurantPhotoService = async ({ restaurantId, file }) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurante no encontrado');

    //Eliminar foto anterior de Cloudinary si existe
    if (restaurant.photo) {
        try {
            const parts = restaurant.photo.split('/');
            const fileNameWithExt = parts[parts.length - 1];
            const publicId = `${RESTAURANT_FOLDER}/${fileNameWithExt.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error(`Error al eliminar imagen anterior de Cloudinary: ${err.message}`);
        }
    }

    restaurant.photo = file.path;
    await restaurant.save();
    return restaurant;
};

export const deleteRestaurantPhotoService = async (restaurantId) => {
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurante no encontrado');

    if (restaurant.photo) {
        try {
            const parts = restaurant.photo.split('/');
            const fileNameWithExt = parts[parts.length - 1];
            const publicId = `${RESTAURANT_FOLDER}/${fileNameWithExt.split('.')[0]}`;
            await cloudinary.uploader.destroy(publicId);
        } catch (err) {
            console.error(`Error al eliminar imagen de Cloudinary: ${err.message}`);
        }

        restaurant.photo = null;
        await restaurant.save();
    }

    return restaurant;
};