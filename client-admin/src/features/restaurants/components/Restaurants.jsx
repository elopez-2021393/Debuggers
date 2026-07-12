import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/restaurantStore';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { RestaurantModal } from './RestaurantModal.jsx';
import { RestaurantFilters } from './RestaurantFilters.jsx';
import { RestaurantCard } from './RestaurantCard.jsx';
import { useUIStore } from '../../auth/store/uiStore.js';
import { showError } from '../../../shared/utils/toast.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useSaveRestaurant } from '../hooks/useSaveRestaurant.js';

export const Restaurants = ({ onSelectRestaurant }) => {
  const navigate = useNavigate();
  const { restaurants, loading, error, getRestaurants, deleteRestaurant } = useRestaurantStore();
  const { saveRestaurant } = useSaveRestaurant();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { openConfirm } = useUIStore();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN_ROLE';

  useEffect(() => {
    getRestaurants();
  }, []);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  const handleSave = async (formData, restaurantId) => {
    setSaving(true);
    const ok = await saveRestaurant(formData, restaurantId);
    setSaving(false);
    return ok;
  };

  if (loading && restaurants.length === 0 && !openModal) return <Spinner />;

  const filtered = restaurants.filter((r) => {
    const matchesCategory = filterCategory === 'ALL' || r.category === filterCategory;
    const q = search.trim().toLowerCase();
    return (
      matchesCategory &&
      (!q || r.name?.toLowerCase().includes(q) || r.address?.toLowerCase().includes(q))
    );
  });

  const handleVerMenu = (restaurantId) => {
    if (onSelectRestaurant) {
      onSelectRestaurant(restaurantId);
    } else {
      navigate(
        role === 'USER_ROLE'
          ? `/home/restaurantes/${restaurantId}/menu`
          : `/dashboard/restaurantes/${restaurantId}/menu`
      );
    }
  };

  const handleDelete = (restaurant) => {
    const hasAdmin = restaurant.assignedAdmin != null;

    openConfirm({
      title: 'Eliminar restaurante',
      message: hasAdmin
        ? `"${restaurant.name}" tiene un administrador asignado. Al eliminar el restaurante, ese usuario quedará sin restaurante. ¿Deseas continuar?`
        : `¿Eliminar "${restaurant.name}"? Esta acción no se puede deshacer.`,
      onConfirm: () => deleteRestaurant(restaurant._id),
    });
  };

  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Restaurantes</h1>
          <p className='text-sm' style={{ color: 'rgba(255,255,255,0.5)' }}>
            {restaurants.length} restaurante{restaurants.length !== 1 ? 's' : ''} registrado
            {restaurants.length !== 1 ? 's' : ''}
          </p>
        </div>
        {isAdmin && (
          <button
            className='dbe-btn-primary px-4 py-2 rounded-lg text-sm font-semibold'
            onClick={() => {
              setSelectedRestaurant(null);
              setOpenModal(true);
            }}
          >
            + Nuevo restaurante
          </button>
        )}
      </div>

      <RestaurantFilters
        search={search}
        onSearch={setSearch}
        filterCategory={filterCategory}
        onFilterCategory={setFilterCategory}
      />

      {filtered.length === 0 ? (
        <div
          className='rounded-xl p-6 text-center text-sm'
          style={{
            background: '#16161f',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          No hay restaurantes para mostrar.
        </div>
      ) : (
        <div className='grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
          {filtered.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
              isExpanded={expandedId === restaurant._id}
              onToggle={() =>
                setExpandedId(expandedId === restaurant._id ? null : restaurant._id)
              }
              onEdit={(r) => {
                setSelectedRestaurant(r);
                setOpenModal(true);
              }}
              onDelete={handleDelete}
              onVerMenu={handleVerMenu}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      <RestaurantModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedRestaurant(null);
        }}
        restaurant={selectedRestaurant}
        onSave={handleSave}
        loading={saving}
        error={error}
      />
    </div>
  );
};