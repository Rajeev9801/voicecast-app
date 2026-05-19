import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageSquare, X, Info, Command } from 'lucide-react';
import { getVoiceHint } from '../utils/voiceCommandHandler';

export default function FloatingMic({
  isListening,
  onStart,
  onStop,
  transcript,
  aiResponse,
  error,
  isSupported
}) {
  const [showHints, setShowHints] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');

  useEffect(() => {
    if (transcript) {
      setLastTranscript(transcript);
      const timer = setTimeout(() => setLastTranscript(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [transcript]);

  const handleMicClick = () => {
    if (!isSupported) return;
    if (isListening) onStop?.();
    else onStart?.();
  };

  return (
    <div className="fixed bottom-32 right-8 flex flex-col items-end gap-6 z-50">
      <AnimatePresence>
        {/* Voice Hints Panel */}
        {showHints && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-zinc-900/95 backdrop-blur-xl border border-green-500/30 p-6 rounded-3xl max-w-sm w-80 text-sm text-zinc-300 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-zinc-800"
          >
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Command size={18} className="text-green-500" />
                <span className="font-bold text-white tracking-tight">Voice Commands</span>
              </div>
              <button 
                onClick={() => setShowHints(false)} 
                className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X size={18} className="text-zinc-500" />
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              <div className="grid gap-3">
                {getVoiceHint().split('\n').filter(line => line.trim()).map((hint, i) => (
                  <div key={i} className="flex items-start gap-3 bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 hover:border-green-500/30 transition-colors">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                    <span className="text-zinc-400 font-medium leading-relaxed">{hint}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Response Bubble */}
        {aiResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="bg-white text-black px-6 py-4 rounded-[2rem] rounded-br-none text-sm font-bold shadow-2xl max-w-xs border border-zinc-200 relative group"
          >
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white rotate-45 border-r border-b border-zinc-200" />
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-1.5 rounded-full shrink-0">
                <MessageSquare size={16} className="text-green-600" />
              </div>
              <p className="leading-snug">{aiResponse}</p>
            </div>
          </motion.div>
        )}

        {/* Transcript Display */}
        {lastTranscript && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-zinc-900/80 backdrop-blur-md text-green-500 px-5 py-3 rounded-2xl text-xs font-bold max-w-xs border border-green-500/20 shadow-xl italic tracking-wide"
          >
            <span className="text-zinc-500 mr-2 uppercase tracking-tighter not-italic">Heard:</span>
            "{lastTranscript}"
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500 text-white px-5 py-3 rounded-2xl text-xs font-bold max-w-xs border border-red-400 shadow-xl flex items-center gap-3"
          >
            <Info size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Mic Button Area */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={() => setShowHints(!showHints)}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 hover:border-green-500/50 transition-all"
        >
          <span className="text-[10px] text-zinc-500 group-hover:text-green-500 transition-colors font-black uppercase tracking-[0.2em]">
            Help Commands
          </span>
        </button>

        <div className="relative">
          <AnimatePresence>
            {isListening && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-green-500 rounded-full"
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
                  className="absolute inset-0 bg-green-400 rounded-full"
                />
              </>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMicClick}
            className={`
              relative w-24 h-24 rounded-full flex items-center justify-center
              transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.3)] z-10
              ${!isSupported ? 'bg-zinc-800 opacity-50 cursor-not-allowed grayscale' : 
                isListening
                ? 'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                : 'bg-zinc-900 border-2 border-zinc-800 hover:border-green-500/50'}
            `}
          >
            {isListening ? (
              <Mic size={36} className="text-black" />
            ) : (
              <MicOff size={36} className="text-zinc-400" />
            )}
            
            {!isSupported && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                <X size={24} className="text-red-500" />
              </div>
            )}
          </motion.button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${isListening ? 'text-green-500' : 'text-zinc-600'}`}>
            {isListening ? 'System Active' : 'System Idle'}
          </div>
          {isListening && (
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 12, 4] }}
                  transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                  className="w-1 bg-green-500 rounded-full"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
