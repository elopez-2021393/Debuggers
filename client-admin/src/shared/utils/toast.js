import { toast } from 'react-hot-toast';

//colores y estilos
const baseStyle = {
  borderRadius: '8px',
  fontWeight: 600,
  fontFamily: 'inherit',
  fontSize: '0.9rem',
  padding: '12px 20px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
};

export const showSuccess = (message) =>
  toast.success(message, {
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
      color: '#fff',
    },
    iconTheme: { primary: '#fff', secondary: '#22c55e' },
  });

export const showError = (message) =>
  toast.error(message, {
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)',
      color: '#fff',
    },
    iconTheme: { primary: '#fff', secondary: '#ef4444' },
  });

export const showInfo = (message) =>
  toast(message, {
    style: {
      ...baseStyle,
      background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)',
      color: '#fff',
    },
  });
