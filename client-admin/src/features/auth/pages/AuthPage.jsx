import { useState } from 'react';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import logoImg from '../../../assets/img/DebuggersEats_logo.png';

export const AuthPage = () => {
  const [isForgot, setIsForgot] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const getTitle = () => {
    if (isForgot) return { title: 'Recuperar contraseña', subtitle: 'Te enviaremos un correo' };
    if (isRegister) return { title: 'Crear cuenta', subtitle: 'Regístrate para continuar' };
    return { title: 'DebuggersEats', subtitle: 'Bienvenido de vuelta' };
  };

  const { title, subtitle } = getTitle();

  return (
    <div
      className='min-h-screen flex items-center justify-center p-4'
      style={{ background: '#0B0B0D' }}
    >
      <div
        className='w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl'
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className='flex flex-col items-center justify-center py-8 px-6'
          style={{ background: 'linear-gradient(135deg, #F2509C 0%, #C35BB9 50%, #9362D9 100%)' }}
        >
          <img src={logoImg} alt='DebuggersEats' className='w-24 h-24 object-contain' />
          <h1 className='text-white font-bold text-xl tracking-tight'>{title}</h1>
          <p className='text-white text-xs mt-0.5' style={{ opacity: 0.75 }}>
            {subtitle}
          </p>
        </div>

        <div className='pt-5'>
          {isForgot ? (
            <ForgotPassword onSwitch={() => setIsForgot(false)} />
          ) : isRegister ? (
            <RegisterForm onSwitch={() => setIsRegister(false)} />
          ) : (
            <LoginForm onForgot={() => setIsForgot(true)} onRegister={() => setIsRegister(true)} />
          )}
        </div>
      </div>
    </div>
  );
};
