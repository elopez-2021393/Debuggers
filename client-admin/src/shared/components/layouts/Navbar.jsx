import { Typography } from '@material-tailwind/react';
import { AvatarUser } from '../ui/AvatarUser.jsx';
import logoImg from '../../../assets/img/DebuggersEats_logo.png';

export const Navbar = ({ onMenuClick }) => {
  return (
    <nav
      className='sticky top-0 z-50 h-14 flex items-center px-4 md:px-6'
      style={{
        background: '#111118',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.4)',
      }}
    >
      <div className='max-w-7xl w-full mx-auto flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          {/* Hamburguesa solo en móvil */}
          <button
            onClick={onMenuClick}
            className='lg:hidden p-2 rounded-lg transition'
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
            aria-label='Abrir menú'
          >
            ☰
          </button>
          <img src={logoImg} alt='DebuggersEats' className='h-8 w-auto object-contain' />
          <Typography variant='h6' className='font-bold hidden sm:block' style={{ color: '#fff' }}>
            Debuggers<span style={{ color: '#F2509C' }}>Eats</span>
            <span
              className='ml-1.5 text-xs font-normal px-1.5 py-0.5 rounded'
              style={{ background: 'rgba(242,80,156,0.15)', color: '#C35BB9' }}
            >
              Admin
            </span>
          </Typography>
        </div>
        <AvatarUser />
      </div>
    </nav>
  );
};