export const StatCard = ({ label, value, sub }) => (
    <div className='rounded-xl bg-[#16161f] border border-white/[0.06] p-4 space-y-1'>
        <p className='text-xs font-semibold text-white/40 uppercase tracking-wider'>{label}</p>
        <p className='text-2xl font-bold text-white'>{value}</p>
        {sub && <p className='text-xs text-white/30'>{sub}</p>}
    </div>
);