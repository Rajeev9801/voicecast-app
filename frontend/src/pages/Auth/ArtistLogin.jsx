import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Image as ImageIcon, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ArtistLogin = () => {
  const [artistName, setArtistName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, 'artist');
      toast.success('Artist session active');
      navigate('/creator-panel');
    } catch (err) {
      if (err.unverified) {
        toast.warning('Email not verified. Sending new OTP...');
        navigate(`/verify-otp?email=${err.email}`);
        return;
      }
      toast.error(typeof err === 'string' ? err : 'Login failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <User className="text-green-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Artist Login</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Manage your podcast identity</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Artist Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-green-500 transition-colors" size={18} />
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/10 transition-all"
                placeholder="Stage Name"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-green-500 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/10 transition-all"
                placeholder="artist@voicecast.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-green-500 transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/10 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => navigate('/artist/forgot-password')}
                className="text-[10px] font-bold text-zinc-500 hover:text-green-500 uppercase tracking-widest transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 rounded-2xl py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest transition-all group"
            >
              <ImageIcon className="text-zinc-600 group-hover:text-green-500 transition-colors" size={18} />
              <span>Upload Profile Image</span>
              <Upload size={14} className="ml-auto mr-4 opacity-50" />
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black font-black py-4 rounded-2xl transition-all duration-300 hover:bg-green-500 shadow-xl uppercase tracking-[0.2em] text-xs mt-6"
          >
            Enter Studio
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ArtistLogin;
