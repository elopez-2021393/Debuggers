import { useEffect, useState } from 'react';
import { useMenuStore } from '../store/menuStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { useSaveMenu } from '../hooks/useSaveMenu.js';
import { useCategoryFilter } from '../hooks/useCategoryFilter.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { MenuCard } from './MenuCard.jsx';
import { MenuModal } from './MenuModal.jsx';
import { MenuFilters } from './MenuFilters.jsx';
import { showError } from '../../../shared/utils/toast.js';

export const Menus = () => {
  const { menus, loading, error, getMenusByRestaurant, deleteMenu } = useMenuStore();
  const { saveMenu } = useSaveMenu();
  const { openConfirm } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'RES_ADMIN_ROLE';
  const restaurantId = user?.restaurantId;

  const [openModal, setOpenModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const { category, setCategory, search, setSearch, filtered } = useCategoryFilter(menus, [
    'name',
    'description',
  ]);

  useEffect(() => {
    if (restaurantId) getMenusByRestaurant(restaurantId);
  }, [restaurantId, getMenusByRestaurant]);

  useEffect(() => {
    if (error) showError(error);
  }, [error]);

  const handleSave = async (data, menuId) => {
    setSaving(true);
    const ok = await saveMenu(data, menuId);
    if (ok) getMenusByRestaurant(restaurantId);
    setSaving(false);
    return ok;
  };

  const handleDelete = (menu) =>
    openConfirm({
      title: 'Eliminar plato',
      message: `¿Eliminar "${menu.name}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        await deleteMenu(menu._id);
        getMenusByRestaurant(restaurantId);
      },
    });

  if (loading && menus.length === 0) return <Spinner />;

  return (
    <section className='p-4'>
      <header className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <hgroup>
          <h1 className='text-3xl font-bold text-white'>Menús</h1>
          <p className='text-sm text-white/50'>
            {menus.length} plato{menus.length !== 1 ? 's' : ''} registrado
            {menus.length !== 1 ? 's' : ''}
          </p>
        </hgroup>
        {isAdmin && (
          <button
            className='dbe-btn-primary px-4 py-2 rounded-lg text-sm font-semibold'
            onClick={() => {
              setSelected(null);
              setOpenModal(true);
            }}
          >
            Nuevo plato
          </button>
        )}
      </header>

      <MenuFilters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
      />

      {filtered.length === 0 ? (
        <p className='rounded-xl p-6 text-center text-sm text-white/30 bg-[#16161f] border border-white/[0.06]'>
          No hay platos para mostrar.
        </p>
      ) : (
        <ul className='grid sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 list-none p-0 m-0'>
          {filtered.map((menu) => (
            <li key={menu._id}>
              <MenuCard
                menu={menu}
                isAdmin={isAdmin}
                onEdit={(m) => {
                  setSelected(m);
                  setOpenModal(true);
                }}
                onDelete={handleDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <MenuModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelected(null);
        }}
        menu={selected}
        onSave={handleSave}
        loading={saving}
        restaurantId={restaurantId}
      />
    </section>
  );
};