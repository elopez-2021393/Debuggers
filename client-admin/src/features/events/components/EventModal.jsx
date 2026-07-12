import { useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';

const DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
];

const INIT = {
  name: '',
  description: '',
  type: 'event',
  status: 'draft',
  schedule: {
    start_date: '',
    end_date: '',
    recurrence: 'none',
    days_of_week: [],
    time_slots: [{ from: '', to: '' }],
  },
  visibility: 'public',
  max_capacity: '',
  max_usos: '',
  tags: '',
};

// Los inputs de fecha/time/select necesitan colorScheme dark que dbe-input no incluye
const extraSx = { colorScheme: 'dark', boxSizing: 'border-box' };

export const EventModal = ({ event, onSave, onClose, saving }) => {
  const user = useAuthStore((s) => s.user);
  const isEdit = Boolean(event?._id);

  const [form, setForm] = useState(() => {
    if (!event) return { ...INIT };
    return {
      name: event.name || '',
      description: event.description || '',
      type: event.type || 'event',
      status: event.status || 'draft',
      restaurant_id: event.restaurant_id?._id || event.restaurant_id || '',
      schedule: {
        start_date: event.schedule?.start_date ? event.schedule.start_date.slice(0, 10) : '',
        end_date: event.schedule?.end_date ? event.schedule.end_date.slice(0, 10) : '',
        recurrence: event.schedule?.recurrence || 'none',
        days_of_week: event.schedule?.days_of_week || [],
        time_slots: event.schedule?.time_slots?.length
          ? event.schedule.time_slots
          : [{ from: '', to: '' }],
      },
      visibility: event.visibility || 'public',
      max_capacity: event.max_capacity || '',
      max_usos: event.max_usos || '',
      tags: (event.tags || []).join(', '),
    };
  });

  const [error, setError] = useState('');

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setSched = (key, val) =>
    setForm((f) => ({ ...f, schedule: { ...f.schedule, [key]: val } }));

  const toggleDay = (d) => {
    setSched(
      'days_of_week',
      form.schedule.days_of_week.includes(d)
        ? form.schedule.days_of_week.filter((x) => x !== d)
        : [...form.schedule.days_of_week, d].sort()
    );
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.name.trim()) return setError('El nombre es requerido.');
    if (!form.schedule.start_date || !form.schedule.end_date)
      return setError('Las fechas son requeridas.');

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      status: form.status,
      restaurant_id: user?.restaurantId,
      schedule: {
        start_date: form.schedule.start_date,
        end_date: form.schedule.end_date,
        recurrence: form.schedule.recurrence,
        days_of_week: form.schedule.days_of_week,
        time_slots: form.schedule.time_slots.filter((s) => s.from && s.to),
      },
      visibility: form.visibility,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    if (form.max_capacity) payload.max_capacity = Number(form.max_capacity);
    if (form.max_usos) payload.max_usos = Number(form.max_usos);

    const res = await onSave(payload, isEdit ? event._id : null);
    if (res && !res.success) setError(res.error || 'Error al guardar');
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: '28px 28px', scrollbarWidth: 'thin' }}
      >
        {/* Encabezado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0 }}>
            {isEdit ? 'Editar evento' : 'Nuevo evento gastronómico'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {/* Información básica */}
        <Section title='Información básica'>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label className='dbe-label mb-1'>Nombre <span style={{ color: 'var(--dbe-pink)' }}>*</span></label>
              <input
                className='dbe-input w-full px-3 py-2 text-sm'
                style={extraSx}
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder='Ej. Noche de tapas españolas'
              />
            </div>
            <div>
              <label className='dbe-label mb-1'>Tipo <span style={{ color: 'var(--dbe-pink)' }}>*</span></label>
              <select className='dbe-input w-full px-3 py-2 text-sm' style={extraSx} value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value='event'>Evento</option>
                <option value='promotion'>Promoción</option>
                <option value='coupon'>Cupón</option>
              </select>
            </div>
            <div>
              <label className='dbe-label mb-1'>Estado</label>
              <select className='dbe-input w-full px-3 py-2 text-sm' style={extraSx} value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value='draft'>Borrador</option>
                <option value='active'>Activo</option>
                <option value='paused'>Pausado</option>
                <option value='expired'>Expirado</option>
                <option value='cancelled'>Cancelado</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label className='dbe-label mb-1'>Descripción</label>
              <textarea
                className='dbe-input w-full px-3 py-2 text-sm'
                style={{ ...extraSx, resize: 'vertical', minHeight: 72 }}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder='Descripción breve del evento...'
              />
            </div>
          </div>
        </Section>

        {/* Horario */}
        <Section title='Horario'>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className='dbe-label mb-1'>Fecha inicio <span style={{ color: 'var(--dbe-pink)' }}>*</span></label>
              <input type='date' className='dbe-input w-full px-3 py-2 text-sm' style={extraSx} value={form.schedule.start_date} onChange={(e) => setSched('start_date', e.target.value)} />
            </div>
            <div>
              <label className='dbe-label mb-1'>Fecha fin <span style={{ color: 'var(--dbe-pink)' }}>*</span></label>
              <input type='date' className='dbe-input w-full px-3 py-2 text-sm' style={extraSx} value={form.schedule.end_date} onChange={(e) => setSched('end_date', e.target.value)} />
            </div>
            <div>
              <label className='dbe-label mb-1'>Recurrencia</label>
              <select className='dbe-input w-full px-3 py-2 text-sm' style={extraSx} value={form.schedule.recurrence} onChange={(e) => setSched('recurrence', e.target.value)}>
                <option value='none'>Sin recurrencia</option>
                <option value='daily'>Diario</option>
                <option value='weekly'>Semanal</option>
                <option value='monthly'>Mensual</option>
              </select>
            </div>
            <div>
              <label className='dbe-label mb-1'>Horario (primer slot)</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input
                  type='time'
                  className='dbe-input px-3 py-2 text-sm'
                  style={{ ...extraSx, flex: 1 }}
                  value={form.schedule.time_slots[0]?.from || ''}
                  onChange={(e) => {
                    const slots = [...form.schedule.time_slots];
                    slots[0] = { ...slots[0], from: e.target.value };
                    setSched('time_slots', slots);
                  }}
                />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>a</span>
                <input
                  type='time'
                  className='dbe-input px-3 py-2 text-sm'
                  style={{ ...extraSx, flex: 1 }}
                  value={form.schedule.time_slots[0]?.to || ''}
                  onChange={(e) => {
                    const slots = [...form.schedule.time_slots];
                    slots[0] = { ...slots[0], to: e.target.value };
                    setSched('time_slots', slots);
                  }}
                />
              </div>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label className='dbe-label mb-1'>Días de la semana</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DAYS.map((d) => {
                  const sel = form.schedule.days_of_week.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      onClick={() => toggleDay(d.value)}
                      style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        border: sel ? '1px solid var(--dbe-purple-pink)' : '1px solid rgba(255,255,255,0.1)',
                        background: sel ? 'rgba(195,91,185,0.2)' : 'rgba(255,255,255,0.04)',
                        color: sel ? 'var(--dbe-purple-pink)' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Section>

        {/* Capacidad y uso */}
        <Section title='Capacidad y uso'>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className='dbe-label mb-1'>Capacidad máxima</label>
              <input type='number' min='1' className='dbe-input w-full px-3 py-2 text-sm' style={extraSx} placeholder='Sin límite' value={form.max_capacity} onChange={(e) => set('max_capacity', e.target.value)} />
            </div>
            <div>
              <label className='dbe-label mb-1'>Máx. usos (cupón/promo)</label>
              <input type='number' min='1' className='dbe-input w-full px-3 py-2 text-sm' style={extraSx} placeholder='Sin límite' value={form.max_usos} onChange={(e) => set('max_usos', e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Visibilidad y tags */}
        <Section title='Visibilidad y etiquetas'>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className='dbe-label mb-1'>Visibilidad</label>
              <select className='dbe-input w-full px-3 py-2 text-sm' style={extraSx} value={form.visibility} onChange={(e) => set('visibility', e.target.value)}>
                <option value='public'>Público</option>
                <option value='private'>Privado</option>
                <option value='members_only'>Solo socios</option>
              </select>
            </div>
            <div>
              <label className='dbe-label mb-1'>Tags (separados por coma)</label>
              <input className='dbe-input w-full px-3 py-2 text-sm' style={extraSx} placeholder='tapas, vino, 2x1' value={form.tags} onChange={(e) => set('tags', e.target.value)} />
            </div>
          </div>
        </Section>

        {/* Error */}
        {error && (
          <p className='dbe-error' style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '8px 12px', margin: '0 0 16px', fontSize: 13 }}>
            {error}
          </p>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className='dbe-btn-primary'
            style={{ padding: '9px 24px', fontSize: 13, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', margin: '0 0 12px' }}>
      {title}
    </p>
    {children}
  </div>
);