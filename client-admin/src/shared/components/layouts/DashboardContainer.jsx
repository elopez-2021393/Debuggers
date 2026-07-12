import { useState } from 'react';
import { Navbar } from './Navbar.jsx';
import { Sidebar } from './Sidebar.jsx';

export const DashboardContainer = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen flex flex-col' style={{ background: '#0d0d14' }}>
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className='flex flex-1 relative'>
        {/* Overlay para móvil */}
        {sidebarOpen && (
          <div
            className='fixed inset-0 z-30 bg-black/60 lg:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className='flex-1 p-4 md:p-6 overflow-auto min-w-0'>{children}</main>
      </div>
    </div>
  );
};