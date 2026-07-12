import { useUIStore } from '../store/uiStore';

export const UiConfirmHost = () => {
  const confirm = useUIStore((s) => s.confirm);
  const closeConfirm = useUIStore((s) => s.closeConfirm);

  if (!confirm) return null;

  const handleCancel = () => {
    confirm.onCancel?.();
    closeConfirm();
  };

  const handleConfirm = async () => {
    try {
      await Promise.resolve(confirm.onConfirm?.());
    } finally {
      closeConfirm();
    }
  };

  return (
    <div
      className='fixed inset-0 z-[100] flex items-center justify-center px-4'
      style={{ background: 'rgba(11,11,13,0.8)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className='w-full max-w-md rounded-2xl p-6 text-center shadow-2xl border'
        style={{ background: '#16161f', borderColor: 'rgba(242,80,156,0.2)' }}
        role='dialog'
        aria-modal='true'
      >
        <h2 className='text-xl font-bold text-white mb-2'>{confirm.title}</h2>
        <p className='text-sm mb-6' style={{ color: '#a0a0b0' }}>
          {confirm.message}
        </p>
        <div className='flex justify-center gap-3'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-5 py-2 rounded-lg font-medium text-sm transition'
            style={{ background: '#2a2a3a', color: '#ccc' }}
          >
            Cancelar
          </button>
          <button
            type='button'
            onClick={() => void handleConfirm()}
            className='px-5 py-2 rounded-lg font-medium text-sm text-white transition'
            style={{ background: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)' }}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
