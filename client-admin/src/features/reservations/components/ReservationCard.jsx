import { formatDateLong } from '../../../shared/utils/formatters.js';

const STATUS_META = {
  PENDIENTE: {
    label: 'Pendiente',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.25)',
    dot: true,
  },
  CONFIRMADA: {
    label: 'Confirmada',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)',
    border: 'rgba(74,222,128,0.25)',
    dot: true,
  },
  CANCELADA: {
    label: 'Cancelada',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.25)',
    dot: false,
  },
  FINALIZADA: {
    label: 'Finalizada',
    color: 'rgba(255,255,255,0.3)',
    bg: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    dot: false,
  },
};

export const ReservationCard = ({ reservation, onEdit, onDelete, onConfirmToken, isResAdmin }) => {
  const st = STATUS_META[reservation.status] || STATUS_META.PENDIENTE;
  const table = reservation.tableId;
  const canEdit = ['PENDIENTE', 'CONFIRMADA'].includes(reservation.status) && !isResAdmin;
  const canDelete = !isResAdmin && reservation.status !== 'CONFIRMADA';
  const canCancel =
    !isResAdmin && reservation.status === 'PENDIENTE' && reservation.confirmationToken;

  return (
    <div
      style={{
        background: '#111118',
        border: `1px solid ${st.border}`,
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'transform 0.18s, box-shadow 0.18s',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            background: st.bg,
            color: st.color,
            border: `1px solid ${st.border}`,
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 10px',
            borderRadius: 20,
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          {st.dot && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: st.color,
                display: 'inline-block',
              }}
            />
          )}
          {st.label}
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
          🍽 {reservation.restaurantName}
        </span>
      </div>

      <div>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 }}>
          {reservation.peopleName}
        </h3>
        {reservation.observation && (
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12,
              margin: '4px 0 0',
              fontStyle: 'italic',
            }}
          >
            "{reservation.observation}"
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            📅 {formatDateLong(reservation.reservationDate)}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            🕐 {reservation.reservationHour}
          </span>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            👥 {reservation.peopleNumber} persona{reservation.peopleNumber !== 1 ? 's' : ''}
          </span>
        </div>
        {table && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
            <span
              style={{
                background: 'rgba(147,98,217,0.12)',
                color: '#9362D9',
                border: '1px solid rgba(147,98,217,0.25)',
                fontSize: 11,
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: 20,
              }}
            >
              Mesa {table.tableNumber}
            </span>
            {table.capacity && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.35)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 11,
                  padding: '2px 10px',
                  borderRadius: 20,
                }}
              >
                Cap. {table.capacity}
              </span>
            )}
            {table.location && (
              <span
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.35)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 11,
                  padding: '2px 10px',
                  borderRadius: 20,
                }}
              >
                {table.location}
              </span>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 12,
          flexWrap: 'wrap',
        }}
      >
        {isResAdmin && reservation.status === 'PENDIENTE' && onConfirmToken && (
          <>
            <button
              onClick={() => onConfirmToken(reservation, 'CONFIRMAR')}
              style={{
                flex: 1,
                background: 'rgba(74,222,128,0.1)',
                color: '#4ade80',
                border: '1px solid rgba(74,222,128,0.25)',
                borderRadius: 8,
                padding: '7px 0',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(74,222,128,0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(74,222,128,0.1)')}
            >
              ✓ Confirmar
            </button>
            {canCancel && (
              <button
                onClick={() => onConfirmToken(reservation, 'CANCELAR')}
                style={{
                  flex: 1,
                  background: 'rgba(248,113,113,0.08)',
                  color: '#f87171',
                  border: '1px solid rgba(248,113,113,0.2)',
                  borderRadius: 8,
                  padding: '7px 0',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
              >
                X Cancelar
              </button>
            )}
            <button
              onClick={() => onConfirmToken(reservation, 'CANCELAR')}
              style={{
                flex: 1,
                background: 'rgba(248,113,113,0.08)',
                color: '#f87171',
                border: '1px solid rgba(248,113,113,0.2)',
                borderRadius: 8,
                padding: '7px 0',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
            >
              ✕ Cancelar
            </button>
          </>
        )}

        {canEdit && (
          <button
            onClick={() => onEdit(reservation)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '7px 0',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
          >
            Editar
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onDelete(reservation._id)}
            style={{
              flex: 1,
              background: 'rgba(248,113,113,0.08)',
              color: '#f87171',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 8,
              padding: '7px 0',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};