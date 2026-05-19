import React from 'react';

const Toast = ({ message }) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-zinc-800 text-spotify-green px-6 py-3 rounded-full shadow-[0_0_20px_rgba(29,185,84,0.3)] border border-spotify-green/50 z-[100] font-bold animate-bounce">
      {message}
    </div>
  );
};

export default Toast;
