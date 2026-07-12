import { createReviewRecord, getReviewsByRestaurantRecord, getReviewsByUserRecord, updateReviewRecord, deleteReviewRecord, replyToReviewRecord } from './review.services.js';

export const createReview = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { rating, comment } = req.body;

        const review = await createReviewRecord({
            restaurantId,
            userId: req.user.id,
            userName: req.user.username,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            message: 'Comentario publicado exitosamente',
            data: review
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al publicar el comentario',
            error: e.message
        });
    }//try-catch
};//createReview

export const getReviewsByRestaurant = async (req, res) => {
    try {
        const reviews = await getReviewsByRestaurantRecord(
            req.params.restaurantId,
            req.user.id,
            req.user.role
        );

        res.status(200).json({
            success: true,
            total: reviews.length,
            data: reviews
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al obtener los comentarios',
            error: e.message
        });
    }
};//getReviewsByRestaurant

//Mis resenias
export const getMyReviews = async (req, res) => {
    try {
        const reviews = await getReviewsByUserRecord(req.user.id);
        res.status(200).json({ success: true, total: reviews.length, data: reviews });
    } catch (e) {
        res.status(e.statusCode || 500).json({ success: false, message: 'Error al obtener tus reseñas', error: e.message });
    }
};

export const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const review = await updateReviewRecord({
            reviewId: req.params.id,
            userId: req.user.id,
            rating,
            comment
        });

        res.status(200).json({
            success: true,
            message: 'Comentario actualizado exitosamente',
            data: review
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al actualizar el comentario',
            error: e.message
        });
    }//try-catch
};//updateReview

export const deleteReview = async (req, res) => {
    try {
        const result = await deleteReviewRecord({
            reviewId: req.params.id,
            userId: req.user.id,
            userRole: req.user.role
        });

        res.status(200).json({
            success: true,
            message: 'Comentario eliminado exitosamente',
            data: result
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al eliminar el comentario',
            error: e.message
        });
    }//try-catch
};//deleteReview

//Respuesta del RES_ADMIN a un comentario
export const replyToReview = async (req, res) => {
    try {
        const { reply } = req.body;

        const review = await replyToReviewRecord({
            reviewId: req.params.id,
            userId: req.user.id,
            replyText: reply
        });

        res.status(200).json({
            success: true,
            message: 'Respuesta publicada exitosamente',
            data: review
        });
    } catch (e) {
        res.status(e.statusCode || 500).json({
            success: false,
            message: 'Error al publicar la respuesta',
            error: e.message
        });
    }//try-catch
};//replyToReview