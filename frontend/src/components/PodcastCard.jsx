import React from 'react';
import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

const PodcastCard = ({ podcast, onSelect, isCurrent }) => {
  if (!podcast) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`p-4 rounded-3xl transition-all duration-500 group relative cursor-pointer overflow-hidden ${
        isCurrent 
          ? 'bg-zinc-800 ring-2 ring-green-500 shadow-[0_0_40px_rgba(34,197,94,0.25)] scale-[1.02]' 
          : 'bg-zinc-900/40 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
      }`}
      onClick={() => onSelect?.(podcast)}
    >
      <div className="relative aspect-square mb-4 rounded-2xl overflow-hidden bg-zinc-800 shadow-2xl">
        {/* Glow Overlay */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-t from-green-500/20 to-transparent z-10`} />
        
        {isCurrent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-green-500/10 z-10 pointer-events-none"
          />
        )}

        {podcast.imageUrl || podcast.image || podcast.cover ? (
          <motion.img 
            src={podcast.imageUrl || podcast.image || podcast.cover} 
            alt={podcast.title} 
            className="w-full h-full object-cover relative z-0 transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-4xl">🎙️</div>
        )}
        
        {/* Play Button Overlay */}
        <div className={`absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[0.23, 1, 0.32, 1] z-20 ${isCurrent ? 'opacity-100 translate-y-0' : ''}`}>
          <div className="bg-green-500 rounded-full p-4 shadow-[0_8px_20px_rgba(34,197,94,0.4)] hover:scale-110 active:scale-95 text-black">
            {isCurrent ? (
               <div className="flex gap-1 items-center h-6">
                  <motion.div animate={{ height: [4, 16, 8, 16, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-black rounded-full" />
                  <motion.div animate={{ height: [8, 4, 16, 4, 8] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-black rounded-full" />
                  <motion.div animate={{ height: [16, 8, 4, 8, 16] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-black rounded-full" />
               </div>
            ) : <Play fill="black" size={24} />}
          </div>
        </div>

        {isCurrent && (
          <div className="absolute top-4 left-4 z-20 flex gap-1 items-end h-5 bg-black/60 backdrop-blur-md px-3 py-2 rounded-full border border-green-500/30">
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest mr-1">Playing</span>
            <motion.span animate={{ height: [4, 12, 6, 12, 4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-0.5 bg-green-500 rounded-full" />
            <motion.span animate={{ height: [6, 4, 12, 4, 6] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-0.5 bg-green-500 rounded-full" />
            <motion.span animate={{ height: [12, 6, 4, 6, 12] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-0.5 bg-green-500 rounded-full" />
          </div>
        )}
      </div>

      <div className="space-y-1.5 px-1">
        <h3 className={`font-black truncate text-base tracking-tight leading-tight ${isCurrent ? 'text-green-500' : 'text-white'}`}>
          {podcast?.title || 'Untitled Podcast'}
        </h3>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] truncate">
          {podcast?.author || 'VoiceCast Artist'}
        </p>
      </div>
    </motion.div>
  );
};

export const PodcastSkeleton = () => (
  <div className="bg-zinc-800/40 p-4 rounded-xl animate-pulse">
    <div className="aspect-square bg-zinc-700 rounded-lg mb-4"></div>
    <div className="h-4 bg-zinc-700 rounded-md w-3/4 mb-3"></div>
    <div className="h-3 bg-zinc-700 rounded-md w-1/2"></div>
  </div>
);

export default PodcastCard;
