export const ReportTable = ({ columns, rows }) => (
    <div className='mt-3 overflow-x-auto'>
        <table className='w-full text-xs text-white/60 border-collapse'>
            <thead>
                <tr className='border-b border-white/[0.06]'>
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            className={`py-2 text-white/40 font-semibold uppercase tracking-wider ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                        >
                            {col.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, idx) => (
                    <tr key={idx} className='border-b border-white/[0.03] hover:bg-white/[0.02]'>
                        {columns.map((col) => (
                            <td
                                key={col.key}
                                className={`py-2 ${col.align === 'right' ? 'text-right' : ''} ${col.className ?? ''}`}
                            >
                                {col.render ? col.render(row, idx) : row[col.key]}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);