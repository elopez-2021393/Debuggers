export const ExportPdfButton = ({ onClick, loading }) => (
    <button
        onClick={onClick}
        disabled={loading}
        className='px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/10 border border-white/10 hover:bg-white/20 transition disabled:opacity-50'
    >
        {loading ? 'Exportando...' : 'Exportar PDF'}
    </button>
);