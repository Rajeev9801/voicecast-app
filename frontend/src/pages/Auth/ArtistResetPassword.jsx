import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Music } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-toastify';

const ArtistResetPassword = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const otp = searchParams.get('otp');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (!email || !otp) {
      setError('Invalid or missing reset link. Please request a new password reset.');
    }
  }, [email, otp]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !otp) {
      return toast.error('Invalid reset link');
    }

    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      const { data } = await api.post('/api/artists/reset-password', { 
        email, 
        otp, 
        password 
      });
      toast.success(data.message || 'Artist password reset successful');
      navigate('/login/artist');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password';
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (error && !loading && (!password || !confirmPassword)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-red-500/20 shadow-2xl"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mb-4">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Something went wrong</h1>
          <p className="text-zinc-400 mb-8">{error}</p>
          <button
            onClick={() => navigate('/artist/forgot-password')}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-2xl transition-all uppercase tracking-widest text-xs"
          >
            Go back to Forgot Password
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <Music className="text-green-500" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">New Key</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Create a strong new password for your artist account</p>
          {email && <p className="text-green-500 mt-2 text-[10px] lowercase font-medium opacity-50">{email}</p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-green-500 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-zinc-700 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Confirm Identity Key</label>
            <div className="relative group">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-green-500 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/40 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-700 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                placeholder="••••••••"
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
              <span>Establish Identity</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ArtistResetPassword;
