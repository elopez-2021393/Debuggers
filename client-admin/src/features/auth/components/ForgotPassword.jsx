import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../../shared/apis/auth.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';

export const ForgotPassword = ({ onSwitch }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await forgotPassword(email);
      showSuccess('Revisa tu correo para restablecer la contraseña');
      onSwitch();
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Error al procesar la solicitud';
      showError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 px-6 pb-6'>
      <div>
        <label htmlFor='email' className='dbe-label mb-1.5'>
          Correo electrónico
        </label>
        <input
          type='email'
          id='email'
          placeholder='usuario@email.com'
          className='dbe-input w-full px-3 py-2.5 text-sm transition'
          {...register('email', {
            required: 'El correo es obligatorio',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
          })}
        />
        {errors.email && <p className='dbe-error'>{errors.email.message}</p>}
      </div>

      <button
        type='submit'
        disabled={isSubmitting}
        className='dbe-btn-primary w-full py-2.5 text-sm'
      >
        {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
      </button>

      <p className='text-center text-xs' style={{ color: 'rgba(255,255,255,0.4)' }}>
        <button
          type='button'
          onClick={onSwitch}
          className='transition hover:opacity-80'
          style={{ color: '#C35BB9' }}
        >
          Volver al inicio de sesión
        </button>
      </p>
    </form>
  );
};
