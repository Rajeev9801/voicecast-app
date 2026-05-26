import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2 } from 'lucide-react';

const Player = ({ 
  currentPodcast, 
  isPlaying, 
  onPlayPause, 
  audioRef, 
  onNext, 
  onPrevious,
  volume,
  setVolume 
}) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, audioRef]);

  // Voice Event Listeners
  useEffect(() => {
    const handleShuffle = (e) => setIsShuffle(e.detail);
    const handleVoiceRepeat = () => setIsRepeat(audioRef.current?.loop || false);

    window.addEventListener('voice-playback-shuffle', handleShuffle);
    // Poll for repeat since it's toggled on the native element in VoiceContext
    const repeatInterval = setInterval(handleVoiceRepeat, 1000);

    return () => {
      window.removeEventListener('voice-playback-shuffle', handleShuffle);
      clearInterval(repeatInterval);
    };
  }, [audioRef]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
      // Sync repeat state
      if (isRepeat !== audioRef.current.loop) setIsRepeat(audioRef.current.loop);
    }
  };

  const toggleRepeat = () => {
    if (audioRef.current) {
      audioRef.current.loop = !audioRef.current.loop;
      setIsRepeat(audioRef.current.loop);
    }
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleVolume = (e) => {
    setVolume(Number(e.target.value));
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;
  const volumePercent = volume * 100;

  const handleAudioError = (e) => {
    console.error("📻 [PLAYER] Audio playback error:", e);
    // showToast is available in VoiceContext, but Player gets props. 
    // We can use a custom event or just log for now, but better to skip.
    if (onNext) {
      console.log("⏭️ [PLAYER] Skipping broken podcast...");
      onNext();
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => onNext?.()}
        onError={handleAudioError}
      />
      
      {currentPodcast && (
        <div className="h-24 bg-zinc-900 border-t border-zinc-800 px-4 sm:px-6 flex items-center justify-between fixed bottom-16 md:bottom-0 left-0 right-0 z-50 transition-all duration-500">
          {/* Current Podcast Info */}
          <div className="flex items-center gap-3 sm:gap-4 w-[40%] sm:w-[30%] min-w-0 sm:min-w-[200px]">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-zinc-800 rounded-md shadow-lg overflow-hidden flex-shrink-0 group relative">
              {currentPodcast?.image ? (
                <img 
                  src={currentPodcast.image?.startsWith('http') ? currentPodcast.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${currentPodcast.image}`} 
                  alt="cover" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-spotify-green/40 to-black flex items-center justify-center text-[10px] sm:text-xs font-bold text-white/40 uppercase group-hover:scale-110 transition-transform">
                  {currentPodcast?.title?.substring(0, 2) || 'VC'}
                </div>
              )}
            </div>
            <div className="truncate">
              <h4 className="text-[12px] sm:text-[14px] font-bold text-white truncate hover:underline cursor-pointer tracking-tight">
                {currentPodcast?.title || 'Untitled'}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 hover:text-white transition-colors cursor-pointer truncate font-semibold">
                {currentPodcast?.author || currentPodcast?.uploadedBy?.name || 'VoiceCast Artist'}
              </p>
            </div>
          </div>

          {/* Main Player Controls */}
          <div className="flex flex-col items-center gap-2 flex-1 max-w-[50%] sm:max-w-[40%] w-full">
            <div className="flex items-center gap-4 sm:gap-6 text-zinc-400">
              <Shuffle 
                size={14} 
                onClick={() => setIsShuffle(!isShuffle)}
                className={`transition-colors cursor-pointer hidden xs:block ${isShuffle ? 'text-spotify-green' : 'hover:text-white'}`} 
              />
              <SkipBack size={20} sm:size={22} fill="currentColor" className="hover:text-white transition-colors cursor-pointer" onClick={onPrevious} />
              <button
                onClick={() => onPlayPause?.()}
                className="bg-white rounded-full p-2 sm:p-2.5 hover:scale-105 active:scale-95 transition-all text-black shadow-lg flex items-center justify-center"
              >
                {isPlaying ? <Pause fill="black" size={20} sm:size={24} /> : <Play fill="black" size={20} sm:size={24} className="ml-0.5 sm:ml-1" />}
              </button>
              <SkipForward size={20} sm:size={22} fill="currentColor" className="hover:text-white transition-colors cursor-pointer" onClick={onNext} />
              <Repeat 
                size={14} 
                onClick={toggleRepeat}
                className={`transition-colors cursor-pointer hidden xs:block ${isRepeat ? 'text-spotify-green' : 'hover:text-white'}`} 
              />
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center gap-2 sm:gap-3 w-full max-w-lg group">
              <span className="text-[9px] sm:text-[11px] text-zinc-500 font-bold min-w-[30px] sm:min-w-[35px] text-right">{formatTime(progress)}</span>
              <div className="h-1 flex-1 bg-zinc-700 rounded-full relative group-hover:h-1.5 transition-all flex items-center">
                <div className="h-full bg-spotify-green rounded-full absolute top-0 left-0 pointer-events-none" style={{ width: `${progressPercent}%` }} />
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span className="text-[9px] sm:text-[11px] text-zinc-500 font-bold min-w-[30px] sm:min-w-[35px]">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="hidden sm:flex items-center gap-4 w-[30%] justify-end text-zinc-400">
            <Volume2 size={20} className="hover:text-white transition-colors cursor-pointer" />
            <div className="w-24 h-1 bg-zinc-700 rounded-full group relative hover:h-1.5 transition-all flex items-center">
               <div className="h-full bg-spotify-green rounded-full absolute top-0 left-0 pointer-events-none" style={{ width: `${volumePercent}%` }} />
               <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolume}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
            </div>
            <Maximize2 size={18} className="hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      )}
    </>
  );
};

export default Player;
