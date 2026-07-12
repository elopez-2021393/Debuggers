export const formatDate = (isoString) => {
  if (!isoString) return 'Sin fecha';
  const date = new Date(isoString);
  return date.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateLong = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('es-GT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
  });
};