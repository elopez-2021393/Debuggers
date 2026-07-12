import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Spinner } from '../../auth/components/Spinner.jsx';

const CATEGORIES = [
  { value: 'COMIDA_RAPIDA', label: 'Comida Rápida' },
  { value: 'ITALIANA', label: 'Italiana' },
  { value: 'CHINA', label: 'China' },
  { value: 'MEXICANA', label: 'Mexicana' },
  { value: 'CAFETERIA', label: 'Cafetería' },
];

export const RestaurantModal = ({ isOpen, onClose, onSave, loading, error, restaurant }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    if (restaurant) {
      reset({
        name: restaurant.name,
        capacity: restaurant.capacity,
        address: restaurant.address,
        phone: restaurant.phone,
        category: restaurant.category,
        businessHoursOpen: restaurant.businessHours?.open || '',
        businessHoursClose: restaurant.businessHours?.close || '',
        managerName: restaurant.contactInfo?.managerName || '',
        contactEmail: restaurant.contactInfo?.email || '',
      });
      setPreview(restaurant.photo || null);
    } else {
      reset({
        name: '',
        capacity: '',
        address: '',
        phone: '',
        category: '',
        businessHoursOpen: '',
        businessHoursClose: '',
        managerName: '',
        contactEmail: '',
        photo: null,
      });
      setPreview(null);
    }
  }, [isOpen, restaurant, reset]);

  useEffect(() => {
    const sub = watch((value, { name }) => {
      if (name === 'photo' && value.photo?.length > 0)
        setPreview(URL.createObjectURL(value.photo[0]));
    });
    return () => sub.unsubscribe();
  }, [watch]);

  if (!isOpen) return null;

  const businessHoursOpen = watch('businessHoursOpen');

  const submit = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('capacity', values.capacity);
    formData.append('address', values.address);
    formData.append('phone', values.phone);
    formData.append('category', values.category);
    formData.append('businessHoursOpen', values.businessHoursOpen);
    formData.append('businessHoursClose', values.businessHoursClose);
    formData.append('managerName', values.managerName);
    formData.append('contactEmail', values.contactEmail);
    if (values.photo?.[0]) formData.append('photo', values.photo[0]);

    const ok = await onSave(formData, restaurant?._id);
    if (ok) {
      reset();
      setPreview(null);
      onClose();
    }
  };

  return (
    <div
      className='fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4'
      style={{ background: 'rgba(11,11,13,0.85)' }}
    >
      <div
        className='w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden'
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div
          className='p-4 sm:p-5 text-white sticky top-0 z-10'
          style={{ background: 'var(--dbe-gradient-h)' }}
        >
          <h2 className='text-xl sm:text-2xl font-bold'>
            {restaurant ? 'Editar Restaurante' : 'Nuevo Restaurante'}
          </h2>
          <p className='text-xs sm:text-sm opacity-80'>Completa la información del restaurante</p>
        </div>

        <form onSubmit={handleSubmit(submit)} className='p-4 sm:p-6 space-y-4 overflow-y-auto'>
          <div className='flex justify-center'>
            <div
              className='w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden'
              style={{
                border: '2px dashed rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.04)',
              }}
            >
              {preview ? (
                <img src={preview} className='w-full h-full object-cover' alt='preview' />
              ) : (
                <span className='text-xs' style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Sin imagen
                </span>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='md:col-span-2'>
              <label className='dbe-label'>Nombre del restaurante</label>
              <input
                {...register('name', {
                  required: 'El nombre es obligatorio',
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                })}
                type='text'
                placeholder='La Trattoria'
                className='dbe-input-dark w-full px-3 py-2 text-sm'
              />
              {errors.name && <p className='dbe-error'>{errors.name.message}</p>}
            </div>

            <div>
              <label className='dbe-label'>Categoría</label>
              <select
                {...register('category', { required: 'La categoría es obligatoria' })}
                className='dbe-input-dark w-full px-3 py-2 text-sm cursor-pointer'
              >
                <option value='' style={{ background: '#1a1a2e' }}>
                  Seleccione una categoría
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value} style={{ background: '#1a1a2e' }}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className='dbe-error'>{errors.category.message}</p>}
            </div>

            <div>
              <label className='dbe-label'>Capacidad (personas)</label>
              <input
                {...register('capacity', {
                  required: 'La capacidad es obligatoria',
                  min: { value: 20, message: 'Mínimo 20 personas' },
                  max: { value: 500, message: 'Máximo 500 personas' },
                })}
                type='number'
                placeholder='50'
                className='dbe-input-dark w-full px-3 py-2 text-sm'
              />
              {errors.capacity && <p className='dbe-error'>{errors.capacity.message}</p>}
            </div>

            <div className='md:col-span-2'>
              <label className='dbe-label'>Dirección</label>
              <input
                {...register('address', {
                  required: 'La dirección es obligatoria',
                  maxLength: { value: 150, message: 'Máximo 150 caracteres' },
                })}
                type='text'
                placeholder='6a Avenida 3-45, Zona 1, Ciudad de Guatemala'
                className='dbe-input-dark w-full px-3 py-2 text-sm'
              />
              {errors.address && <p className='dbe-error'>{errors.address.message}</p>}
            </div>

            <div>
              <label className='dbe-label'>Teléfono</label>
              <input
                {...register('phone', {
                  required: 'El teléfono es obligatorio',
                  pattern: { value: /^\d{8}$/, message: 'Debe ser de 8 dígitos' },
                })}
                type='tel'
                inputMode='numeric'
                maxLength={8}
                placeholder='22345678'
                className='dbe-input-dark w-full px-3 py-2 text-sm'
              />
              {errors.phone && <p className='dbe-error'>{errors.phone.message}</p>}
            </div>

            <div>
              <label className='dbe-label'>Nombre del encargado</label>
              <input
                {...register('managerName', {
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' },
                })}
                type='text'
                placeholder='Carlos Méndez'
                className='dbe-input-dark w-full px-3 py-2 text-sm'
              />
              {errors.managerName && <p className='dbe-error'>{errors.managerName.message}</p>}
            </div>

            <div>
              <label className='dbe-label'>Hora de apertura</label>
              <input
                {...register('businessHoursOpen')}
                type='time'
                className='dbe-input-dark w-full px-3 py-2 text-sm'
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label className='dbe-label'>Hora de cierre</label>
              <input
                {...register('businessHoursClose', {
                  validate: (value) =>
                    !businessHoursOpen || !value || value > businessHoursOpen ||
                    'El cierre debe ser posterior a la apertura',
                })}
                type='time'
                className='dbe-input-dark w-full px-3 py-2 text-sm'
                style={{ colorScheme: 'dark' }}
              />
              {errors.businessHoursClose && (
                <p className='dbe-error'>{errors.businessHoursClose.message}</p>
              )}
            </div>

            <div className='md:col-span-2'>
              <label className='dbe-label'>Correo de contacto</label>
              <input
                {...register('contactEmail', {
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
                })}
                type='email'
                placeholder='contacto@restaurante.com'
                className='dbe-input-dark w-full px-3 py-2 text-sm'
              />
              {errors.contactEmail && <p className='dbe-error'>{errors.contactEmail.message}</p>}
            </div>

            <div className='md:col-span-2'>
              <label className='dbe-label'>Foto del restaurante</label>
              <input
                {...register('photo')}
                type='file'
                accept='image/*'
                className='dbe-input-dark w-full px-3 py-2 text-sm cursor-pointer'
              />
            </div>
          </div>

          {error && (
            <p className='text-sm text-center' style={{ color: '#f87171' }}>
              {error}
            </p>
          )}

          <div
            className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4'
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              type='button'
              onClick={() => {
                reset();
                setPreview(null);
                onClose();
              }}
              className='w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium transition'
              style={{
                background: 'rgba(255,255,255,0.07)',
                color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='dbe-btn-primary w-full sm:w-auto px-5 py-2'
            >
              {loading ? <Spinner small /> : restaurant ? 'Guardar cambios' : 'Crear restaurante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};