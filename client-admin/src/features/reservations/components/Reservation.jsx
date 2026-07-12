import { useEffect, useState } from 'react';
import { useReservationStore } from '../store/reservationStore.js';
import { useRestaurantStore } from '../../restaurants/store/restaurantStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { ReservationCard } from './ReservationCard.jsx';
import { ReservationModal } from './ReservationModal.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Todas' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'CONFIRMADA', label: 'Confirmadas' },
  { value: 'CANCELADA', label: 'Canceladas' },
  { value: 'FINALIZADA', label: 'Finalizadas' },
];

const STATUS_COLORS = {
  PENDIENTE: '#fbbf24',
  CONFIRMADA: '#4ade80',
  CANCELADA: '#f87171',
  FINALIZADA: 'rgba(255,255,255,0.3)',
};

export const Reservations = () => {
  const {
    reservations,
    loading,
    fetchMyReservations,
    fetchByRestaurant,
    addReservation,
    editReservation,
    removeReservation,
    processToken,
  } = useReservationStore();
  const { restaurants, getRestaurants } = useRestaurantStore();
  const user = useAuthStore((s) => s.user);
  const { openConfirm } = useUIStore();

  const isResAdmin = user?.role === 'RES_ADMIN_ROLE';

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [restaurantFilter, setRestaurantFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isResAdmin) getRestaurants();
  }, []);

  useEffect(() => {
    if (isResAdmin) return;
    fetchMyReservations();
  }, []);

  useEffect(() => {
    if (!isResAdmin || restaurants.length === 0) return;

    const myRestaurant = restaurants.find((r) => r._id === user?.restaurantId) ?? restaurants[0];

    setRestaurantFilter(myRestaurant._id);
    fetchByRestaurant(myRestaurant.name);
  }, [restaurants]);

  const handleRestaurantFilterChange = async (val) => {
    setRestaurantFilter(val);
    if (val === 'ALL') {
      fetchMyReservations();
    } else {
      const rest = restaurants.find((r) => r._id === val);
      if (rest) {
        await fetchByRestaurant(rest.name, {
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
          ...(dateFilter && { date: dateFilter }),
        });
      }
    }
  };

  const filtered = reservations.filter((r) => {
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchRest =
      restaurantFilter === 'ALL' ||
      restaurants.find((res) => res._id === restaurantFilter)?.name === r.restaurantName;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || r.peopleName?.toLowerCase().includes(q) || r.restaurantName?.toLowerCase().includes(q);

    const matchDate = !dateFilter || (() => {
      if (!r.reservationDate) return false;
      const d = new Date(r.reservationDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}` === dateFilter;
    })();

    return matchStatus && matchRest && matchSearch && matchDate;
  });

  const counts = reservations.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const handleEdit = (r) => {
    setSelected(r);
    setModal(true);
  };
  const handleClose = () => {
    setModal(false);
    setSelected(null);
  };

  const handleSave = async (payload, id) => {
    setSaving(true);
    const res = id ? await editReservation(id, payload) : await addReservation(payload);
    setSaving(false);
    if (res.success) {
      if (id) showSuccess('Reservación actualizada');
      handleClose();
      if (isResAdmin && restaurantFilter !== 'ALL') {
        const rest = restaurants.find((r) => r._id === restaurantFilter);
        if (rest) fetchByRestaurant(rest.name);
      } else if (!isResAdmin) {
        fetchMyReservations();
      }
    } else {
      showError(res.error || 'Error al guardar');
    }
    return res;
  };

  const handleDelete = (id) => {
    openConfirm({
      title: '¿Eliminar reservación?',
      message: 'Esta acción es permanente.',
      onConfirm: async () => {
        const res = await removeReservation(id);
        res.success ? showSuccess('Reservación eliminada') : showError(res.error);
      },
    });
  };

  const handleConfirmToken = (reservation, action) => {
    if (!reservation.confirmationToken)
      return showError('Esta reservación no tiene token disponible.');
    openConfirm({
      message: `¿${action === 'CONFIRMAR' ? 'Confirmar' : 'Cancelar'} esta reservación?`,
      onConfirm: async () => {
        const res = await processToken(reservation.confirmationToken, action);
        if (res.success) {
          showSuccess(action === 'CONFIRMAR' ? 'Reservación confirmada' : 'Reservación cancelada');
          const rest = restaurants.find((r) => r._id === restaurantFilter);
          if (rest) fetchByRestaurant(rest.name);
        } else {
          showError(res.error);
        }
      },
    });
  };

  if (loading && reservations.length === 0) return <Spinner />;

  return (
    <div style={{ padding: '24px 20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 26, margin: 0 }}>Reservaciones</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '4px 0 0' }}>
            {reservations.length} reservación{reservations.length !== 1 ? 'es' : ''} en total
          </p>
        </div>

        {!isResAdmin && (
          <button
            onClick={() => setModal(true)}
            className='dbe-btn-primary'
            style={{ fontSize: 13, borderRadius: 10, padding: '9px 20px' }}
          >
            + Nueva reservación
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA'].map((s) => (
          <div
            key={s}
            style={{
              background: '#111118',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10,
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minWidth: 100,
            }}
          >
            <span style={{ fontSize: 20, fontWeight: 800, color: STATUS_COLORS[s] }}>
              {counts[s] || 0}
            </span>
            <span
              style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'capitalize' }}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 20,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  border: active ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  background: active
                    ? 'var(--dbe-gradient-h)' : 'rgba(255,255,255,0.05)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <input
          type='date'
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#fff',
            fontSize: 12,
            outline: 'none',
            colorScheme: 'dark',
          }}
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter('')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 16 }}>
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 14,
            border: '1px dashed rgba(255,255,255,0.08)',
          }}
        >
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>📋</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            {reservations.length === 0
              ? 'No hay reservaciones aún.'
              : 'Sin resultados para los filtros seleccionados.'}
          </p>
          {reservations.length === 0 && !isResAdmin && (
            <button
              onClick={() => setModal(true)}
              className='dbe-btn-primary'
              style={{ marginTop: 16, fontSize: 13, borderRadius: 10, padding: '9px 20px' }}
            >
              + Crear primera reservación
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18
        }}>
          {filtered.map((r) => (
            <ReservationCard
              key={r._id}
              reservation={r}
              isResAdmin={isResAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onConfirmToken={handleConfirmToken}
            />
          ))}
        </div>
      )}

      {modal && (
        <ReservationModal
          reservation={selected}
          restaurants={restaurants}
          onSave={handleSave}
          onClose={handleClose}
          saving={saving}
        />
      )}
    </div>
  );
};
