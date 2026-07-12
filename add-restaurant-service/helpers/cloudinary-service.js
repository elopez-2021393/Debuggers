import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import 'dotenv/config';

// FIX: Bypass SSL (Cloudinary, etc.)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (filePath, fileName, folder) => {
    try {
        const options = {
            public_id: fileName,
            folder: folder,
            resource_type: 'image',
            transformation: [
                { width: 400, height: 400, crop: 'fill', gravity:'face' },
                { quality: 'auto', fetch_format: 'auto' },
            ],
        };

        const result = await cloudinary.uploader.upload(filePath, options);

        // Eliminar archivo local después de subir exitosamente
        try {
            await fs.unlink(filePath);
        } catch {
            console.warn('Warning: Could not delete local file:', filePath);
        }

        if (result.error) {
            throw new Error(`Error uploading image: ${result.error.message}`);
        }

        return fileName;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error?.message || error);

        try {
            await fs.unlink(filePath);
        } catch {
            console.warn('Warning: Could not delete local file after upload error');
        }

        throw new Error(`Failed to upload image to Cloudinary: ${error?.message || ''}`);
    }
};

export const deleteImage = async (imagePath, folder) => {
    try {
        if (!imagePath) return true;

        const publicId = imagePath.includes('/')
            ? imagePath
            : `${folder}/${imagePath}`;

        const result = await cloudinary.uploader.destroy(publicId);
        return result.result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return false;
    }
};

export const getFullImageUrl = (imagePath, folder) => {
    if (!imagePath) return null;

    const baseUrl = process.env.CLOUDINARY_BASE_URL;

    const pathToUse = imagePath.includes('/')
        ? imagePath
        : `${folder}/${imagePath}`;

    return `${baseUrl}${pathToUse}`;
};

export default {
    uploadImage,
    deleteImage,
    getFullImageUrl,
};