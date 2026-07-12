import { useEffect, useState } from 'react';
import { useTableStore } from '../store/tableStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { TableCard } from './TableCard.jsx';
import { TableModal } from './TableModal.jsx';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

export const Tables = () => {
  const {
    tables,
    loading,
    fetchTables,
    addTable,
    editTable,
    toggleStatus,
    removeTable,
    clearTables,
  } = useTableStore();
  const user = useAuthStore((s) => s.user);
  const { openConfirm } = useUIStore();

  // El restaurantId viene directo del usuario autenticado
  const restaurantId = user?.restaurantId;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurantId) fetchTables(restaurantId);
    else clearTables();
  }, [restaurantId]);

  const filtered = tables.filter((t) => {
    const matchStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && t.isActive) ||
      (statusFilter === 'INACTIVE' && !t.isActive);
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || t.tableNumber?.toLowerCase().includes(q) || t.location?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const totalActive = tables.filter((t) => t.isActive).length;
  const totalInactive = tables.filter((t) => !t.isActive).length;

  const handleEdit = (table) => {
    setSelected(table);
    setModal(true);
  };
  const handleClose = () => {
    setModal(false);
    setSelected(null);
  };

  const handleSave = async (payload, id) => {
    setSaving(true);
    const res = id ? await editTable(id, payload) : await addTable(payload);
    setSaving(false);
    if (res.success) {
      showSuccess(id ? 'Mesa actualizada' : 'Mesa creada');
      handleClose();
    }
    return res;
  };

  const handleToggle = (tableId, isActive) => {
    openConfirm({
      message: `¿${isActive ? 'Inhabilitar' : 'Habilitar'} esta mesa?`,
      onConfirm: async () => {
        const res = await toggleStatus(tableId);
        if (res.success) showSuccess(res.isActive ? 'Mesa habilitada' : 'Mesa inhabilitada');
        else showError(res.error);
      },
    });
  };

  const handleDelete = (tableId) => {
    openConfirm({
      message: '¿Eliminar esta mesa? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        const res = await removeTable(tableId);
        if (res.success) showSuccess('Mesa eliminada');
        else showError(res.error);
      },
    });
  };

  return (
    <div style={{ padding: '24px 28px', minHeight: '100%' }}>
      {/* Encabezado */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 28,
        }}
      >
        <div>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 22, margin: 0 }}>Mesas</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: '4px 0 0' }}>
            Gestiona las mesas disponibles para reservaciones
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setModal(true); }}
          className='dbe-btn-primary'
          style={{ borderRadius: 10, padding: '10px 20px', fontSize: 13 }}
        >
          + Nueva mesa
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          {
            label: 'Total',
            value: tables.length,
            color: '#9362D9',
            bg: 'rgba(147,98,217,0.1)',
            border: 'rgba(147,98,217,0.2)',
          },
          {
            label: 'Activas',
            value: totalActive,
            color: '#4ade80',
            bg: 'rgba(74,222,128,0.07)',
            border: 'rgba(74,222,128,0.2)',
          },
          {
            label: 'Inactivas',
            value: totalInactive,
            color: '#f87171',
            bg: 'rgba(248,113,113,0.07)',
            border: 'rgba(248,113,113,0.2)',
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 10,
              padding: '10px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ color: s.color, fontWeight: 700, fontSize: 20 }}>{s.value}</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Búsqueda + filtro */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscar por número o ubicación...'
          style={{
            flex: 1,
            minWidth: 200,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '8px 14px',
            color: '#fff',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { value: 'ALL', label: 'Todas' },
            { value: 'ACTIVE', label: 'Activas' },
            { value: 'INACTIVE', label: 'Inactivas' },
          ].map((f) => {
            const active = statusFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: active ? '1px solid #9362D9' : '1px solid rgba(255,255,255,0.1)',
                  background: active ? 'rgba(147,98,217,0.15)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#9362D9' : 'rgba(255,255,255,0.5)',
                  fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  cursor: 'pointer',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: 14,
          }}
        >
          <p style={{ fontSize: 32, margin: '0 0 12px' }}>🪑</p>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: 16, margin: '0 0 6px' }}>
            {tables.length === 0 ? 'No hay mesas registradas' : 'No se encontraron mesas'}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
            {tables.length === 0
              ? 'Crea la primera mesa para habilitar las reservaciones'
              : 'Intenta con otros filtros'}
          </p>
          {tables.length === 0 && (
            <button
              onClick={() => { setSelected(null); setModal(true); }}
              className='dbe-btn-primary'
              style={{ marginTop: 20, borderRadius: 10, padding: '10px 24px', fontSize: 13 }}
            >
              + Crear primera mesa
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {filtered.map((table) => (
            <TableCard
              key={table._id}
              table={table}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {modal && (
        <TableModal
          table={selected}
          restaurantId={restaurantId}
          onSave={handleSave}
          onClose={handleClose}
          saving={saving}
        />
      )}
    </div>
  );
};
