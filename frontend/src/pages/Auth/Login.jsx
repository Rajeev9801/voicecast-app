import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("📨 [LOGIN] Submitting credentials for:", email);
      const user = await login(email, password);
      console.log("✅ [LOGIN] Login successful. Role:", user.role);
      toast.success('Welcome back!');
      
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("❌ [LOGIN] Login failed:", err);
      toast.error(typeof err === 'string' ? err : 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-zinc-800"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
          <p className="text-zinc-400 mt-2">Sign in to continue to VoiceCast</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-8 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-green-500 hover:underline">
            Register now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
