import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export const CreateUserModal = ({ isOpen, onClose, onCreate, loading, restaurants = [] }) => {
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const selectedRole = watch('role');

  if (!isOpen) return null;

  const submit = async (values) => {
    const payload = {
      firstName: values.firstName,
      surname: values.surname,
      username: values.username,
      email: values.email,
      password: values.password,
      role: values.role,
      phone: values.phone || undefined,
      ...(values.role === 'RES_ADMIN_ROLE' && { restaurantId: values.restaurantId }),
    };

    const ok = await onCreate(payload);
    if (ok) {
      reset();
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-4'
      style={{ background: 'rgba(11,11,13,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className='w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden'
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className='p-5 text-white'
          style={{ background: 'var(--dbe-gradient-h)' }}
        >
          <h2 className='text-xl font-bold'>Nuevo Usuario</h2>
          <p className='text-xs opacity-75 mt-0.5'>
            Completa la información para registrar un nuevo usuario
          </p>
        </div>

        <form onSubmit={handleSubmit(submit)} className='p-5 space-y-4 overflow-y-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='dbe-label mb-1'>Nombre</label>
              <input
                type='text'
                className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg transition'
                {...register('firstName', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                  pattern: {
                    value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
                    message: 'Solo se permiten letras',
                  },
                })}
              />
              {errors.firstName && <p className='dbe-error'>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className='dbe-label mb-1'>Apellido</label>
              <input
                type='text'
                className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg transition'
                {...register('surname', {
                  required: 'El apellido es obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  maxLength: { value: 50, message: 'Máximo 50 caracteres' },
                  pattern: {
                    value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/,
                    message: 'Solo se permiten letras',
                  },
                })}
              />
              {errors.surname && <p className='dbe-error'>{errors.surname.message}</p>}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='dbe-label mb-1'>Nombre de usuario</label>
              <input
                type='text'
                className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg transition'
                {...register('username', {
                  required: 'El username es obligatorio',
                  minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                  maxLength: { value: 20, message: 'Máximo 20 caracteres' },
                  pattern: {
                    value: /^\S+$/,
                    message: 'El username no puede contener espacios',
                  },
                })}
              />
              {errors.username && <p className='dbe-error'>{errors.username.message}</p>}
            </div>
            <div>
              <label className='dbe-label mb-1'>Teléfono</label>
              <input
                type='tel'
                className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg transition'
                {...register('phone', {
                  pattern: {
                    value: /^[0-9]{8}$/,
                    message: 'El teléfono debe tener 8 dígitos',
                  },
                })}
              />
              {errors.phone && <p className='dbe-error'>{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className='dbe-label mb-1'>Correo electrónico</label>
            <input
              type='email'
              className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg transition'
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Formato inválido' },
              })}
            />
            {errors.email && <p className='dbe-error'>{errors.email.message}</p>}
          </div>

          <div>
            <label className='dbe-label mb-1'>Rol</label>
            <select
              className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg transition cursor-pointer'
              {...register('role', { required: 'El rol es obligatorio' })}
            >
              <option value='ALL' style={{ background: '#1a1a2e' }}>
                Seleccione un rol
              </option>
              <option value='RES_ADMIN_ROLE' style={{ background: '#1a1a2e' }}>
                RES_ADMIN_ROLE
              </option>
              <option value='USER_ROLE' style={{ background: '#1a1a2e' }}>
                USER_ROLE
              </option>
            </select>
            {errors.role && <p className='dbe-error'>{errors.role.message}</p>}
          </div>

          {selectedRole === 'RES_ADMIN_ROLE' && (
            <div
              className='rounded-xl p-4 space-y-1'
              style={{
                background: 'rgba(147,98,217,0.08)',
                border: '1px solid rgba(147,98,217,0.25)',
              }}
            >
              <label className='dbe-label mb-1' style={{ color: '#a78bfa' }}>
                Restaurante asignado
              </label>
              <select
                className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg transition'
                {...register('restaurantId', {
                  required: 'Debes asignar un restaurante al RES_ADMIN_ROLE',
                })}
              >
                <option value='ALL' style={{ background: '#1a1a2e' }}>
                  Seleccione un restaurante
                </option>
                {restaurants.map((r) => (
                  <option
                    key={r._id}
                    value={r._id}
                    style={{ background: '#1a1a2e' }}
                    disabled={!!r.assignedAdmin}
                  >
                    {r.name} {r.assignedAdmin ? '(ya tiene admin)' : ''}
                  </option>
                ))}
              </select>
              {errors.restaurantId && <p className='dbe-error'>{errors.restaurantId.message}</p>}
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='dbe-label mb-1'>Contraseña</label>
              <input
                type='password'
                className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg transition'
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 8, message: 'Mínimo 8 caracteres' },
                  pattern: {
                    value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                    message: 'Debe incluir al menos una letra y un número',
                  },
                })}
              />
              {errors.password && <p className='dbe-error'>{errors.password.message}</p>}
            </div>
            <div>
              <label className='dbe-label mb-1'>Confirmar contraseña</label>
              <input
                type='password'
                className='dbe-input-dark w-full px-3 py-2 text-sm rounded-lg transition'
                {...register('confirmPassword', {
                  required: 'Confirma la contraseña',
                  validate: (v) => v === getValues('password') || 'Las contraseñas no coinciden',
                })}
              />
              {errors.confirmPassword && (
                <p className='dbe-error'>{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div
            className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4'
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              type='button'
              onClick={() => {
                reset();
                onClose();
              }}
              className='w-full sm:w-auto px-5 py-2 rounded-lg text-sm font-medium transition'
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='dbe-btn-primary w-full sm:w-auto px-5 py-2'
            >
              {loading ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};