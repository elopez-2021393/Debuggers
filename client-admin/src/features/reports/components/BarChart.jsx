export const BarChart = ({ data, labelKey, valueKey, formatValue }) => {
    const max = Math.max(...data.map((d) => d[valueKey]), 1);
    return (
        <ul className='space-y-2 list-none p-0 m-0'>
            {data.map((item, idx) => {
                const pct = Math.round((item[valueKey] / max) * 100);
                return (
                    <li key={idx} className='flex items-start gap-3 text-xs'>
                        <span className='w-28 shrink-0 text-white/50 text-right break-words leading-tight'>
                            {item[labelKey]}
                        </span>
                        <div className='flex-1 h-5 rounded-md bg-white/[0.04] overflow-hidden'>
                            <div
                                className='h-full rounded-md transition-all duration-500'
                                style={{
                                    width: `${pct}%`,
                                    background: 'var(--dbe-gradient-h)',
                                    opacity: 0.7 + (pct / 100) * 0.3,
                                }}
                            />
                        </div>
                        <span className='w-20 shrink-0 text-white/70 font-semibold'>
                            {formatValue ? formatValue(item[valueKey]) : item[valueKey]}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
};