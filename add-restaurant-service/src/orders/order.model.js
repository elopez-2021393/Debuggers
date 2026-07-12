import { Schema, model} from 'mongoose';

//se lee los menuItems para mostrarlos en la orden
const orderItem = new Schema({
    menuItemId: {
        type: Schema.Types.ObjectId,
        ref: "Menu",
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: 1
    },
    aditamentos: {
        type: [String],
        default: []
    },
    subtotal: {
        type: Number,
        required: true
    },
},
    { _id: false });

const direccionSchema = new Schema({
    tipo: {
        type: String,
        enum: ['Casa', 'Trabajo', 'Otro'],
        default: 'Casa'
    },
    descripcion: {
        type: String,
        required: true
    },
    referencias: {
        type: String,
        default: ''
    }
},
    { _id: false });

const orderSchema = new Schema({
    restaurantId: {
        type: Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: {
        type: [orderItem],
        validate: {
            validator: v => v && v.length > 0,
            message: 'La orden debe contener al menos un platillo'
        },
    },

    //datos de entrega - necesarios al confirmar la orden
    direccion: {
        type: direccionSchema,
        required: true
    },
    telefono: {
        type: String,
        required: true
    },
    tipoPago: {
        type: String,
        enum: ['Tarjeta', 'Efectivo'],
        required: true
    },

    estimadoEntrega: {
        type: String,
        default: '30-45 minutos'
    },

    //totales calculos automaticamente en el pre save hook
    subtotal: {
        type: Number
    },
    iva: {
        type: Number
    },
    total: {
        type: Number
    },

    //estados del pedido
    status: {
        type: String,
        enum: ['Pendiente', 'En_preparación', 'Aceptado', 'Listo', 'Entregado', 'Cancelado'],
        default: 'Pendiente'
    },

    notas: {
        type: String,
        default: ''
    },

    historialStatus: [{
        status: String,
        cambiadoEn: {type: Date, default: Date.now},
        _id: false,
    }],

}, {timestamps: true});

//calculo de totales
orderSchema.pre('save', async function (){
    if(this.isModified('items') || this.isNew){
        this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        this.iva = parseFloat((this.subtotal * 0.12).toFixed(2));
        this.total = parseFloat((this.subtotal + this.iva).toFixed(2));
    }

    if(!this.isNew  && this.isModified('status')){
        this.historialStatus.push({status: this.status});
    }
});

export default model ('Order', orderSchema);      