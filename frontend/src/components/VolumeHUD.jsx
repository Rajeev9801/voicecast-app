import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Volume1, VolumeX, Volume } from 'lucide-react';

export default function VolumeHUD() {
  const [volume, setVolume] = useState(100);
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  let timeout;

  useEffect(() => {
    const handleVolumeChange = (e) => {
      const { volume: newVol, muted } = e.detail;
      setVolume(Math.round(newVol * 100));
      setIsMuted(muted);
      setIsVisible(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsVisible(false), 2000);
    };

    window.addEventListener('volume-change', handleVolumeChange);
    return () => {
      window.removeEventListener('volume-change', handleVolumeChange);
      clearTimeout(timeout);
    };
  }, []);

  const getIcon = () => {
    if (isMuted || volume === 0) return <VolumeX size={32} className="text-red-500" />;
    if (volume < 30) return <Volume size={32} className="text-green-500" />;
    if (volume < 70) return <Volume1 size={32} className="text-green-500" />;
    return <Volume2 size={32} className="text-green-500" />;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] bg-zinc-900/90 backdrop-blur-md border border-green-500/50 p-6 rounded-3xl shadow-[0_0_30px_rgba(34,197,94,0.2)] flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
            {getIcon()}
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-white tabular-nums">
              {isMuted ? 'MUTED' : `${volume}%`}
            </span>
            <div className="w-1.5 h-32 bg-zinc-800 rounded-full mt-4 overflow-hidden relative">
              <motion.div 
                className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${isMuted ? 'bg-zinc-700' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`}
                initial={{ height: 0 }}
                animate={{ height: isMuted ? '0%' : `${volume}%` }}
              />
            </div>
          </div>
          
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
            Volume
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
