import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const RegisterForm = ({ onSwitch }) => {
  const register_user = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const payload = {
      firstName: data.firstName,
      surname: data.surname,
      email: data.email,
      username: data.username,
      password: data.password,
      phone: data.phone || undefined,
    };

    const res = await register_user(payload);
    if (res.success) {
      showSuccess('Cuenta creada. Revisa tu correo para activarla.');
      onSwitch();
    } else {
      showError(res.error || 'Error al crear la cuenta');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-3 px-6 pb-6'>
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='dbe-label mb-1'>Nombre</label>
          <input
            type='text'
            placeholder='Juan'
            className='dbe-input w-full px-3 py-2 text-sm transition'
            {...register('firstName', { required: 'Obligatorio' })}
          />
          {errors.firstName && <p className='dbe-error'>{errors.firstName.message}</p>}
        </div>
        <div>
          <label className='dbe-label mb-1'>Apellido</label>
          <input
            type='text'
            placeholder='Pérez'
            className='dbe-input w-full px-3 py-2 text-sm transition'
            {...register('surname', { required: 'Obligatorio' })}
          />
          {errors.surname && <p className='dbe-error'>{errors.surname.message}</p>}
        </div>
      </div>

      <div>
        <label className='dbe-label mb-1'>Correo electrónico</label>
        <input
          type='email'
          placeholder='usuario@email.com'
          className='dbe-input w-full px-3 py-2 text-sm transition'
          {...register('email', {
            required: 'El correo es obligatorio',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
          })}
        />
        {errors.email && <p className='dbe-error'>{errors.email.message}</p>}
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='dbe-label mb-1'>Usuario</label>
          <input
            type='text'
            placeholder='juanperez'
            className='dbe-input w-full px-3 py-2 text-sm transition'
            {...register('username', {
              required: 'Obligatorio',
              minLength: { value: 3, message: 'Min. 3 caracteres' },
            })}
          />
          {errors.username && <p className='dbe-error'>{errors.username.message}</p>}
        </div>
        <div>
          <label className='dbe-label mb-1'>Teléfono</label>
          <input
            type='tel'
            placeholder='42459699'
            className='dbe-input w-full px-3 py-2 text-sm transition'
            {...register('phone')}
          />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='dbe-label mb-1'>Contraseña</label>
          <input
            type='password'
            placeholder='••••••••'
            className='dbe-input w-full px-3 py-2 text-sm transition'
            {...register('password', {
              required: 'Obligatorio',
              minLength: { value: 8, message: 'Min. 8 caracteres' },
            })}
          />
          {errors.password && <p className='dbe-error'>{errors.password.message}</p>}
        </div>
        <div>
          <label className='dbe-label mb-1'>Confirmar</label>
          <input
            type='password'
            placeholder='••••••••'
            className='dbe-input w-full px-3 py-2 text-sm transition'
            {...register('confirmPassword', {
              required: 'Obligatorio',
              validate: (v) => v === getValues('password') || 'No coincide',
            })}
          />
          {errors.confirmPassword && <p className='dbe-error'>{errors.confirmPassword.message}</p>}
        </div>
      </div>

      <button
        type='submit'
        disabled={loading}
        className='dbe-btn-primary w-full py-2.5 text-sm mt-1'
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className='text-center text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>
        ¿Ya tienes cuenta?{' '}
        <button
          type='button'
          onClick={onSwitch}
          className='transition hover:opacity-80'
          style={{ color: '#C35BB9' }}
        >
          Iniciar sesión
        </button>
      </p>
    </form>
  );
};
