import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import logo from '../../../assets/img/DebuggersEats_logo.png';

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const handleFinish = useCallback(() => {
    setTimeout(() => navigate('/'), 2000);
  }, [navigate]);

  const { status, message } = useVerifyEmail(token, handleFinish);

  const displayMessage = status === 'loading' ? 'Verificando correo, por favor espera...' : message;

  return (
    <div
      className='flex flex-col justify-center items-center h-screen px-4'
      style={{ background: '#0B0B0D' }}
    >
      <img src={logo} alt='DebuggersEats' className='w-28 h-28 object-contain mb-4' />
      <p
        className='text-lg font-semibold text-center max-w-lg'
        style={{ color: '#fff' }}
        aria-live='polite'
      >
        {displayMessage}
      </p>
    </div>
  );
};
