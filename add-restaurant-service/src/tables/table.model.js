import { Schema, model } from 'mongoose';

const tableSchema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es obligatorio'],
        index: true
    },

    tableNumber: {
        type: String,
        required: [true, 'El número o nombre de la mesa es obligatorio'],
        trim: true,
        maxLength: [20, 'El identificador de mesa no puede exceder 20 caracteres']
    },

    capacity: {
        type: Number,
        required: [true, 'La capacidad de la mesa es obligatoria'],
        min: [1, 'La capacidad mínima es 1 persona'],
        max: [20, 'La capacidad máxima por mesa es 20 personas']
    },

    location: {
        type: String,
        trim: true,
        maxLength: [100, 'La ubicación no puede exceder 100 caracteres']
        //ejemplos: 'Terraza', 'Interior', 'Ventana', 'Privado', etc.
    },

    isActive: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true,
    versionKey: false
});

//Un restaurante no puede tener dos mesas con el mismo número/nombre
tableSchema.index(
    { restaurantId: 1, tableNumber: 1 },
    { unique: true, name: 'unique_table_per_restaurant' }
);

export default model('Table', tableSchema);
