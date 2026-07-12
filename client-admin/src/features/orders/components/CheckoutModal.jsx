import { useForm } from 'react-hook-form';
import { useCart } from '../hooks/useCart.js';
import { useOrders } from '../hooks/useOrders.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { ADDRESS_TYPE, PAYMENT_TYPE } from '../constants/order.constans.js';

const inputClass =
    'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm ' +
    'outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-white/20';

const labelClass =
    'text-xs font-semibold text-white/50 uppercase tracking-wider mb-1 block';

const errorClass = 'text-xs text-pink-400 mt-1';

export const CheckoutModal = ({ isOpen, onClose, onSuccess }) => {
    const { cart } = useCart();
    const { confirmOrder, loading } = useOrders();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            direccion: {
                tipo: ADDRESS_TYPE.CASA,
                descripcion: '',
                referencias: '',
            },
            tipoPago: PAYMENT_TYPE.EFECTIVO,
            telefono: '',
            notas: '',
        },
    });

    if (!isOpen) return null;

    const handleClose = () => {
        reset();
        onClose();
    };

    const onSubmit = async (data) => {
        const body = {
            direccion: data.direccion,
            telefono: data.telefono,
            tipoPago: data.tipoPago,
            notas: data.notas || '',
        };

        const result = await confirmOrder(body);
        if (result.ok) {
            reset();
            onSuccess?.();
        }
    };

    return (
        <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-3 sm:px-4'>
            <div className='w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl overflow-hidden bg-[#111118] border border-white/10 shadow-2xl'>
                <div className='px-5 py-4 bg-gradient-to-r from-pink-500 to-purple-500 shrink-0'>
                    <h2 className='text-xl font-bold text-white'>Confirmar pedido</h2>
                    <p className='text-xs text-white/80 mt-0.5'>
                        Total: Q{cart?.total?.toFixed(2)}
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className='flex-1 overflow-y-auto p-5 space-y-5'
                >

                    <fieldset className='space-y-3'>
                        <legend className='text-sm font-semibold text-white/70 mb-2'>
                            Dirección de entrega
                        </legend>

                        <div>
                            <label className={labelClass}>Tipo</label>
                            <div className='flex gap-2'>
                                {Object.values(ADDRESS_TYPE).map((tipo) => (
                                    <label key={tipo} className='flex-1 cursor-pointer'>
                                        <input
                                            {...register('direccion.tipo')}
                                            type='radio'
                                            value={tipo}
                                            className='sr-only peer'
                                        />
                                        <span className='block text-center py-1.5 rounded-lg text-xs font-semibold border border-white/10 bg-white/5 text-white/40
                                    peer-checked:bg-pink-500/20 peer-checked:border-pink-500/50
                                    peer-checked:text-pink-400 transition'>
                                            {tipo}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Descripción *</label>
                            <textarea
                                {...register('direccion.descripcion', {
                                    required: 'La descripción de la dirección es obligatoria',
                                    minLength: { value: 5, message: 'Mínimo 5 caracteres' },
                                })}
                                rows={2}
                                placeholder='Zona 1, Av. Reforma 10-40, apto. 3B'
                                className={`${inputClass} resize-none`}
                            />
                            {errors.direccion?.descripcion && (
                                <p className={errorClass}>{errors.direccion?.descripcion?.message}</p>
                            )}
                        </div>

                        <div>
                            <label className={labelClass}>Referencias</label>
                            <input
                                {...register('direccion.referencias')}
                                placeholder='Casa color azul, frente al parque'
                                className={inputClass}
                            />
                        </div>
                    </fieldset>

                    <div>
                        <label className={labelClass}>Teléfono de contacto *</label>
                        <input
                            {...register('telefono', {
                                required: 'El teléfono es obligatorio',
                                pattern: {
                                    value: /^\d{8,15}$/,
                                    message: 'Ingresa un número válido (8-15 dígitos)',
                                },
                            })}
                            type='tel'
                            placeholder='42459699'
                            className={inputClass}
                        />
                        {errors.telefono && (
                            <p className={errorClass}>{errors.telefono.message}</p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Método de pago *</label>
                        <div className='flex gap-2'>
                            {Object.values(PAYMENT_TYPE).map((tipo) => (
                                <label key={tipo} className='flex-1 cursor-pointer'>
                                    <input
                                        {...register('tipoPago', { required: true })}
                                        type='radio'
                                        value={tipo}
                                        className='sr-only peer'
                                    />
                                    <span className='block text-center py-1.5 rounded-lg text-xs font-semibold
                                   border border-white/10 bg-white/5 text-white/40
                                   peer-checked:bg-pink-500/20 peer-checked:border-pink-500/50
                                   peer-checked:text-pink-400 transition'>
                                        {tipo === PAYMENT_TYPE.TARJETA ? 'Tarjeta' : 'Efectivo'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Notas para el restaurante</label>
                        <textarea
                            {...register('notas', {
                                maxLength: { value: 200, message: 'Máximo 200 caracteres' },
                            })}
                            rows={2}
                            placeholder='Sin picante, entregar en recepción...'
                            className={`${inputClass} resize-none`}
                        />
                        {errors.notas && (
                            <p className={errorClass}>{errors.notas.message}</p>
                        )}
                    </div>

                    <div className='rounded-xl bg-white/5 border border-white/10 p-4 space-y-1.5 text-sm'>
                        <p className='text-xs font-semibold text-white/50 uppercase tracking-wider mb-2'>
                            Resumen
                        </p>
                        {cart?.items?.map((item) => (
                            <div key={item.menuItemId} className='flex justify-between text-white/70'>
                                <span>
                                    {item.nombre}
                                    <span className='text-white/30 ml-1'>×{item.cantidad}</span>
                                </span>
                                <span>Q{item.subtotal.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className='border-t border-white/10 pt-2 mt-2 space-y-1'>
                            <div className='flex justify-between text-white/50 text-xs'>
                                <span>Subtotal</span>
                                <span>Q{cart?.subtotal?.toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between text-white/50 text-xs'>
                                <span>IVA (12%)</span>
                                <span>Q{cart?.iva?.toFixed(2)}</span>
                            </div>
                            <div className='flex justify-between text-white font-bold'>
                                <span>Total</span>
                                <span>Q{cart?.total?.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2
                          border-t border-white/10'>
                        <button
                            type='button'
                            onClick={handleClose}
                            className='px-4 py-2 rounded-lg text-sm bg-white/10 text-white/60
                         hover:bg-white/20 transition'
                        >
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='px-5 py-2 rounded-lg text-white font-medium transition
                         hover:opacity-90 disabled:opacity-60'
                            style={{ background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)' }}
                        >
                            {loading ? <Spinner small /> : 'Confirmar pedido'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};