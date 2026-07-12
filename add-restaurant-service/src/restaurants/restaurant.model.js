import { Schema, model } from 'mongoose';

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: [true, 'El nombre del restaurante es obligatorio'],
        trim: true,
        maxLength: [100, 'Máximo 100 caracteres']
    },
    assignedAdmin: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    photo: {//Imagen del restaurante
        type: String,
        default: null
    },
    capacity: {
        type: Number,
        required: [true, 'La capacidad del restaurante es obligatorio.'],
        min: [20, 'Capacidad mínima admitida es de 20']
    },
    address: {//Dirección
        type: String,
        required: [true, 'La dirección es obligatoria']
    },
    businessHours: {//Horario de apertura y cierre
        open: { type: String, trim: true },
        close: { type: String, trim: true }
    },
    phone: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
        match: [/^\d{8}$/, 'El teléfono debe de tener 8 digítos únicamente']

    },
    category: {//Categoría gastronómica
        type: String,
        enum: {
            values: ['COMIDA_RAPIDA', 'ITALIANA', 'CHINA', 'MEXICANA', 'CAFETERIA'],
            message: 'Categoría no válida'
        },
        required: true
    },
    contactInfo: {//manager, contacto@gmail.com
        managerName: { type: String, trim: true },
        email: { type: String, trim: true }
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true,
    versionKey: false
});

export default model('Restaurant', restaurantSchema);