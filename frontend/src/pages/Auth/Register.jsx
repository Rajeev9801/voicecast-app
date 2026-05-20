import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("📨 [REGISTER] Submitting new node details for:", email);
      const user = await register(name, email, password, role);
      console.log("✅ [REGISTER] Registration successful. Role:", user.role);
      toast.success('Registration successful! Welcome to VoiceCast.');
      
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("❌ [REGISTER] Registration failed:", err);
      toast.error(typeof err === 'string' ? err : 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900 p-8 rounded-2xl border border-zinc-800"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Join VoiceCast</h2>
          <p className="text-zinc-400 mt-2">Create your account to start listening</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-zinc-400 text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors"
              placeholder="John Doe"
              required
            />
          </div>

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

          <div>
            <label className="block text-zinc-400 text-sm mb-2">I want to be a:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-colors appearance-none"
            >
              <option value="user">Listener</option>
              <option value="podcaster">Podcaster / Creator</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-lg transition-colors mt-4"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-zinc-400 mt-8 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-green-500 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
