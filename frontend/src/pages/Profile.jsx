import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Edit2, LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-black text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl backdrop-blur-sm"
      >
        {/* Header/Cover */}
        <div className="h-48 bg-gradient-to-r from-zinc-800 to-zinc-900 relative">
          <div className="absolute -bottom-16 left-12">
            <div className="w-32 h-32 bg-zinc-900 rounded-full border-4 border-black flex items-center justify-center shadow-2xl overflow-hidden">
               <User size={64} className="text-zinc-700" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 px-12 pb-12">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase">{user.name}</h1>
              <p className="text-zinc-500 font-bold text-sm uppercase tracking-[0.2em] mt-1">{user.role}</p>
            </div>
            <button className="bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <InfoItem icon={<Mail className="text-green-500" />} label="Email Address" value={user.email || 'N/A'} />
              <InfoItem icon={<Shield className="text-blue-500" />} label="Account Type" value={user.role === 'admin' ? 'System Administrator' : 'Standard User'} />
            </div>
            <div className="space-y-6">
              <InfoItem icon={<Calendar className="text-purple-500" />} label="Joined VoiceCast" value={new Date().toLocaleDateString()} />
              <InfoItem icon={<Edit2 className="text-orange-500" />} label="Last Updated" value="Today" />
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-zinc-800">
             <button 
              onClick={() => { logout(); navigate('/login'); }}
              className="flex items-center gap-3 text-red-500 hover:text-red-400 font-black text-xs uppercase tracking-widest transition-colors"
            >
              <LogOut size={16} /> Sign Out of Session
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 group">
      <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700 group-hover:border-zinc-500 transition-colors shadow-inner">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</p>
        <p className="text-zinc-200 font-bold">{value}</p>
      </div>
    </div>
  );
}
