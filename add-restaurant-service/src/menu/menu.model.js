import { Schema, model } from 'mongoose';

const menuSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del menú es obligatorio'],
        trim: true,
        maxLength: [100, 'El nombre no puede exceder de 100 caracteres']
    },
    photo: {//Foto del plato
        type: String,
        default: null
    },
    publicId: {
        type: String,
        default: null
    },
    description: {
        type: String,
        trim: true,
        maxLength: [255, 'La descripción no puede exceder de 255 caracteres']
    },
    ingredients: {//Ingredientes de platos
        type: [String],
        default: []
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    category: {
        type: String,
        required: [true, 'La categoría es obligatoria'],
        enum: {
            values: ['DESAYUNO', 'ALMUERZO', 'CENA', 'BEBIDA', 'POSTRE'],
            message: 'Categoría no válida'
        }
    },
    availability: {//Días disponibles
        days: {
            type: [String],
            enum: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'],
            default: []
        }
    },
    restaurantId: {
        type: Schema.Types.ObjectId,
        required: [true, 'El restaurante es obligatorio'],
        ref: 'Restaurant'
    },
    available: {
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
        versionKey: false
    });

export default model('Menu', menuSchema);