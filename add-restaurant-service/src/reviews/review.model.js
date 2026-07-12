import { Schema, model } from 'mongoose';

const reviewSchema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es obligatorio'],
        index: true
    },

    userId: {
        type: String,
        required: [true, 'El userId es obligatorio'],
        index: true
    },

    userName: {
        type: String,
        required: [true, 'El nombre del usuario es obligatorio'],
        trim: true,
        maxLength: [80, 'El nombre no puede exceder 80 caracteres']
    },

    rating: {
        type: Number,
        required: [true, 'La calificación es obligatoria'],
        min: [1, 'La calificación mínima es 1'],
        max: [5, 'La calificación máxima es 5']
    },

    comment: {
        type: String,
        required: [true, 'El comentario es obligatorio'],
        trim: true,
        maxLength: [500, 'El comentario no puede exceder 500 caracteres']
    },

    //respuesta del RES_ADMIN al comentario
    reply: {
        type: String,
        trim: true,
        maxLength: [500, 'La respuesta no puede exceder 500 caracteres'],
        default: null
    },

    repliedAt: {
        type: Date,
        default: null
    },

    repliedBy: {
        type: String, //userId del RES_ADMIN que respondió
        default: null
    }
},
{
    timestamps: true,
    versionKey: false
});

export default model('Review', reviewSchema);
