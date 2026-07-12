export const FuenteBadge = ({ fuente }) => {
    if (!fuente) return null;
    const isCache = fuente === 'cache';
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${isCache
                    ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                    : 'text-green-400 bg-green-400/10 border-green-400/20'
                }`}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCache ? 'bg-yellow-400' : 'bg-green-400'
                    }`}
            />
            {isCache ? 'Desde caché' : 'Recién calculado'}
        </span>
    );
};