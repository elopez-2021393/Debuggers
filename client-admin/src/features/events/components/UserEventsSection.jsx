import { useEffect, useState } from 'react';
import { useUserEventStore } from '../store/userEventStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { showSuccess, showError } from '../../../shared/utils/toast.js';
import { useRestaurantStore } from '../../restaurants/store/restaurantStore.js';
import { formatDate } from '../../../shared/utils/formatters.js';

const TYPE_CONFIG = {
  event: {
    label: 'Evento',
    emoji: '🎉',
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.12)',
    border: 'rgba(167,139,250,0.25)',
  },
  promotion: {
    label: 'Promoción',
    emoji: '🏷️',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.25)',
  },
  coupon: {
    label: 'Cupón',
    emoji: '🎟️',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.25)',
  },
};

const TYPE_FILTERS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'event', label: '🎉 Eventos' },
  { value: 'promotion', label: '🏷️ Promociones' },
  { value: 'coupon', label: '🎟️ Cupones' },
];

const cuposLabel = (ev) => {
  if (!ev.max_capacity) return null;
  const restantes = ev.max_capacity - (ev.current_capacity || 0);
  return restantes <= 0
    ? '¡Lleno!'
    : `${restantes} cupo${restantes !== 1 ? 's' : ''} disponible${restantes !== 1 ? 's' : ''}`;
};

// ── EventCard ──────────────────────────────────────────────────────────────
const EventCard = ({ event, userId, restaurants, onAction }) => {
  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.event;
  const [loading, setLoading] = useState(false);

  const restaurantName = (() => {
    if (event.restaurant_id?.name) return event.restaurant_id.name;
    const r = restaurants?.find((r) => r._id === (event.restaurant_id?._id || event.restaurant_id));
    return r?.name || 'Restaurante';
  })();

  const isInscrito = event.inscripciones?.some(
    (i) => (i.userId?._id || i.userId)?.toString() === userId
  );
  const yaUso = event.usos?.some((u) => (u.userId?._id || u.userId)?.toString() === userId);
  const [done, setDone] = useState(yaUso);

  useEffect(() => {
    setDone(yaUso);
  }, [yaUso]);

  const isFull =
    event.max_capacity && (event.current_capacity || 0) >= event.max_capacity && !isInscrito;
  const cupos = cuposLabel(event);

  const handleClick = async () => {
    setLoading(true);
    const result = await onAction(event._id, event.type, isInscrito);
    setLoading(false);
    if (result?.success) {
      if (event.type !== 'event') setDone(true);
    }
  };

  const btnLabel = () => {
    if (loading) return 'Procesando...';
    if (event.type === 'event')
      return isInscrito ? 'Cancelar inscripción' : isFull ? 'Sin cupos' : 'Inscribirme';
    if (done) return '✓ Aplicado';
    return event.type === 'coupon' ? 'Canjear cupón' : 'Aplicar promoción';
  };

  const btnDisabled = loading || isFull || done;
  const btnStyle = {
    width: '100%',
    padding: '9px 0',
    borderRadius: 9,
    border: 'none',
    fontSize: 12,
    fontWeight: 700,
    cursor: btnDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    opacity: btnDisabled ? 0.55 : 1,
    ...(event.type === 'event'
      ? isInscrito
        ? {
          background: 'rgba(248,113,113,0.12)',
          color: '#f87171',
          border: '1px solid rgba(248,113,113,0.25)',
        }
        : { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }
      : done
        ? {
          background: 'rgba(74,222,128,0.1)',
          color: '#4ade80',
          border: '1px solid rgba(74,222,128,0.2)',
        }
        : { background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)', color: '#fff' }),
  };

  return (
    <div
      style={{
        background: '#111118',
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        padding: '18px 18px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.35)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: cfg.color,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 20,
                padding: '2px 8px',
              }}
            >
              {cfg.emoji} {cfg.label}
            </span>
            {isInscrito && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#4ade80',
                  background: 'rgba(74,222,128,0.1)',
                  border: '1px solid rgba(74,222,128,0.2)',
                  borderRadius: 20,
                  padding: '2px 8px',
                }}
              >
                ✓ Inscrito
              </span>
            )}
          </div>
          <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 15, margin: 0, lineHeight: 1.3 }}>
            {event.name}
          </h3>
        </div>
      </div>

      {/* Descripción */}
      {event.description && (
        <p
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: 12,
            margin: 0,
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </p>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <MetaPill icon='🍽️' text={restaurantName} />
        <MetaPill
          icon='📅'
          text={`${formatDate(event.schedule?.start_date)} → ${formatDate(event.schedule?.end_date)}`}
        />
        {cupos && (
          <MetaPill
            icon='👥'
            text={cupos}
            color={cupos === '¡Lleno!' ? '#f87171' : 'rgba(255,255,255,0.4)'}
          />
        )}
        {event.tags?.length > 0 &&
          event.tags.slice(0, 2).map((t) => <MetaPill key={t} icon='#' text={t} />)}
      </div>

      {/* Botón */}
      <button onClick={handleClick} disabled={btnDisabled} style={btnStyle}>
        {btnLabel()}
      </button>
    </div>
  );
};

