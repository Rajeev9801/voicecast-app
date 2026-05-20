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
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("title", finalTitle);

      const response = await api.post('/api/recordings', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Also update local cache for UI continuity if needed
      const newRecording = response.data.recording;
      if (newRecording) {
        const allRecordings = JSON.parse(localStorage.getItem('voicecast_recordings') || '[]');
        allRecordings.push(newRecording);
        localStorage.setItem('voicecast_recordings', JSON.stringify(allRecordings));
        
        const userData = JSON.parse(localStorage.getItem('voicecast_user') || '{}');
        userData.recordings = [...(userData.recordings || []), newRecording];
        localStorage.setItem('voicecast_user', JSON.stringify(userData));
      }

      toast.success('Recording published successfully!');
    } catch (err) {
      console.error('Server save failed', err);
      toast.error('Failed to save recording to server');
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
    <div className="p-4 sm:p-8 max-w-5xl mx-auto min-h-screen bg-black text-white">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Recording Studio</h1>
        <p className="text-zinc-400 text-sm sm:text-base">Capture your voice. Build your podcast.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        <div className="w-full lg:w-2/3 bg-zinc-900 p-4 sm:p-8 rounded-3xl border border-zinc-800 flex flex-col items-center">
          <div className="relative w-full h-40 sm:h-48 bg-zinc-950 rounded-2xl overflow-hidden mb-6 sm:mb-8 border border-zinc-800">
            <canvas ref={canvasRef} width="800" height="200" className="w-full h-full" />
            {!isRecording && !audioUrl && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                <Mic size={32} className="sm:size-[48px] mb-2 opacity-20" />
                <p className="text-sm">Ready to record</p>
              </div>
            )}
            {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <span className="text-yellow-500 font-bold text-lg sm:text-xl uppercase tracking-widest">Paused</span>
                </div>
            )}
          </div>

          <div className="text-4xl sm:text-6xl font-mono mb-8 sm:mb-10 text-green-500 tabular-nums">
            {formatTime(recordingTime)}
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4 relative w-full sm:w-auto">
            {/* Voice Control Badge */}
            <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] sm:text-[10px] font-black text-green-500 uppercase tracking-widest">Voice Control Active</span>
            </div>

            {!isRecording && !isPaused ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold flex items-center justify-center gap-3 shadow-lg shadow-red-500/20"
              >
                <Mic size={20} />
                Start Recording
              </motion.button>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 w-full sm:w-auto">
                {isPaused ? (
                  <button
                    onClick={resumeRecording}
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-black px-6 py-4 rounded-full font-bold flex items-center justify-center gap-2"
                  >
                    <Play size={20} /> Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseRecording}
                    className="w-full sm:w-auto bg-zinc-700 hover:bg-zinc-600 text-white px-6 py-4 rounded-full font-bold flex items-center justify-center gap-2"
                  >
                    <Pause size={20} /> Pause
                  </button>
                )}
                <button
                  onClick={stopRecording}
                  className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Square size={20} fill="black" /> Stop
                </button>
              </div>
            )}
            
            {audioUrl && !isRecording && (
                <button
                    onClick={resetRecording}
                    className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-4 rounded-full font-bold flex items-center justify-center gap-2"
                >
                    <Trash2 size={20} /> Delete
                </button>
            )}
          </div>

          {audioUrl && !isRecording && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 sm:mt-10 w-full bg-zinc-800/50 p-4 sm:p-6 rounded-2xl border border-zinc-700"
            >
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                <Volume2 size={16} /> Preview Recording
              </h3>
              <audio ref={audioPreviewRef} src={audioUrl} controls className="w-full" />
            </motion.div>
          )}
        </div>

        <div className="w-full bg-zinc-900 p-6 sm:p-8 rounded-3xl border border-zinc-800 md:sticky md:top-8">
          <h2 className="text-xl font-bold mb-6">Recording Info</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-zinc-400 text-sm mb-2 font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Podcast Episode..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all text-sm sm:text-base"
              />
            </div>

            <div className="pt-2 sm:pt-4">
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

            <div className="bg-green-500/5 border border-green-500/10 p-4 rounded-xl text-[10px] sm:text-xs text-zinc-500 space-y-3">
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
