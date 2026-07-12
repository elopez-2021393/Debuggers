import { Toaster } from 'react-hot-toast';
import { AppRoutes } from './routes/AppRoutes.jsx';
import { UiConfirmHost } from '../features/auth/components/ConfirmModal.jsx';

export const App = () => {
  return (
    <>
      <Toaster
        position='top-center'
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            fontWeight: '600',
            fontSize: '0.95rem',
            borderRadius: '8px',
          },
        }}
      />
      <UiConfirmHost />
      <AppRoutes />
    </>
  );
};
