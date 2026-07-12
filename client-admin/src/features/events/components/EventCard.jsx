import { formatDate } from '../../../shared/utils/formatters.js';

const TYPE_META = {
  event: {
    label: 'Evento',
    bg: 'rgba(147,98,217,0.2)',
    color: '#9362D9',
    border: 'rgba(147,98,217,0.4)',
  },
  promotion: {
    label: 'Promoción',
    bg: 'rgba(195,91,185,0.2)',
    color: '#C35BB9',
    border: 'rgba(195,91,185,0.4)',
  },
  coupon: {
    label: 'Cupón',
    bg: 'rgba(242,80,156,0.2)',
    color: '#F2509C',
    border: 'rgba(242,80,156,0.4)',
  },
};

const STATUS_META = {
  active: { label: 'Activo', color: '#4ade80', dot: true },
  draft: { label: 'Borrador', color: '#fbbf24', dot: false },
  paused: { label: 'Pausado', color: '#fb923c', dot: false },
  expired: { label: 'Expirado', color: '#f87171', dot: false },
  cancelled: { label: 'Cancelado', color: '#f87171', dot: false },
};

const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const fmtTime = (slot) => (slot ? `${slot.from}–${slot.to}` : '');

const daysLabel = (daysArr) => {
  if (!daysArr || daysArr.length === 0) return null;
  return daysArr.map((d) => DAYS[d]).join(', ');
};

const RECURRENCE_LABEL = {
  none: null,
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

export const EventCard = ({ event, onEdit, onDelete, isResAdmin }) => {
  const type = TYPE_META[event.type] || TYPE_META.event;
  const status = STATUS_META[event.status] || STATUS_META.draft;

  const schedule = event.schedule || {};
  const recLabel = RECURRENCE_LABEL[schedule.recurrence];
  const dLabel = daysLabel(schedule.days_of_week);
  const timeSlot = schedule.time_slots?.[0];

  const hasCap = event.max_capacity > 0;
  const capPct = hasCap
    ? Math.min(100, Math.round((event.current_capacity / event.max_capacity) * 100))
    : null;

  const hasUsos = event.max_usos > 0;
  const usosPct = hasUsos
    ? Math.min(100, Math.round((event.usos_actuales / event.max_usos) * 100))
    : null;

  return (
    <div
      style={{
        background: '#111118',
        border: `1px solid ${type.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'transform 0.18s, box-shadow 0.18s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header: badge tipo + estado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            background: type.bg,
            color: type.color,
            border: `1px solid ${type.border}`,
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: 20,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {type.label}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: status.color }}>
          {status.dot && (
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: status.color, display: 'inline-block' }} />
          )}
          {status.label}
        </span>
      </div>

      {/* Nombre y descripción */}
      <div>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0, lineHeight: 1.3 }}>
          {event.name}
        </h3>
        {event.description && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '4px 0 0', lineHeight: 1.5 }}>
            {event.description}
          </p>
        )}
      </div>

      {/* Fechas y horario */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
          {formatDate(schedule.start_date)} — {formatDate(schedule.end_date)}
        </span>
        {(recLabel || dLabel || timeSlot) && (
          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
            {[recLabel, dLabel, timeSlot && fmtTime(timeSlot)].filter(Boolean).join(' · ')}
          </span>
        )}
      </div>

      {/* Visibilidad y tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {event.visibility && (
          <span style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', fontSize: 11, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)' }}>
            {event.visibility === 'public' ? 'Público' : event.visibility === 'private' ? 'Privado' : 'Solo socios'}
          </span>
        )}
        {event.tags?.slice(0, 3).map((tag) => (
          <span key={tag} style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', fontSize: 11, padding: '2px 8px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
            #{tag}
          </span>
        ))}
      </div>

      {/* Barra capacidad */}
      {hasCap && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            <span>{event.current_capacity}/{event.max_capacity}</span>
            <span>{capPct}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
            <div style={{ width: `${capPct}%`, height: '100%', background: capPct >= 90 ? '#f87171' : capPct >= 60 ? '#C35BB9' : '#9362D9', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {/* Barra usos */}
      {hasUsos && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>
            <span>{event.usos_actuales} usos</span>
            <span>Máx. {event.max_usos}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
            <div style={{ width: `${usosPct}%`, height: '100%', background: 'var(--dbe-gradient-h)', borderRadius: 4, transition: 'width 0.4s ease' }} />
          </div>
        </div>
      )}

      {!hasCap && !hasUsos && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
          {event.usos_actuales !== undefined ? `${event.usos_actuales} usos · Sin límite` : 'Sin límite de capacidad'}
        </p>
      )}

      {/* Acciones */}
      {isResAdmin && (
        <div style={{ display: 'flex', gap: 8, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
          <button
            onClick={() => onEdit(event)}
            className='transition'
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(event._id)}
            className='transition'
            style={{ flex: 1, background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '6px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
};