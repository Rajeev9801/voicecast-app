import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('listener');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      console.log("📨 [REGISTER] Submitting registration payload:", { name, email, password, role });
      await register(name, email, password, role);
      toast.success('Registration successful! Please verify your email.');
      navigate(`/verify-otp?email=${email}`);
    } catch (err) {
      console.error("❌ [REGISTER] Registration failed:", err);
      toast.error(typeof err === 'string' ? err : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Join VoiceCast</h2>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Create your account to start listening</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Confirm</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">I want to be a:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-green-500 transition-colors appearance-none cursor-pointer"
            >
              <option value="listener">Listener</option>
              <option value="artist">Artist / Creator</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-500/20 uppercase tracking-[0.2em] text-xs mt-6"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-zinc-500 mt-8 text-[10px] font-bold uppercase tracking-widest">
          Already have an account?{' '}
          <Link to="/login/user" className="text-green-500 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
