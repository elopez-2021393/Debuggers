import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export const EditProfileModal = ({ isOpen, onClose, onSave, user, loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (isOpen && user) {
      reset({
        firstName: user.firstName || '',
        surname: user.surname || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
      });
    }
  }, [isOpen, user, reset]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    const payload = Object.fromEntries(Object.entries(data).filter(([, v]) => v));
    const ok = await onSave(payload);
    if (ok) onClose();
  };

  const initials = `${user?.firstName?.[0] ?? ''}${user?.surname?.[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center p-4'
      style={{ background: 'rgba(11,11,13,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className='w-full max-w-[480px] rounded-[20px] overflow-hidden animate-fadeInScale'
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#13131c',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(242,80,156,0.08)',
        }}
      >
        <div
          className='flex items-center justify-between px-6 py-5'
          style={{
            background:
              'linear-gradient(135deg, rgba(242,80,156,0.15) 0%, rgba(147,98,217,0.1) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className='flex items-center gap-3'>
            <div
              className='w-[38px] h-[38px] rounded-full flex items-center justify-center text-[15px] font-extrabold text-white shrink-0'
              style={{ background: 'var(--dbe-gradient)' }}
            >
              {initials}
            </div>
            <div>
              <h2 className='text-[16px] font-bold text-white m-0'>Editar perfil</h2>
              <p className='text-[12px] m-0 mt-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
                @{user?.username}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-8 h-8 rounded-lg flex items-center justify-center text-[16px] border-none cursor-pointer transition-all'
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
            }}
          >
            X
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 p-6'>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='dbe-label mb-1.5'>Nombre</label>
              <input
                className='dbe-input w-full px-3.5 py-2.5 text-[13px] rounded-lg transition'
                {...register('firstName', { required: 'Obligatorio' })}
              />
              {errors.firstName && <p className='dbe-error'>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className='dbe-label mb-1.5'>Apellido</label>
              <input
                className='dbe-input w-full px-3.5 py-2.5 text-[13px] rounded-lg transition'
                {...register('surname', { required: 'Obligatorio' })}
              />
              {errors.surname && <p className='dbe-error'>{errors.surname.message}</p>}
            </div>
          </div>

          <div>
            <label className='dbe-label mb-1.5'>Correo electrónico</label>
            <input
              type='email'
              className='dbe-input w-full px-3.5 py-2.5 text-[13px] rounded-lg transition'
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
              })}
            />
            {errors.email && <p className='dbe-error'>{errors.email.message}</p>}
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='dbe-label mb-1.5'>Usuario</label>
              <input
                className='dbe-input w-full px-3.5 py-2.5 text-[13px] rounded-lg transition'
                {...register('username', {
                  required: 'Obligatorio',
                  minLength: { value: 3, message: 'Min. 3 caracteres' },
                })}
              />
              {errors.username && <p className='dbe-error'>{errors.username.message}</p>}
            </div>
            <div>
              <label className='dbe-label mb-1.5'>
                Teléfono{' '}
                <span
                  className='normal-case font-normal tracking-normal'
                  style={{ color: 'rgba(255,255,255,0.25)' }}
                >
                  (opcional)
                </span>
              </label>
              <input
                type='tel'
                className='dbe-input w-full px-3.5 py-2.5 text-[13px] rounded-lg transition'
                {...register('phone')}
              />
            </div>
          </div>

          <div
            className='flex gap-2.5 pt-2'
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              type='button'
              onClick={onClose}
              disabled={loading}
              className='flex-1 py-2.5 rounded-[10px] text-[13px] font-semibold border-none cursor-pointer transition-all'
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.55)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }}
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='dbe-btn-primary'
              style={{ flex: 2, padding: '10px', borderRadius: 10, fontSize: 13 }}
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
