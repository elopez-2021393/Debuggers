import { useEffect, useState } from 'react';
import { useEventStore } from '../store/eventStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { EventCard } from './EventCard.jsx';
import { EventModal } from './EventModal.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

const TYPE_FILTERS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'event', label: 'Eventos' },
  { value: 'promotion', label: 'Promociones' },
  { value: 'coupon', label: 'Cupones' },
];

export const Events = () => {
  const { events, loading, fetchByRestaurant, addEvent, editEvent, removeEvent } = useEventStore();
  const user = useAuthStore((s) => s.user);
  const { openConfirm } = useUIStore();

  const isResAdmin = user?.role === 'RES_ADMIN_ROLE';
  const restaurantId = user?.restaurantId;

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurantId) fetchByRestaurant(restaurantId);
  }, [restaurantId, fetchByRestaurant]);

  const filtered = events.filter((ev) => {
    const matchType = typeFilter === 'ALL' || ev.type === typeFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || ev.name?.toLowerCase().includes(q) || ev.description?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const handleEdit = (event) => {
    setSelected(event);
    setModal(true);
  };
  
  const handleClose = () => {
    setModal(false);
    setSelected(null);
  };

  const handleSave = async (payload, id) => {
    setSaving(true);
    const res = id ? await editEvent(id, payload) : await addEvent(payload);
    setSaving(false);
    if (res.success) {
      showSuccess(id ? 'Evento actualizado' : 'Evento creado');
      handleClose();
      fetchByRestaurant(restaurantId);
    } else {
      showError(res.error || 'Error al guardar');
    }
    return res;
  };

  const handleDelete = (id) => {
    openConfirm({
      title: '¿Eliminar evento?',
      message: 'Esta acción es permanente y no se puede deshacer.',
      onConfirm: async () => {
        const res = await removeEvent(id);
        res.success ? showSuccess('Evento eliminado') : showError(res.error);
      },
    });
  };

  if (loading && events.length === 0) return <Spinner />;

  return (
    <div style={{ padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 26, margin: 0 }}>Eventos Gastronómicos</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '4px 0 0' }}>Noches especiales, promociones y cupones</p>
        </div>
        {isResAdmin && (
          <button
            onClick={() => { setSelected(null); setModal(true); }}
            className='dbe-btn-primary'
            style={{ fontSize: 13, padding: '9px 20px', borderRadius: 10 }}
          >
            + Nuevo evento
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {TYPE_FILTERS.map((f) => {
            const active = typeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer',
                  border: active ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  background: active ? 'var(--dbe-gradient-h)' : 'rgba(255,255,255,0.05)',
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscar evento...'
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 13, outline: 'none', minWidth: 180 }}
        />
      </div>

      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 16 }}>
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Contenido */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 32, margin: '0 0 8px' }}>🎉</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>
            {events.length === 0 ? 'No hay eventos registrados aún.' : 'Sin resultados para los filtros seleccionados.'}
          </p>
          {isResAdmin && events.length === 0 && (
            <button
              onClick={() => setModal(true)}
              className='dbe-btn-primary'
              style={{ marginTop: 16, fontSize: 13, padding: '9px 20px', borderRadius: 10 }}
            >
              + Crear primer evento
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
          {filtered.map((ev) => (
            <EventCard key={ev._id} event={ev} isResAdmin={isResAdmin} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal && <EventModal event={selected} onSave={handleSave} onClose={handleClose} saving={saving} />}
    </div>
  );
};