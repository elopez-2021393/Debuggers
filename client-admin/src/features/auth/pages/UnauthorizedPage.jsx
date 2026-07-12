import { useNavigate } from 'react-router-dom';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  return (
    <div
      className='min-h-screen flex flex-col items-center justify-center gap-4'
      style={{ background: '#0B0B0D', color: '#fff' }}
    >
      <div className='text-center'>
        <h2 className='text-2xl font-bold mb-2' style={{ color: 'var(--dbe-pink)' }}>
          Acceso denegado
        </h2>
        <p className='text-sm' style={{ color: 'rgba(255,255,255,0.5)' }}>
          No tienes permisos para acceder a esta sección.
        </p>
      </div>
      <button
        onClick={() => navigate('/')}
        className='dbe-btn-primary px-5 py-2 text-sm'
      >
        Volver
      </button>
    </div>
  );
};