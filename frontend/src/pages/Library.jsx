import React, { useState, useEffect } from 'react';
import { Library as LibraryIcon, Heart, Clock, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useVoice } from '../context/VoiceContext';
import { useAuth } from '../context/AuthContext';
import PodcastCard from '../components/PodcastCard';

const Library = () => {
  const { currentPodcast, isPlaying, playPodcast, podcasts, onSetSearchQuery, searchQuery } = useVoice();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading to show the requested loader
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col bg-zinc-900 min-h-screen">
        <Navbar searchQuery={searchQuery} setSearchQuery={onSetSearchQuery} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse uppercase tracking-[0.2em] text-xs">Accessing Your Collection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-zinc-900 min-h-screen">
      <Navbar searchQuery={searchQuery} setSearchQuery={onSetSearchQuery} />

      <main className="px-8 py-6 relative z-10 flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <LibraryIcon className="text-black" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Your Library</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Personal Collection</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-zinc-800/40 p-6 rounded-2xl hover:bg-zinc-800/60 transition-all border border-zinc-800 group cursor-pointer">
              <div className="w-12 h-12 bg-pink-500/20 text-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Heart size={24} fill="currentColor" />
              </div>
              <h3 className="text-lg font-bold mb-1">Liked Podcasts</h3>
              <p className="text-sm text-zinc-500">All the voices you've loved.</p>
            </div>
            
            <div className="bg-zinc-800/40 p-6 rounded-2xl hover:bg-zinc-800/60 transition-all border border-zinc-800 group cursor-pointer">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
              <h3 className="text-lg font-bold mb-1">Recently Played</h3>
              <p className="text-sm text-zinc-500">Pick up exactly where you left off.</p>
            </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-6">Saved Content</h3>
          {podcasts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {podcasts.slice(0, 10).map((podcast) => (
                <PodcastCard 
                  key={podcast._id || podcast.id} 
                  podcast={podcast} 
                  onSelect={() => playPodcast(podcast)}
                  isCurrent={currentPodcast?._id === podcast._id || currentPodcast?.id === podcast.id}
                  isPlaying={isPlaying && (currentPodcast?._id === podcast._id || currentPodcast?.id === podcast.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 bg-zinc-800/20 rounded-3xl border border-dashed border-zinc-800">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 text-3xl shadow-inner">
                🎙️
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your library is empty</h3>
              <p className="text-zinc-500 max-w-xs text-center">Start exploring and adding your favorite podcasts to build your collection.</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform text-sm"
              >
                Browse Popular
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Library;
