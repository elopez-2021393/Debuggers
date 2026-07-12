import { useState } from 'react';

const LOCATIONS = ['Interior', 'Terraza', 'Ventana', 'Jardín', 'Otro'];

const EMPTY_ERRORS = { tableNumber: '', capacity: '' };

// Mismo criterio de validación que MenuModal / CreateUserModal
const validateForm = (form) => {
  const errors = { ...EMPTY_ERRORS };

  const tableNumber = form.tableNumber.trim();
  if (!tableNumber) errors.tableNumber = 'El número o nombre de la mesa es obligatorio';
  else if (tableNumber.length > 20) errors.tableNumber = 'Máximo 20 caracteres';

  const capacity = Number(form.capacity);
  if (!form.capacity) errors.capacity = 'La capacidad es obligatoria';
  else if (Number.isNaN(capacity) || capacity < 1 || capacity > 20)
    errors.capacity = 'La capacidad debe estar entre 1 y 20 personas';

  return errors;
};

const hasErrors = (errors) => Object.values(errors).some((msg) => msg);

// Helper: arma la clase del input agregando el borde rosa de error
const fieldClass = (hasError) => `dbe-input w-full px-3 py-2 text-sm ${hasError ? 'dbe-input-error' : ''}`.trim();

export const TableModal = ({ table, restaurantId, onSave, onClose, saving }) => {
  const isEdit = Boolean(table?._id);

  const [form, setForm] = useState(() => {
    if (!table) return { tableNumber: '', capacity: 2, location: 'Interior', restaurantId };
    return {
      tableNumber: table.tableNumber || '',
      capacity: table.capacity || 2,
      location: table.location || 'Interior',
      restaurantId,
    };
  });

  const [fieldErrors, setFieldErrors] = useState(EMPTY_ERRORS);
  const [serverError, setServerError] = useState('');

  const setF = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async () => {
    setServerError('');
    const errors = validateForm(form);
    if (hasErrors(errors)) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors(EMPTY_ERRORS);

    const payload = {
      restaurantId: form.restaurantId,
      tableNumber: form.tableNumber.trim(),
      capacity: Number(form.capacity),
      location: form.location || undefined,
    };

    const res = await onSave(payload, isEdit ? table._id : null);
    if (!res?.success) setServerError(res?.error || 'Error al guardar');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 460,
          padding: '28px 28px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <div>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0 }}>
              {isEdit ? 'Editar mesa' : 'Nueva mesa'}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, margin: '2px 0 0' }}>
              {isEdit ? 'Modifica los datos de la mesa' : 'Agrega una nueva mesa al restaurante'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 20,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Número */}
        <div style={{ marginBottom: 16 }}>
          <label className='dbe-label mb-1'>
            Número / Nombre <span style={{ color: 'var(--dbe-pink)' }}>*</span>
          </label>
          <input
            className={fieldClass(fieldErrors.tableNumber)}
            value={form.tableNumber}
            onChange={(e) => setF('tableNumber', e.target.value)}
            placeholder='Ej. Mesa 5, VIP-1, Terraza-A'
            maxLength={20}
          />
          {fieldErrors.tableNumber ? (
            <p className='dbe-error'>{fieldErrors.tableNumber}</p>
          ) : (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '4px 0 0' }}>
              Máx. 20 caracteres · {form.tableNumber.length}/20
            </p>
          )}
        </div>

        {/* Capacidad */}
        <div style={{ marginBottom: 16 }}>
          <label className='dbe-label mb-1'>
            Capacidad <span style={{ color: 'var(--dbe-pink)' }}>*</span>
          </label>
          <input
            type='number'
            min={1}
            max={20}
            className={fieldClass(fieldErrors.capacity)}
            value={form.capacity}
            onChange={(e) => setF('capacity', e.target.value)}
          />
          {fieldErrors.capacity ? (
            <p className='dbe-error'>{fieldErrors.capacity}</p>
          ) : (
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: '4px 0 0' }}>
              Entre 1 y 20 personas
            </p>
          )}
        </div>

        {/* Ubicación */}
        <div style={{ marginBottom: 24 }}>
          <label className='dbe-label mb-1'>
            Ubicación
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {LOCATIONS.map((loc) => {
              const sel = form.location === loc;
              return (
                <button
                  key={loc}
                  onClick={() => setF('location', loc)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: 20,
                    border: sel ? '1px solid #9362D9' : '1px solid rgba(255,255,255,0.1)',
                    background: sel ? 'rgba(147,98,217,0.2)' : 'rgba(255,255,255,0.04)',
                    color: sel ? '#9362D9' : 'rgba(255,255,255,0.5)',
                    fontSize: 12,
                    fontWeight: sel ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error del servidor */}
        {serverError && (
          <p
            className='dbe-error'
            style={{
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: 8,
              padding: '8px 12px',
              margin: '0 0 16px',
              fontSize: 13,
            }}
          >
            {serverError}
          </p>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 20px',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'none',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className='dbe-btn-primary'
            style={{ padding: '9px 24px', borderRadius: 8, fontSize: 13, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear mesa'}
          </button>
        </div>
      </div>
    </div>
  );
};