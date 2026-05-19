import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Search, Mic, User, ShieldAlert, Settings, LogOut, UserCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const { isListening, toggleMic, status, transcript, voiceError } = useVoice();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Status mapping for UI
  const getStatusDisplay = () => {
    switch (status) {
      case 'listening': return { text: 'Listening...', color: 'text-green-500' };
      case 'processing': return { text: 'Processing...', color: 'text-yellow-500' };
      case 'executed': return { text: 'Command Executed', color: 'text-blue-500' };
      case 'error': return { text: voiceError || 'Voice Error', color: 'text-red-500' };
      default: return null;
    }
  };

  const statusDisplay = getStatusDisplay();

  const handleSignOut = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-black/95 backdrop-blur-xl sticky top-0 z-40 px-8 py-4 flex items-center justify-between border-b border-zinc-800 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* LEFT: Navigation and Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2 mr-6">
          <button onClick={() => navigate(-1)} className="p-1.5 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-all hover:bg-zinc-800 border border-zinc-800">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => navigate(1)} className="p-1.5 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-all hover:bg-zinc-800 border border-zinc-800">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="relative group flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search podcasts..."
            className="bg-zinc-900 border border-zinc-800 rounded-full py-2.5 px-10 w-full text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500/20 transition-all outline-none text-white placeholder:text-zinc-500 hover:bg-zinc-800"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery?.(e.target.value)}
          />
          <button
            onClick={toggleMic}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all hover:bg-zinc-800 ${isListening ? 'text-green-500 animate-pulse bg-green-500/10' : 'text-zinc-500'}`}
          >
            <Mic size={16} />
          </button>

          {/* Voice Assistant Feedback Overlay */}
          <AnimatePresence>
            {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-2xl z-50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'error' ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${statusDisplay?.color}`}>
                      {statusDisplay?.text}
                    </span>
                  </div>
                  {transcript && (
                    <span className="text-[10px] text-zinc-500 font-medium italic truncate max-w-[150px]">
                      "{transcript}"
                    </span>
                  )}
                </div>
                {status === 'listening' && !transcript && (
                  <p className="text-[10px] text-zinc-400">Try saying "open dashboard" or "play podcast"</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT: Admin and User Status */}
      <div className="flex items-center gap-3 sm:gap-6 shrink-0">
        {/* 1. CURRENT USER ROLE BADGE (ADMIN ONLY) */}
        {(user?.role === 'admin' || user?.name === 'amit') && (
          <div className="hidden lg:flex bg-red-600/10 border border-red-500/30 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.1)] items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest whitespace-nowrap">
              ROLE: {user?.role || 'user'}
            </span>
          </div>
        )}

        {/* 2. OPEN ADMIN PANEL BUTTON (ADMIN ONLY) */}
        {(user?.role === 'admin' || user?.name === 'amit') && (
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: '#ef4444', boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 bg-red-600 text-white px-4 sm:px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/20 border border-red-500/50 transition-all duration-300 whitespace-nowrap font-black text-[10px] sm:text-xs uppercase tracking-[0.15em]"
          >
            <ShieldAlert size={16} className="text-white" />
            <span className="hidden xs:inline">ADMIN PANEL</span>
            <span className="xs:hidden">ADMIN</span>
          </motion.button>
        )}

        {/* 3. PREMIUM USER PROFILE SECTION */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-4 border-l border-zinc-800 cursor-pointer group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-white leading-none group-hover:text-green-500 transition-colors">{user?.name || 'amit'}</p>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">USER</p>
            </div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${isDropdownOpen ? 'bg-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-zinc-800 border-zinc-700 group-hover:border-zinc-500'}`}>
              <User size={20} className={isDropdownOpen ? 'text-black' : 'text-zinc-400 group-hover:text-white'} />
            </div>
          </div>

          {/* PREMIUM DROPDOWN */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 top-full mt-4 w-56 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-2 z-50 overflow-hidden"
              >
                <div className="px-4 py-3 mb-2 border-b border-white/5">
                   <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Signed in as</p>
                   <p className="text-xs font-bold text-white truncate">{user?.email || 'amit@voicecast.ai'}</p>
                </div>

                <DropdownItem 
                  icon={<UserCircle size={18} />} 
                  label="Profile" 
                  onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }} 
                />
                <DropdownItem 
                  icon={<Settings size={18} />} 
                  label="Settings" 
                  onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }} 
                />
                
                <div className="my-2 h-px bg-white/5" />
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-xs uppercase tracking-widest group"
                >
                  <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

const DropdownItem = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-bold text-xs uppercase tracking-widest group"
  >
    <span className="text-zinc-500 group-hover:text-green-500 transition-colors">{icon}</span>
    {label}
  </button>
);

export default Navbar;
