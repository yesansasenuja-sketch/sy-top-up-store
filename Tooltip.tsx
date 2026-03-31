import React from 'react';

export const Tooltip: React.FC<{ text: string; children: React.ReactNode; position?: 'top' | 'bottom' | 'left' | 'right' }> = ({ text, children, position = 'top' }) => {
  const pos = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowPos = {
    top: 'top-full -translate-y-1/2 left-1/2 -translate-x-1/2 border-b border-r',
    bottom: 'bottom-full translate-y-1/2 left-1/2 -translate-x-1/2 border-t border-l',
    left: 'left-full -translate-x-1/2 top-1/2 -translate-y-1/2 border-t border-r',
    right: 'right-full translate-x-1/2 top-1/2 -translate-y-1/2 border-b border-l',
  };

  return (
    <div className="relative group inline-block">
      {children}
      <div className={`absolute ${pos[position]} px-2 py-1 bg-gaming-card border border-white/10 text-white text-[10px] font-bold rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]`}>
        {text}
        <div className={`absolute w-1.5 h-1.5 bg-gaming-card border-white/10 rotate-45 ${arrowPos[position]}`} />
      </div>
    </div>
  );
};
