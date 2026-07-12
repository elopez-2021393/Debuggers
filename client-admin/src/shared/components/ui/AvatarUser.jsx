import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';
import defaultAvatarImg from '../../../assets/img/userIconDBE.png';

export const AvatarUser = () => {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setOpen((prev) => !prev);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const avatarSrc = defaultAvatarImg;

  const roleLabel = {
    ADMIN_ROLE: 'Admin',
    RES_ADMIN_ROLE: 'Admin Restaurante',
    USER_ROLE: 'Usuario',
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={toggleMenu}
        className='flex items-center gap-2 rounded-full px-2 py-1 transition'
        style={{ background: 'rgba(242,80,156,0.08)' }}
      >
        <img
          src={avatarSrc}
          alt={user?.username}
          className='w-8 h-8 rounded-full object-cover'
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultAvatarImg;
          }}
        />
        <span className='text-sm font-medium hidden sm:block' style={{ color: '#fff' }}>
          {user?.username}
        </span>
      </button>

      {open && (
        <div
          className='absolute right-0 mt-2 w-52 rounded-xl shadow-2xl border z-50 animate-fadeIn overflow-hidden'
          style={{ background: '#16161f', borderColor: 'rgba(242,80,156,0.15)' }}
        >
          <div className='px-4 py-3' style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <p className='font-semibold text-sm text-white'>{user?.username}</p>
            <p className='text-xs truncate mt-0.5' style={{ color: 'rgba(255,255,255,0.4)' }}>
              {user?.email}
            </p>
            <span
              className='inline-block mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold'
              style={{ background: 'rgba(242,80,156,0.15)', color: '#F2509C' }}
            >
              {roleLabel[user?.role] || user?.role}
            </span>
          </div>

          <ul className='p-2 text-sm'>

            <li>
              <button
                onClick={handleLogout}
                className='block w-full text-left px-3 py-2 rounded-lg transition font-medium'
                style={{ color: '#F2509C' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(242,80,156,0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                Cerrar sesión
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
