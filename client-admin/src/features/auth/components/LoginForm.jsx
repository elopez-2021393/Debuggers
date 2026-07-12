import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const LoginForm = ({ onForgot, onRegister }) => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.success) {
      showSuccess('Bienvenido a DebuggersEats');
      if (res.role === 'USER_ROLE') {
        navigate('/home');
      } else if (res.role === 'RES_ADMIN_ROLE') {
        navigate('/dashboard/resumen');
      } else {
        navigate('/dashboard/restaurants');
      }
    } else {
      showError(res.error || 'Credenciales incorrectas');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 px-6 pb-6'>
      <div>
        <label htmlFor='username' className='dbe-label mb-1.5'>
          Correo o usuario
        </label>
        <input
          type='text'
          id='username'
          placeholder='usuario@email.com'
          className='dbe-input w-full px-3 py-2.5 text-sm transition'
          {...register('username', { required: 'Este campo es obligatorio' })}
        />
        {errors.username && <p className='dbe-error'>{errors.username.message}</p>}
      </div>

      <div>
        <label htmlFor='password' className='dbe-label mb-1.5'>
          Contraseña
        </label>
        <input
          type='password'
          id='password'
          placeholder='••••••••'
          className='dbe-input w-full px-3 py-2.5 text-sm transition'
          {...register('password', { required: 'Este campo es obligatorio' })}
        />
        {errors.password && <p className='dbe-error'>{errors.password.message}</p>}
      </div>

      <button
        type='submit'
        disabled={loading}
        className='dbe-btn-primary w-full py-2.5 text-sm mt-2'
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      <p className='text-center text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>
        <button
          type='button'
          onClick={onForgot}
          className='transition hover:opacity-80'
          style={{ color: '#C35BB9' }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </p>

      <div className='relative flex items-center gap-3 py-1'>
        <div className='flex-1 h-px' style={{ background: 'rgba(255,255,255,0.1)' }} />
        <span className='text-xs font-medium' style={{ color: 'rgba(255,255,255,0.3)' }}>
          ¿Eres nuevo?
        </span>
        <div className='flex-1 h-px' style={{ background: 'rgba(255,255,255,0.1)' }} />
      </div>

      <button
        type='button'
        onClick={onRegister}
        className='w-full py-2.5 text-sm font-semibold rounded-lg transition'
        style={{
          background: 'transparent',
          border: '1px solid rgba(242,80,156,0.4)',
          color: '#F2509C',
        }}
      >
        Crear cuenta
      </button>
    </form>
  );
};
