import { Schema, model } from 'mongoose';

const reservationSchema = new Schema({
    userId: {
        type: String,
        required: [true, 'El userId es obligatorio'],
        index: true
    },

    reservationDate: {
        type: Date,
        required: [true, 'La reservación debe tener fecha']
    },

    reservationHour: {
        type: String,
        required: [true, 'La hora de reservación es obligatoria']
    },

    peopleName: {
        type: String,
        required: [true, 'El nombre del titular de la reservación es obligatorio'],
        maxLength: [100, 'El nombre no puede exceder 100 caracteres']
    },

    restaurantName: {
        type: String,
        required: [true, 'Debe seleccionar el restaurante para la reservación'],
        index: true
    },

    //Mesa asignada a la reservación
    tableId: {
        type: Schema.Types.ObjectId,
        ref: 'Table',
        required: [true, 'Debe seleccionar una mesa para la reservación']
    },

    peopleNumber: {
        type: Number,
        required: [true, 'El número de personas es obligatorio'],
        min: [1, 'El mínimo de personas es 1'],
        max: [20, 'El máximo de personas permitido es 20']
    },

    observation: {
        type: String,
        maxLength: [255, 'Las observaciones no deben exceder 255 caracteres']
    },

    status: {
        type: String,
        enum: {
            values: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'],
            message: 'Estado inválido'
        },
        default: 'PENDIENTE'
    },

    confirmationToken: {
        type: String,
        select: false
    }
},
    {
        timestamps: true,
        versionKey: false
    });

//Una mesa no puede tener dos reservaciones activas en la misma fecha y hora
reservationSchema.index(
    { tableId: 1, reservationDate: 1, reservationHour: 1 },
    {
        unique: true,
        partialFilterExpression: { status: { $in: ['PENDIENTE', 'CONFIRMADA'] } },
        name: 'unique_active_reservation_per_table'
    }
);

export default model('Reservation', reservationSchema);
//Esto tambien foeron otros 20 oesis mas