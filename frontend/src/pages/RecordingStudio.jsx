import React, { useEffect, useRef, useState } from 'react';
import { useRecorder } from '../hooks/useRecorder';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { toast } from 'react-toastify';
import { Mic, Square, Play, Pause, Trash2, Upload, Volume2 } from 'lucide-react';

export default function RecordingStudio() {
  const { user } = useAuth();
  const { 
    isRecording, 
    isPaused, 
    audioBlob, 
    recordingTime, 
    startRecording, 
    stopRecording, 
    pauseRecording, 
    resumeRecording, 
    resetRecording,
    mediaRecorder 
  } = useRecorder();
  
  const canvasRef = useRef(null);
  const analyzerRef = useRef(null);
  const animationIdRef = useRef(null);
  const audioPreviewRef = useRef(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  // Voice Event Listeners
  useEffect(() => {
    const handleVoiceStart = () => {
      if (!isRecording) startRecording();
    };
    const handleVoiceStop = () => {
      if (isRecording) stopRecording();
    };
    const handleVoicePause = () => {
      if (isRecording && !isPaused) pauseRecording();
    };
    const handleVoiceResume = () => {
      if (isRecording && isPaused) resumeRecording();
    };
    const handleVoiceSave = () => {
      if (audioBlob && title) handleUpload();
      else if (!title) toast.info('Please set a title first (say "Search [Title]" or type it)');
    };

    window.addEventListener('voice-record-start', handleVoiceStart);
    window.addEventListener('voice-record-stop', handleVoiceStop);
    window.addEventListener('voice-record-pause', handleVoicePause);
    window.addEventListener('voice-record-resume', handleVoiceResume);
    window.addEventListener('voice-record-save', handleVoiceSave);

    return () => {
      window.removeEventListener('voice-record-start', handleVoiceStart);
      window.removeEventListener('voice-record-stop', handleVoiceStop);
      window.removeEventListener('voice-record-pause', handleVoicePause);
      window.removeEventListener('voice-record-resume', handleVoiceResume);
      window.removeEventListener('voice-record-save', handleVoiceSave);
    };
  }, [isRecording, startRecording, stopRecording, audioBlob, title]);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [audioBlob]);

  // Waveform visualization
  useEffect(() => {
    if (isRecording && !isPaused && mediaRecorder && canvasRef.current) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(mediaRecorder.stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        animationIdRef.current = requestAnimationFrame(draw);
        analyzer.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgb(18, 18, 18)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;
          ctx.fillStyle = `rgb(34, 197, 94)`; // Green-500
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      };

      draw();

      return () => {
        cancelAnimationFrame(animationIdRef.current);
        audioContext.close();
      };
    }
  }, [isRecording, isPaused, mediaRecorder]);

  const handleUpload = async (customTitle = null) => {
    const finalTitle = typeof customTitle === 'string' ? customTitle : title;
    
    if (!audioBlob || !finalTitle) {
        toast.error('Please provide a title and record something first.');
        return;
    }

    setIsUploading(true);

    try {
      // Create a local entry
      const newRecording = {
        _id: `rec-${Date.now()}`,
        title: finalTitle,
        createdAt: new Date().toISOString(),
        url: audioUrl, // In a real app, we'd store the blob in IndexedDB, but for stability mode this works
        author: user?.name || 'Guest User'
      };

      // Update global recordings
      const allRecordings = JSON.parse(localStorage.getItem('voicecast_recordings') || '[]');
      allRecordings.push(newRecording);
      localStorage.setItem('voicecast_recordings', JSON.stringify(allRecordings));

      // Update user's profile recordings
      const userData = JSON.parse(localStorage.getItem('voicecast_user') || '{}');
      userData.recordings = [...(userData.recordings || []), newRecording];
      localStorage.setItem('voicecast_user', JSON.stringify(userData));

      toast.success('Recording published locally!');
    } catch (err) {
      console.error('Local save failed', err);
      toast.error('Failed to save recording');
    } finally {
      setIsUploading(false);
      setTitle('');
      resetRecording();
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-black text-white">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Recording Studio</h1>
        <p className="text-zinc-400">Capture your voice. Build your podcast.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col items-center">
          <div className="relative w-full h-48 bg-zinc-950 rounded-2xl overflow-hidden mb-8 border border-zinc-800">
            <canvas ref={canvasRef} width="800" height="200" className="w-full h-full" />
            {!isRecording && !audioUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                <Mic size={48} className="mb-2 opacity-20" />
                <p>Ready to record</p>
              </div>
            )}
            {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <span className="text-yellow-500 font-bold text-xl uppercase tracking-widest">Paused</span>
                </div>
            )}
          </div>

          <div className="text-6xl font-mono mb-10 text-green-500 tabular-nums">
            {formatTime(recordingTime)}
          </div>

          <div className="flex flex-wrap justify-center gap-4 relative">
            {/* Voice Control Badge */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Voice Control Active</span>
            </div>

            {!isRecording && !isPaused ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-lg shadow-red-500/20"
              >
                <Mic size={20} />
                Start Recording
              </motion.button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={resumeRecording}
                    className="bg-green-500 hover:bg-green-600 text-black px-6 py-4 rounded-full font-bold flex items-center gap-2"
                  >
                    <Play size={20} /> Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseRecording}
                    className="bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-4 rounded-full font-bold flex items-center gap-2"
                  >
                    <Pause size={20} /> Pause
                  </button>
                )}
                <button
                  onClick={stopRecording}
                  className="bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 shadow-lg"
                >
                  <Square size={20} fill="black" /> Stop
                </button>
              </>
            )}
            
            {audioUrl && !isRecording && (
                <button
                    onClick={resetRecording}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-4 rounded-full font-bold flex items-center gap-2"
                >
                    <Trash2 size={20} /> Delete
                </button>
            )}
          </div>

          {audioUrl && !isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 w-full bg-zinc-800/50 p-6 rounded-2xl border border-zinc-700"
            >
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                <Volume2 size={16} /> Preview Recording
              </h3>
              <audio ref={audioPreviewRef} src={audioUrl} controls className="w-full" />
            </motion.div>
          )}
        </div>

        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 sticky top-8">
          <h2 className="text-xl font-bold mb-6">Recording Info</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-sm mb-2 font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Podcast Episode..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>

            <div className="pt-4">
              <button
                disabled={!audioBlob || isUploading || !title}
                onClick={handleUpload}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  audioBlob && title && !isUploading
                    ? 'bg-green-500 text-black hover:bg-green-600 shadow-lg shadow-green-500/20'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                    <>
                        <Upload size={20} />
                        Publish Recording
                    </>
                )}
              </button>
            </div>

            <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-xl text-xs text-zinc-500 space-y-3">
                <p className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">●</span>
                    <span>Make sure you are in a quiet environment for the best audio quality.</span>
                </p>
                <p className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">●</span>
                    <span>Your recording will be saved to your dashboard after publishing.</span>
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
