import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, 'listener');
      toast.success('Welcome back!');
      navigate('/');
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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900/50 backdrop-blur-2xl p-8 rounded-[2rem] border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Welcome Back</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Access your personalized podcast experience</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                placeholder="email@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${rememberMe ? 'bg-green-500 border-green-500' : 'border-zinc-700 group-hover:border-zinc-500'}`}>
                  {rememberMe && <CheckCircle2 size={14} className="text-black" />}
                </div>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Remember me</span>
            </label>
            <Link to="/forgot-password" title="Reset your password" className="text-[10px] font-bold text-green-500 uppercase tracking-widest hover:text-green-400 transition-colors">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-green-500/20 uppercase tracking-[0.2em] text-xs mt-4"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            New to VoiceCast?{' '}
            <Link to="/register" className="text-green-500 hover:text-green-400 transition-colors ml-1">Register Here</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default UserLogin;
