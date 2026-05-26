import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ icon, title, value, color, subtitle, variant = 'default' }) => {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20'
  };

  if (variant === 'simple') {
    return (
      <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 group hover:border-zinc-700 transition-all">
        <div className="flex items-center gap-2 text-zinc-500 mb-2">
          {React.cloneElement(icon, { size: 16 })}
          <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
        </div>
        <p className="text-2xl font-black">{value}</p>
      </div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-zinc-800 relative group hover:border-zinc-700 transition-all duration-300 shadow-xl overflow-hidden"
    >
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700">
         {React.cloneElement(icon, { size: 120 })}
      </div>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${colorMap[color] || colorMap.green} shadow-inner`}>
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      <p className="text-5xl font-black mt-2 tracking-tighter text-white">{value}</p>
      {subtitle && <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2">{subtitle}</div>}
    </motion.div>
  );
};

export default StatCard;
