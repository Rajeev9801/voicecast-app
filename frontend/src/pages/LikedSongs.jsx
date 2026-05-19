import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useVoice } from '../context/VoiceContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Heart, Play, Clock, MoreHorizontal, User } from 'lucide-react';

export default function LikedSongs() {
  const { playPodcast, currentPodcast, isPlaying } = useVoice();
  const [likedPodcasts, setLikedPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLikedSongs();
  }, []);

  const fetchLikedSongs = async () => {
    try {
      const profile = await userService.getProfile();
      setLikedPodcasts(profile.likedSongs || []);
    } catch (err) {
      toast.error('Failed to load liked podcasts');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (podcastId) => {
    try {
      await userService.toggleLike(podcastId);
      setLikedPodcasts(prev => prev.filter(p => p._id !== podcastId));
      toast.info('Removed from Liked Songs');
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading liked songs...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-black text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-b from-indigo-900/40 to-black rounded-3xl p-8 mb-10 border border-zinc-800"
      >
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="w-56 h-56 bg-gradient-to-br from-indigo-600 to-purple-700 shadow-2xl rounded-2xl flex items-center justify-center text-white">
            <Heart size={100} fill="white" />
          </div>
          <div className="text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Playlist</span>
            <h1 className="text-6xl md:text-8xl font-black mt-2 mb-6">Liked Songs</h1>
            <div className="flex items-center gap-2 text-zinc-300 font-medium">
              <User size={18} className="text-zinc-500" />
              <span>Your Profile</span>
              <span className="mx-1">•</span>
              <span>{likedPodcasts.length} podcasts</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="px-4">
        <div className="grid grid-cols-12 gap-4 text-zinc-500 text-sm font-semibold uppercase tracking-wider border-b border-zinc-800 pb-4 mb-4">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-5">Title</div>
          <div className="hidden md:block md:col-span-3">Date Added</div>
          <div className="col-span-5 md:col-span-3 text-right pr-4">Actions</div>
        </div>

        <div className="space-y-1">
          {likedPodcasts.length > 0 ? (
            likedPodcasts.map((podcast, index) => (
              <motion.div 
                key={podcast._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-12 gap-4 items-center p-3 rounded-xl hover:bg-zinc-800/50 transition-all group cursor-pointer"
                onClick={() => playPodcast(podcast)}
              >
                <div className="col-span-1 text-center text-zinc-500 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                  <div className="relative w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                    <Play size={20} className={`text-white absolute z-10 transition-opacity ${currentPodcast?._id === podcast._id && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} fill="currentColor" />
                    <Music size={24} className="text-zinc-700 group-hover:opacity-20 transition-opacity" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className={`font-bold truncate ${currentPodcast?._id === podcast._id ? 'text-green-500' : 'text-white'}`}>{podcast.title}</h3>
                    <p className="text-xs text-zinc-400 truncate">{podcast.creator?.name || 'VoiceCast Artist'}</p>
                  </div>
                </div>
                <div className="hidden md:block md:col-span-3 text-sm text-zinc-500">
                  {new Date(podcast.createdAt).toLocaleDateString()}
                </div>
                <div className="col-span-5 md:col-span-3 flex items-center justify-end gap-4 pr-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleLike(podcast._id); }}
                    className="text-green-500 hover:scale-110 transition-transform"
                  >
                    <Heart size={20} fill="currentColor" />
                  </button>
                  <button className="text-zinc-500 hover:text-white transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-700">
                <Heart size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Songs you like will appear here</h3>
                <p className="text-zinc-500 mt-1">Save podcasts by tapping the heart icon.</p>
              </div>
              <button onClick={() => window.location.href = '/'} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform">
                Find podcasts
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Music(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
