import { useState, useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';
import { podcastService } from '../services/podcastService';
import Navbar from '../components/Navbar';
import PodcastCard from '../components/PodcastCard';
import { motion } from 'framer-motion';

export default function Home({ podcasts: initialPodcasts, trendingPodcasts }) {
  const { 
    playPodcast, 
    setPodcasts,
    currentPodcast,
    isPlaying
  } = useVoice();

  const [searchQuery, setSearchQuery] = useState('');
  
  // MANDATORY: Non-destructive filtering
  const filteredRecommended = searchQuery.trim() === ""
    ? initialPodcasts || []
    : (initialPodcasts || []).filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const filteredTrending = searchQuery.trim() === ""
    ? trendingPodcasts || []
    : (trendingPodcasts || []).filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author?.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Fallback loading if props are empty
  useEffect(() => {
    if (!initialPodcasts || initialPodcasts.length === 0) {
      const loadPodcasts = async () => {
        const data = await podcastService.getRecommended();
        setPodcasts(data);
      };
      loadPodcasts();
    }
  }, [initialPodcasts, setPodcasts]);

  // Voice search event listener
  useEffect(() => {
    const handleVoiceSearch = (e) => {
      setSearchQuery(e.detail);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('voice-search', handleVoiceSearch);
    return () => window.removeEventListener('voice-search', handleVoiceSearch);
  }, []);

  const renderPodcastGrid = (podcastsToRender) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
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
      className="flex-1 flex flex-col relative bg-zinc-900 min-h-screen max-w-full overflow-x-hidden"
    >
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="px-4 sm:px-8 py-6 relative z-10 w-full overflow-x-hidden">
        
        {/* Recommended Podcasts Section */}
        <section className="mb-10 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Recommended Podcasts</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRecommended.map(podcast => (
              <PodcastCard 
                key={podcast.id || podcast._id}
                podcast={podcast}
                onSelect={playPodcast}
                isCurrent={currentPodcast?.id === podcast.id || currentPodcast?._id === podcast._id}
              />
            ))}
          </div>
        </section>

        {/* Global Trending Section */}
        <section className="mb-10 w-full">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Global Trending</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTrending.map(podcast => (
              <PodcastCard 
                key={podcast.id || podcast._id}
                podcast={podcast}
                onSelect={playPodcast}
                isCurrent={currentPodcast?.id === podcast.id || currentPodcast?._id === podcast._id}
              />
            ))}
          </div>
        </section>

        {/* Empty State - Only show if actively searching and NO results match across both arrays */}
        {searchQuery.trim() !== "" && filteredRecommended.length === 0 && filteredTrending.length === 0 && (
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
      </div>
    </motion.div>
  );
}
