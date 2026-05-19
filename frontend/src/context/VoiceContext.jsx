import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { podcastService } from '../services/podcastService';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { useAuth } from './AuthContext';

const VoiceContext = createContext(null);

export const useVoice = () => useContext(VoiceContext);

export const VoiceProvider = ({ children }) => {
  const navigate = useNavigate();
  const { logout: authLogout } = useAuth();
  const audioRef = useRef(null);
  
  const [podcasts, setPodcasts] = useState([]);
  const [currentPodcast, setCurrentPodcast] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const { 
    isListening, 
    transcript, 
    aiResponse, 
    error: voiceError, 
    status,
    startListening, 
    stopListening,
    speak,
    isSupported
  } = useVoiceAssistant();

  const updateVolume = useCallback((newVol) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    setIsMuted(false);
    if (audioRef.current) audioRef.current.volume = clamped;
    window.dispatchEvent(new CustomEvent('volume-change', { 
      detail: { volume: clamped, muted: false } 
    }));
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (audioRef.current) audioRef.current.muted = newMuted;
    window.dispatchEvent(new CustomEvent('volume-change', { 
      detail: { volume: volume, muted: newMuted } 
    }));
    speak(newMuted ? "Muted" : "Unmuted");
  }, [isMuted, volume, speak]);

  const playPodcast = useCallback(async (podcast) => {
    if (!podcast) return;
    console.log("PLAYING PODCAST:", podcast.title);
    setCurrentPodcast(podcast);
    try {
      let audioUrl = podcast.audio || podcast.audioUrl;
      if (podcast.source === 'itunes' && podcast.feedUrl) {
        const episodes = await podcastService.getFeedEpisodes(podcast.feedUrl);
        if (episodes?.length > 0) audioUrl = episodes[0].audio || episodes[0].audioUrl;
      }

      if (audioUrl && audioRef.current) {
        const baseUrl = import.meta.env.VITE_API_URL || 'https://voicecast-app-production.up.railway.app';
        const finalUrl = audioUrl.startsWith('http') ? audioUrl : `${baseUrl}${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
        audioRef.current.pause();
        audioRef.current.src = finalUrl;
        audioRef.current.load();
        audioRef.current.volume = volume;
        audioRef.current.muted = isMuted;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      }
    } catch (err) {
      console.error("Playback error:", err);
      showToast('Audio source error');
    }
  }, [showToast, volume, isMuted]);

  const handleNext = useCallback(() => {
    if (podcasts.length === 0) return;
    const idx = podcasts.findIndex(p => p.id === currentPodcast?.id || p._id === currentPodcast?._id);
    const nextIdx = (idx + 1) % podcasts.length;
    playPodcast(podcasts[nextIdx]);
  }, [podcasts, currentPodcast, playPodcast]);

  const handlePrev = useCallback(() => {
    if (podcasts.length === 0) return;
    const idx = podcasts.findIndex(p => p.id === currentPodcast?.id || p._id === currentPodcast?._id);
    const prevIdx = (idx - 1 + podcasts.length) % podcasts.length;
    playPodcast(podcasts[prevIdx]);
  }, [podcasts, currentPodcast, playPodcast]);

  const toggleMic = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  // GLOBAL voiceAI ENGINE
  useEffect(() => {
    window.voiceAI = {
      execute: async (text) => {
        console.log("COMMAND MATCHED:", text);
        const cmd = text.toLowerCase().trim();
        
        // Navigation Commands
        if (cmd.match(/open home|go home|home/)) { 
          navigate("/"); 
          speak("Opening home"); 
          return; 
        }
        if (cmd.match(/open dashboard|dashboard/)) { 
          navigate("/dashboard"); 
          speak("Opening dashboard"); 
          return; 
        }
        if (cmd.match(/open admin|admin panel/)) { 
          navigate("/admin/login"); 
          speak("Opening admin panel"); 
          return; 
        }
        if (cmd.match(/open search|search podcasts/)) { 
          navigate("/search"); 
          speak("Opening search"); 
          return; 
        }
        if (cmd.match(/open library|library/)) { 
          navigate("/library"); 
          speak("Opening library"); 
          return; 
        }
        if (cmd.match(/open liked|liked songs/)) { 
          navigate("/liked"); 
          speak("Opening liked songs"); 
          return; 
        }
        if (cmd.match(/open recording studio|go to recording studio|recording studio/)) { 
          navigate("/record"); 
          speak("Opening recording studio"); 
          return; 
        }
        if (cmd.match(/open create playlist|create playlist/)) { 
          navigate("/create-playlist"); 
          speak("Opening create playlist"); 
          return; 
        }
        if (cmd === "logout" || cmd === "sign out") {
          authLogout();
          navigate("/login");
          speak("Logging you out");
          return;
        }

        // Recording Commands
        if (cmd.match(/start recording|begin recording/)) {
          window.dispatchEvent(new CustomEvent("voice-record-start"));
          speak("Starting recording");
          return;
        }
        if (cmd.match(/stop recording|end recording/)) {
          window.dispatchEvent(new CustomEvent("voice-record-stop"));
          speak("Stopping recording");
          return;
        }

        // Playback Commands
        if (cmd.match(/^play$|^resume$|^start music/)) {
          if (audioRef.current && currentPodcast) {
            audioRef.current.play();
            setIsPlaying(true);
            speak("Resuming podcast");
          } else {
            speak("No podcast selected to play");
          }
          return;
        }
        if (cmd.match(/^stop$|^pause$|^stop music/)) {
          audioRef.current?.pause();
          setIsPlaying(false);
          speak("Podcast stopped");
          return;
        }

        // Volume Commands
        if (cmd.match(/volume up|increase volume|tez karo/)) {
          updateVolume(volume + 0.15);
          speak("Volume increased");
          return;
        }
        if (cmd.match(/volume down|decrease volume|dheere karo/)) {
          updateVolume(volume - 0.15);
          speak("Volume decreased");
          return;
        }
        if (cmd === "mute") {
          if (!isMuted) toggleMute();
          return;
        }
        if (cmd === "unmute") {
          if (isMuted) toggleMute();
          return;
        }

        // Search and Play Command
        if (cmd.startsWith("search ")) {
          const query = cmd.replace("search", "").trim();
          navigate(`/search?q=${query}`);
          window.dispatchEvent(new CustomEvent('voice-search', { detail: query }));
          
          const results = await podcastService.search(query);
          if (results.length > 0) {
            speak(`Searching for ${query}. Found ${results[0].title}.`);
          } else {
            speak(`Searching for ${query}`);
          }
          return;
        }

        if (cmd.startsWith("play ")) {
          const query = cmd.replace("play", "").replace("podcast", "").trim();
          const results = await podcastService.search(query);
          if (results.length > 0) {
            playPodcast(results[0]);
            speak(`Playing ${results[0].title}`);
          } else {
            speak(`Could not find podcast ${query}`);
          }
          return;
        }

        // Other existing commands (simplified)
        if (cmd.includes("next") || cmd.includes("skip")) { handleNext(); speak("Next"); return; }
        if (cmd.includes("previous") || cmd.includes("back")) { handlePrev(); speak("Previous"); return; }

        console.log("NO MATCHING ACTION FOR:", text);
      }
    };
  }, [navigate, handleNext, handlePrev, playPodcast, speak, authLogout, currentPodcast, volume, isMuted, updateVolume, toggleMute]);

  return (
    <VoiceContext.Provider value={{
      toast, audioRef, podcasts, setPodcasts, currentPodcast, isPlaying,
      playPodcast, handleNext, handlePrev, showToast, setIsPlaying, speak,
      isListening, transcript, aiResponse, voiceError, status, startListening, stopListening, toggleMic, isSupported,
      togglePlayPause, volume, setVolume: updateVolume, isMuted, toggleMute
    }}>
      {children}
    </VoiceContext.Provider>
  );
};
