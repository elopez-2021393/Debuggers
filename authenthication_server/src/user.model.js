import { Schema, model} from 'mongoose';

const userSchema = new Schema ({
    firstName:{
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true,
        maxLength: [35, 'El nombre no puede exceder de 35 caracteres']
    },
    surname:{
        type: String,
        required: [true, 'El apellido es obligatorio.'],
        trim: true,
        maxLength: [35, 'El apellido no puede exceder de 35 caracteres.']
    }, 
    email:{
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: [true, 'El correco electrónico ya existe. Por favor ingrese otro.']
    },
    phone: {
        type: String,
        maxLength: [16, 'El número de teléfono no puede exceder de los 16 números.']
    },
    username:{
        type: String,
        required: [true, 'Username es requerido.'],
        trim: true,
        unique: [true, "Nombre de usuario ya existente. Por favor ingrese otro."],
        maxLength: [40, 'El username no puede excederse de 40 caracteres.']
    },
    password:{
        type: String,
        required: [true, 'La contraseña es obligatorio'],
        trim: true
    },
    role:{
        type: String,
        enum:{
            values: ['ADMIN_ROLE', 'RES_ADMIN_ROLE','USER_ROLE'],
            message: 'Rol no permitido'
        }
    },
    isActive:{
        type: Boolean,
        default: false
    },
    activationToken:{
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    }
},
    {
        timestamps: true,
        versionKey: false,
    } 
);//userSchema

export default model('User', userSchema);