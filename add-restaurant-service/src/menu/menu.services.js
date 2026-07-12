import Menu from './menu.model.js';
import { deleteCloudinaryImage } from '../../middlewares/file-uploader.js';

const MENU_FOLDER = process.env.CLOUDINARY_MENU_FOLDER || 'menu';

export const createMenuService = async (data, file) => {
    if (typeof data.ingredients === 'string') {
        data.ingredients = data.ingredients.split(',').map((i) => i.trim()).filter(Boolean);
    }
    if (data.price !== undefined) data.price = Number(data.price);

    if (data['availability[days][]']) {
        const days = Array.isArray(data['availability[days][]'])
            ? data['availability[days][]']
            : [data['availability[days][]']];

        data.availability = { days };
        delete data['availability[days][]'];
    }

    if (data.available !== undefined) data.available = data.available === 'true' || data.available === true;


    const menu = new Menu(data);
    if (file) {
        menu.photo = file.path;
        menu.publicId = file.filename;
    }
    await menu.save();
    await menu.populate('restaurantId', 'name');
    return menu.toObject();
};

export const getMenusService = async () => {
    return await Menu.find().populate('restaurantId', 'name');
};

export const getMenuByIdService = async (id) => {
    const menu = await Menu.findById(id);
    if (!menu) throw new Error('Menu no encontrado');
    return menu;
};

export const updateMenuService = async (id, data, file) => {
    const menu = await Menu.findById(id);
    if(!menu) throw new Error('Menu no encontrado');

    if (typeof data.ingredients === 'string') {
        data.ingredients = data.ingredients
            .split(',')
            .map(i => i.trim())
            .filter(Boolean);
    }

    if(data.price !== undefined) data.price=Number(data.price)
    if(data['availability[days][]']){
        const days = Array.isArray(data['availability[days][]'])
        ?data['availability[days][]']
        :[data['availability[days][]']];

        data.availability = {days};
        delete data['availability[days][]'];
    }//convertir en array los dias de disponibilidad

    if(data.available !== undefined) data.available = data.available == 'true' || data.available === true;

    delete data.photo;
    Object.assign(menu,data);

    if (file) {
        if (menu.publicId) {
            await deleteCloudinaryImage(menu.publicId);
        }
        menu.photo = file.path;
        menu.publicId = file.filename;
    }//Remplaza la imagen

    await menu.save();
    await menu.populate('restaurantId', 'name');
    return menu.toObject();
};

export const deleteMenuService = async (id) => {
    const menu = await Menu.findByIdAndDelete(id);
    if (!menu) throw new Error('Menu no encontrado');
    return menu;
};

export const uploadMenuPhotoService = async ({ menuId, file }) => {
    const menu = await Menu.findById(menuId);
    if (!menu) throw new Error('Menu no encontrado');

    if (menu.publicId) {
        await deleteCloudinaryImage(menu.publicId);
    }

    menu.photo = file.path;
    menu.publicId = file.filename;
    await menu.save();
    return menu.toObject();
};

export const deleteMenuPhotoService = async (menuId) => {
    const menu = await Menu.findById(menuId);
    if (!menu) throw new Error('Menu no encontrado');

    if (menu.photo) {
        await deleteCloudinaryImage(menu.publicId);
        menu.photo = null;
        menu.publicId=null;
        await menu.save();
    }

    return menu;
};

export const getMenusByRestaurantService = async (restaurantId) => {
    return await Menu.find({ restaurantId, available: true }).sort({ category: 1, name: 1 });
}
