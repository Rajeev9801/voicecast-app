import React from 'react';
import { Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

// High quality fallback images based on category
const fallbackImages = [
  "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=600&auto=format&fit=crop", // Tech / Setup
  "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600&auto=format&fit=crop", // Space
  "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=600&auto=format&fit=crop", // Creativity / Neon
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=600&auto=format&fit=crop", // Business
  "https://images.unsplash.com/photo-1516280440502-6c2e391b16bb?q=80&w=600&auto=format&fit=crop", // Mindset
  "https://images.unsplash.com/photo-1589903308904-1010c2294adc?q=80&w=600&auto=format&fit=crop"  // Minimal
];

const PodcastCard = ({ podcast, onSelect, isCurrent }) => {
  if (!podcast) return null;

  // Derive a consistent fallback image index based on podcast title length so it stays the same per card
  const fallbackIndex = podcast.title ? podcast.title.length % fallbackImages.length : 0;
  
  // Use provided image if valid, otherwise fallback
  let rawSource = podcast.thumbnail || podcast.imageUrl || podcast.image || podcast.cover;
  
  // Format URL if relative
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  if (rawSource && rawSource.startsWith('/uploads/')) {
    rawSource = `${API_URL}${rawSource}`;
  }

  const imgSource = rawSource && !rawSource.includes("undefined")
    ? rawSource 
    : fallbackImages[fallbackIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className={`p-4 rounded-3xl transition-all duration-500 group relative cursor-pointer overflow-hidden ${
        isCurrent 
          ? 'bg-zinc-800 ring-2 ring-zinc-500 shadow-[0_0_40px_rgba(255,255,255,0.05)] scale-[1.02]' 
          : 'bg-zinc-900/40 hover:bg-zinc-800/80 border border-white/5 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
      }`}
      onClick={() => onSelect?.(podcast)}
    >
      <div className="relative aspect-square mb-4 rounded-3xl overflow-hidden bg-zinc-800 shadow-2xl">
        {/* Subtle Overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-black/40 z-10" />

        <img 
          src={imgSource} 
          alt={podcast.title} 
          className="w-full h-full object-cover relative z-0 transition-transform duration-700 group-hover:scale-105 rounded-3xl"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop";
          }}
        />
        
        {/* Subtle Static Icon */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <div className="bg-zinc-900/80 backdrop-blur-md rounded-full p-2.5 shadow-lg border border-white/10 text-white hover:bg-white hover:text-black hover:border-white transition-colors">
            <Headphones size={18} />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 px-1">
        <h3 className={`font-black truncate text-base tracking-tight leading-tight ${isCurrent ? 'text-white' : 'text-white'}`}>
          {podcast?.title || 'Untitled Podcast'}
        </h3>
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] truncate">
          {podcast?.genre || podcast?.category || 'General'} • {podcast?.author || 'VoiceCast Artist'}
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
