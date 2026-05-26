import { useState, useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';
import { podcastService } from '../services/podcastService';
import Navbar from '../components/Navbar';
import PodcastCard from '../components/PodcastCard';
import { motion } from 'framer-motion';
import { filterValidPodcasts } from '../utils/audioValidator';

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
          console.log(`🔍 [SEARCH] API returned ${results?.length || 0} results for "${searchQuery}"`);
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
  const podcastsArray = Array.isArray(podcasts) ? podcasts : [];
  const apiResultsArray = Array.isArray(apiResults) ? apiResults : [];

  const localMatches = searchQuery.trim() === ""
    ? podcastsArray
    : podcastsArray.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Combined and deduplicate
  const combinedMap = new Map();
  localMatches.forEach(p => combinedMap.set(p.id || p._id, p));
  apiResultsArray.forEach(p => combinedMap.set(p.id || p._id, p));
  const filteredPodcasts = Array.from(combinedMap.values()).filter(p => p.audio || p.audioUrl);

  const renderPodcastGrid = (podcastsToRender) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {podcastsToRender.map(podcast => (
        <PodcastCard 
          key={podcast.id || podcast._id}
          podcast={podcast}
          onSelect={playPodcast}
          isCurrent={currentPodcast?.id === podcast.id || currentPodcast?._id === podcast._id}
        />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-60">
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
