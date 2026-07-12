export const TableCard = ({ table, onEdit, onDelete, onToggle }) => {
  return (
    <div
      style={{
        background: '#111118',
        border: table.isActive
          ? '1px solid rgba(147,98,217,0.3)'
          : '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: table.isActive ? 1 : 0.55,
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 }}>
          {table.tableNumber}
        </h3>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
            background: table.isActive ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
            color: table.isActive ? '#4ade80' : '#f87171',
            border: table.isActive
              ? '1px solid rgba(74,222,128,0.3)'
              : '1px solid rgba(248,113,113,0.3)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {table.isActive ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            padding: '10px 12px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 11,
              margin: '0 0 2px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Capacidad
          </p>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 20, margin: 0 }}>
            {table.capacity}
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 400 }}>
              {' '}
              pers.
            </span>
          </p>
        </div>

        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            padding: '10px 12px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              color: 'rgba(255,255,255,0.35)',
              fontSize: 11,
              margin: '0 0 2px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Ubicacion
          </p>
          <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, margin: 0 }}>
            {table.location || 'No especificada'}
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 12,
        }}
      >
        <button
          onClick={() => onEdit(table)}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '6px 0',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        >
          Editar
        </button>

        <button
          onClick={() => onToggle(table._id, table.isActive)}
          style={{
            flex: 1,
            background: table.isActive ? 'rgba(251,191,36,0.08)' : 'rgba(74,222,128,0.08)',
            color: table.isActive ? '#fbbf24' : '#4ade80',
            border: table.isActive
              ? '1px solid rgba(251,191,36,0.25)'
              : '1px solid rgba(74,222,128,0.25)',
            borderRadius: 8,
            padding: '6px 0',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          {table.isActive ? 'Inhabilitar' : 'Habilitar'}
        </button>

        <button
          onClick={() => onDelete(table._id)}
          style={{
            flex: 1,
            background: 'rgba(248,113,113,0.08)',
            color: '#f87171',
            border: '1px solid rgba(248,113,113,0.2)',
            borderRadius: 8,
            padding: '6px 0',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};