const MetaPill = ({ icon, text, color }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 11,
      color: color || 'rgba(255,255,255,0.4)',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      padding: '3px 8px',
    }}
  >
    {icon} {text}
  </span>
);

// ── UserEventsSection ───────────────────────────────────────────────────────
export const UserEventsSection = () => {
  const { restaurants } = useRestaurantStore();
  const { events, loading, fetchPublicEvents, join, leave, apply } = useUserEventStore();
  const userId = useAuthStore((s) => s.user?._id || s.user?.id);

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [resultModal, setResultModal] = useState(null); // { title, message, color }

  useEffect(() => {
    if (restaurants?.length) fetchPublicEvents(restaurants);
  }, [restaurants?.length]);

  const handleAction = async (eventId, type, isInscrito) => {
    let result;
    if (type === 'event') {
      result = isInscrito ? await leave(eventId) : await join(eventId);
    } else {
      result = await apply(eventId);
    }

    if (result.success) {
      const msg =
        type === 'event'
          ? isInscrito
            ? 'Te has desinscrito del evento.'
            : `¡Inscripción confirmada! ${result.data?.cuposRestantes !== undefined ? `Cupos restantes: ${result.data.cuposRestantes}` : ''}`
          : result.data?.mensaje || '¡Aplicado con éxito!';
      showSuccess(msg);
      setResultModal({ title: '¡Listo!', message: msg, color: '#4ade80' });
    } else {
      showError(result.error);
      setResultModal({ title: 'No se pudo completar', message: result.error, color: '#f87171' });
    }
    return result;
  };

  const filtered = events.filter((ev) => {
    const matchType = typeFilter === 'ALL' || ev.type === typeFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q || ev.name?.toLowerCase().includes(q) || ev.description?.toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  return (
    <div style={{ paddingBottom: 48 }}>
      {/* Cabecera */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 22, margin: '0 0 4px' }}>
          Eventos & Promociones
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, margin: 0 }}>
          Noches especiales, descuentos y cupones exclusivos
        </p>
      </div>

      {/* Filtros */}
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
          {TYPE_FILTERS.map((f) => {
            const active = typeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  border: active ? 'none' : '1px solid rgba(255,255,255,0.12)',
                  background: active
                    ? 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)'
                    : 'rgba(255,255,255,0.05)',
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
          placeholder='Buscar evento, promo...'
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#fff',
            fontSize: 12,
            outline: 'none',
            minWidth: 180,
          }}
        />
      </div>

      {/* Contador */}
      <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 16 }}>
        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
      </p>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            color: 'rgba(255,255,255,0.3)',
            fontSize: 13,
          }}
        >
          Cargando eventos...
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 14,
            border: '1px dashed rgba(255,255,255,0.08)',
          }}
        >
          <p style={{ fontSize: 30, margin: '0 0 8px' }}>🎉</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, margin: 0 }}>
            {events.length === 0
              ? 'No hay eventos activos en este momento.'
              : 'Sin resultados para los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 400px))',
            gap: 16,
          }}
        >
          {filtered.map((ev) => (
            <EventCard
              key={ev._id}
              event={ev}
              userId={userId}
              restaurants={restaurants}
              onAction={handleAction}
            />
          ))}
        </div>
      )}

      {/* Modal de resultado */}
      {resultModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setResultModal(null)}
        >
          <div
            style={{
              background: '#111118',
              border: `1px solid ${resultModal.color}44`,
              borderRadius: 16,
              maxWidth: 380,
              width: '100%',
              padding: '28px 24px',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>
              {resultModal.color === '#4ade80' ? '✅' : '❌'}
            </div>
            <h3
              style={{ color: resultModal.color, fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}
            >
              {resultModal.title}
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: 13,
                margin: '0 0 20px',
                lineHeight: 1.5,
              }}
            >
              {resultModal.message}
            </p>
            <button
              onClick={() => setResultModal(null)}
              style={{
                background: 'linear-gradient(90deg, #F2509C 0%, #9362D9 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                border: 'none',
                borderRadius: 9,
                padding: '9px 28px',
                cursor: 'pointer',
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
