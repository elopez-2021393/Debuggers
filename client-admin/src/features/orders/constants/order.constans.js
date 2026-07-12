export const ORDER_STATUS = {
    PENDIENTE: 'Pendiente',
    ACEPTADO: 'Aceptado',
    EN_PREPARACION: 'En_preparación',
    LISTO: 'Listo',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
};

export const ADDRESS_TYPE = {
    CASA: 'Casa',
    TRABAJO: 'Trabajo',
    OTRO: 'Otro',
};

export const PAYMENT_TYPE = {
    EFECTIVO: 'Efectivo',
    TARJETA: 'Tarjeta',
};

// Ventana de cancelación del cliente en milisegundos
export const CANCEL_WINDOW_MS = 5 * 60 * 1000;

export const ORDER_STATUS_CONFIG = {
    [ORDER_STATUS.PENDIENTE]: {
        label: 'Pendiente',
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        border: 'border-yellow-400/20',
        dot: 'bg-yellow-400',
    },
    [ORDER_STATUS.ACEPTADO]: {
        label: 'Aceptado',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-400/20',
        dot: 'bg-blue-400',
    },
    [ORDER_STATUS.EN_PREPARACION]: {
        label: 'En preparación',
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
        border: 'border-purple-400/20',
        dot: 'bg-purple-400',
    },
    [ORDER_STATUS.LISTO]: {
        label: 'Listo',
        color: 'text-pink-400',
        bg: 'bg-pink-400/10',
        border: 'border-pink-400/20',
        dot: 'bg-pink-400',
    },
    [ORDER_STATUS.ENTREGADO]: {
        label: 'Entregado',
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        border: 'border-green-400/20',
        dot: 'bg-green-400',
    },
    [ORDER_STATUS.CANCELADO]: {
        label: 'Cancelado',
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-400/20',
        dot: 'bg-red-400',
    },
};//Configuración visual de cada estado 

export const VALID_TRANSITIONS = {
    [ORDER_STATUS.PENDIENTE]: [ORDER_STATUS.ACEPTADO, ORDER_STATUS.CANCELADO],
    [ORDER_STATUS.ACEPTADO]: [ORDER_STATUS.EN_PREPARACION, ORDER_STATUS.CANCELADO],
    [ORDER_STATUS.EN_PREPARACION]: [ORDER_STATUS.LISTO],
    [ORDER_STATUS.LISTO]: [ORDER_STATUS.ENTREGADO],
    [ORDER_STATUS.ENTREGADO]: [],
    [ORDER_STATUS.CANCELADO]: [],
};