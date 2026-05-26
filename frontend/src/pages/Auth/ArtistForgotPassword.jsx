import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Send, Music } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

const ArtistForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/api/artists/forgot-password', { email });
      toast.success(data.message);
      navigate(`/artist/verify-reset-otp?email=${email}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]"
      >
        <button 
          onClick={() => navigate('/login/artist')}
          className="flex items-center gap-2 text-zinc-500 hover:text-green-500 transition-colors mb-6 text-[10px] font-black uppercase tracking-widest group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4">
            <Music className="text-green-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Artist Reset</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Enter artist email to receive security code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black hover:bg-green-500 hover:text-white disabled:bg-zinc-800 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-xl uppercase tracking-[0.2em] text-xs mt-4 flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send size={16} />
                <span>Send Reset Code</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-8">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Found your credentials?{' '}
            <Link to="/login/artist" className="text-green-500 hover:text-green-400 transition-colors ml-1">Artist Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ArtistForgotPassword;
