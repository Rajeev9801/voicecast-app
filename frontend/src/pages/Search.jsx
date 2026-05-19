import { useState, useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';
import { podcastService } from '../services/podcastService';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';

export default function Search() {
  const { 
    podcasts,
    playPodcast, 
    currentPodcast,
    isPlaying
  } = useVoice();

  const [searchQuery, setSearchQuery] = useState('');
  const [apiResults, setApiResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handle URL query and voice events
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) setSearchQuery(q);

    const handleVoiceSearch = (e) => {
      setSearchQuery(e.detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('voice-search', handleVoiceSearch);
    return () => window.removeEventListener('voice-search', handleVoiceSearch);
  }, []);

  // Fetch from API for deeper search when query changes
  useEffect(() => {
    const fetchApiSearch = async () => {
      if (searchQuery.trim().length > 2) {
        setIsSearching(true);
        try {
          const results = await podcastService.search(searchQuery);
          setApiResults(results || []);
        } catch (err) {
          console.error("Search API failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setApiResults([]);
      }
    };
    
    const timeoutId = setTimeout(fetchApiSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // MANDATORY: Non-destructive filtering + merging API results
  const localMatches = searchQuery.trim() === ""
    ? podcasts
    : podcasts.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Combine and deduplicate
  const combinedMap = new Map();
  localMatches.forEach(p => combinedMap.set(p.id || p._id, p));
  apiResults.forEach(p => combinedMap.set(p.id || p._id, p));
  const filteredPodcasts = Array.from(combinedMap.values());

  const renderPodcastGrid = (podcastsToRender) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {podcastsToRender.map(podcast => (
        <div
          key={podcast.id || podcast._id}
          onClick={() => playPodcast(podcast)}
          className={`
            bg-zinc-800/40 p-4 rounded-xl hover:bg-zinc-800/80 transition-all cursor-pointer group
            ${currentPodcast?.id === podcast.id || currentPodcast?._id === podcast._id ? 'ring-2 ring-green-500 bg-zinc-800/60 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : ''}
          `}
        >
          <div className="w-full aspect-square bg-zinc-700 rounded-lg mb-4 overflow-hidden relative shadow-lg group-hover:scale-[1.02] transition">
            {podcast.image || podcast.imageUrl ? (
              <img 
                src={podcast.image || podcast.imageUrl} 
                alt={podcast.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl bg-zinc-800">🎙️</div>
            )}
            
            {/* Play Button Overlay */}
            <div className={`
              absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full items-center justify-center shadow-xl
              flex opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all
              ${(currentPodcast?.id === podcast.id || currentPodcast?._id === podcast._id) && isPlaying ? 'opacity-100 translate-y-0' : ''}
            `}>
              <span className="text-black text-xl">
                {(currentPodcast?.id === podcast.id || currentPodcast?._id === podcast._id) && isPlaying ? '⏸️' : '▶️'}
              </span>
            </div>
          </div>
          
          <h3 className="font-bold text-sm mb-1 truncate text-white">{podcast.title}</h3>
          <p className="text-zinc-400 text-xs truncate">{podcast.author || 'Unknown Artist'}</p>
        </div>
      ))}
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex flex-col relative bg-zinc-900 min-h-screen"
    >
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="px-8 py-6 relative z-10">
        
        {/* Header matches Home */}
        <section className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            {searchQuery.trim() !== "" ? `Search Results for "${searchQuery}"` : 'Global Trending'}
            {isSearching && <span className="ml-4 inline-block w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
          </h1>
          
          {filteredPodcasts.length > 0 && renderPodcastGrid(filteredPodcasts)}
        </section>

        {/* Empty State - Only show if actively searching and NO results match */}
        {searchQuery.trim() !== "" && filteredPodcasts.length === 0 && !isSearching && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 animate-in fade-in">
            <div className="text-6xl mb-4">🔇</div>
            <h3 className="text-xl font-bold text-white mb-2">No podcasts found</h3>
            <p className="mb-8">We couldn't find anything matching "{searchQuery}"</p>
            
            <button 
              onClick={() => setSearchQuery('')}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold transition"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Recommended Section - Always visible if search is empty or no results */}
        {(searchQuery.trim() === "" || filteredPodcasts.length === 0) && podcasts.length > 0 && (
          <div className="mt-16 border-t border-zinc-800 pt-10">
            <h2 className="text-2xl font-bold mb-6 text-zinc-400">Recommended for you</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-60">
              {podcasts.slice(0, 6).map(p => (
                <div key={`rec-${p.id || p._id}`} onClick={() => playPodcast(p)} className="cursor-pointer hover:opacity-100 transition">
                  <div className="aspect-square bg-zinc-800 rounded-lg mb-2 overflow-hidden shadow-lg">
                    <img src={p.image || p.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <p className="text-xs font-bold truncate text-white">{p.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
