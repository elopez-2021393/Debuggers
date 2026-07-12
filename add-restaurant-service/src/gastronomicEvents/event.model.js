import mongoose from 'mongoose';

const { Schema } = mongoose;

const timeSlotSchema = new Schema({
  from: {
    type: String,
    required: [true, 'La hora de inicio es requerida'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)']
  },
  to: {
    type: String,
    required: [true, 'La hora de fin es requerida'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:MM)']
  }
}, { _id: false });

const scheduleSchema = new Schema({
  start_date: {
    type: Date,
    required: [true, 'La fecha de inicio es requerida']
  },
  end_date: {
    type: Date,
    required: [true, 'La fecha de fin es requerida'],
    validate: {
      validator: function (value) {
        return value > this.start_date;
      },
      message: 'La fecha de fin debe ser mayor a la fecha de inicio'
    }
  },
  recurrence: {
    type: String,
    enum: {
      values: ['none', 'daily', 'weekly', 'monthly'],
      message: '{VALUE} no es una recurrencia válida'
    },
    default: 'none'
  },
  days_of_week: {
    type: [Number],
    validate: {
      validator: (arr) => arr.every(d => d >= 0 && d <= 6),
      message: 'Los días de la semana deben estar entre 0 (Domingo) y 6 (Sábado)'
    },
    default: []
  },
  time_slots: {
    type: [timeSlotSchema],
    default: []
  }
}, { _id: false });

const gastronomicEventSchema = new Schema({
  name: {
    type: String,
    required: [true, 'El nombre del evento es requerido'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [100, 'El nombre no puede superar 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede superar 500 caracteres']
  },
  type: {
    type: String,
    required: [true, 'El tipo de evento es requerido'],
    enum: {
      values: ['event', 'promotion', 'coupon'],
      message: '{VALUE} no es un tipo válido'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'active', 'paused', 'expired', 'cancelled'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'draft'
  },
  restaurant_id: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'El restaurante es requerido']
  },
  schedule: {
    type: scheduleSchema,
    required: [true, 'El horario del evento es requerido']
  },
  visibility: {
    type: String,
    enum: {
      values: ['public', 'private', 'members_only'],
      message: '{VALUE} no es una visibilidad válida'
    },
    default: 'public'
  },
  max_capacity: {
    type: Number,
    min: [1, 'La capacidad mínima es 1'],
    max: [10000, 'La capacidad máxima es 10,000']
  },
  current_capacity: {
    type: Number,
    default: 0,
    min: [0, 'La capacidad actual no puede ser negativa'],
    validate: {
      validator: function (value) {
        return !this.max_capacity || value <= this.max_capacity;
      },
      message: 'La capacidad actual no puede superar la capacidad máxima'
    }
  },
  tags: {
    type: [String],
    validate: {
      validator: (arr) => arr.length <= 10,
      message: 'No se pueden agregar más de 10 tags'
    },
    default: []
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El creador es requerido']
  },

  //logica del cliente
  inscripciones: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User'},
    fechaInscripcion: { type: Date, default: Date.now},
    _id: false
  }],

  usos: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User'},
    fechaUso: { type: Date, default: Date.now},
    _id: false
  }],

  max_usos:{
    type: Number,
    default: null
  },

  usos_actuales:{
    type: Number,
    default: 0
  }


},

{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});



// Índices
gastronomicEventSchema.index({ restaurant_id: 1, status: 1 });
gastronomicEventSchema.index({ 'schedule.start_date': 1, 'schedule.end_date': 1 });

export default mongoose.model('GastronomicEvent', gastronomicEventSchema);