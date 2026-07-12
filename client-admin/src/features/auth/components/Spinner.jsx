export const Spinner = ({ small = false }) => {
  if (small) {
    return (
      <div className='flex items-center justify-center'>
        <div
          className='w-5 h-5 rounded-full border-2 border-transparent animate-spin'
          style={{
            borderTopColor: '#F2509C',
            borderRightColor: '#9362D9',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className='w-full h-screen flex items-center justify-center'
      style={{ background: '#0B0B0D' }}
    >
      <div
        className='w-14 h-14 rounded-full border-4 border-transparent animate-spin'
        style={{
          borderTopColor: '#F2509C',
          borderRightColor: '#9362D9',
        }}
      />
    </div>
  );
};
