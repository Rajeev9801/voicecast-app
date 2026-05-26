import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { User, Mic, ListMusic, History, Heart, Edit2, Save, X, LogOut, Play } from 'lucide-react';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { playPodcast } = useVoice();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      const profileData = data?.success ? data.data : data;
      if (profileData) {
        setProfile(profileData);
        setEditForm({ name: profileData.name || '', email: profileData.email || '' });
      }
      
      const historyRes = await userService.getHistory();
      const historyList = historyRes?.success ? historyRes.data : (historyRes?.history || historyRes);
      setHistory(Array.isArray(historyList) ? historyList : []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(editForm);
      toast.success('Profile updated!');
      setIsEditing(false);
      fetchProfileData();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading your space...</div>;

  const safeProfile = profile || {
    name: user?.name || "User",
    email: user?.email || "N/A",
    avatar: null,
    role: user?.role || 'user',
    playlists: [],
    likedSongs: [],
    recordings: []
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-black text-white">
      <div className="flex flex-col lg:flex-row gap-10 mb-16">
        {/* Profile Section */}
        <div className="lg:w-1/3">
          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-green-500" />
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-zinc-800 rounded-full flex items-center justify-center mb-6 border-4 border-zinc-800 shadow-2xl overflow-hidden">
                {safeProfile.avatar ? (
                  <img src={safeProfile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-zinc-700" />
                )}
              </div>

              {!isEditing ? (
                <>
                  <h2 className="text-3xl font-black mb-1">{safeProfile.name}</h2>
                  <p className="text-zinc-500 text-sm mb-6">{safeProfile.email}</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    <span className="px-4 py-1.5 bg-green-500/10 text-green-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {safeProfile.role}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-3.5 rounded-2xl transition-all font-bold text-sm"
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                </>
              ) : (
                <form onSubmit={handleUpdateProfile} className="w-full space-y-4">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none"
                    placeholder="Full Name"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none"
                    placeholder="Email Address"
                  />
                  <div className="flex gap-3">
                    <button type="submit" className="flex-1 bg-green-500 text-black py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-green-600">
                      <Save size={16} /> Save
                    </button>
                    <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-zinc-700 text-white py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-zinc-600">
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </form>
              )}
              
              <button 
                onClick={logout}
                className="mt-8 flex items-center gap-2 text-red-500 hover:text-red-400 text-xs font-black uppercase tracking-widest transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <StatCard variant="simple" label="Playlists" title="Playlists" value={Array.isArray(safeProfile.playlists) ? safeProfile.playlists.length : 0} icon={<ListMusic size={16} />} />
            <StatCard variant="simple" label="Liked" title="Liked" value={Array.isArray(safeProfile.likedSongs) ? safeProfile.likedSongs.length : 0} icon={<Heart size={16} />} />
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:w-2/3 space-y-12">
          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <History className="text-green-500" /> Recently Played
              </h3>
            </div>
            
            {(Array.isArray(history) ? history : []).length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {(Array.isArray(history) ? history : []).slice(0, 5).map((item, idx) => (
                  <div key={idx} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/50 flex items-center justify-between group hover:border-green-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                        <Play size={16} className="group-hover:text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{item.podcast?.title || 'Unknown Title'}</h4>
                        <p className="text-xs text-zinc-500">{item.podcast?.author || 'VoiceCast'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-zinc-600 uppercase">{new Date(item.listenedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-zinc-900/20 rounded-3xl border-2 border-dashed border-zinc-800">
                <p className="text-zinc-600 text-sm">Your listening history is empty.</p>
              </div>
            )}
          </section>

          {/* Recordings Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Mic className="text-green-500" /> My Recordings
              </h3>
              <a href="/record" className="text-xs font-black text-green-500 uppercase tracking-widest hover:underline">New Recording</a>
            </div>
            
            {safeProfile.recordings?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {safeProfile.recordings.map(rec => (
                  <div key={rec._id || rec.url} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-5">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500 shadow-inner">
                      <Mic size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{rec.title}</h4>
                      <p className="text-[10px] font-black text-zinc-500 uppercase mt-1">{new Date(rec.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-zinc-900/20 rounded-3xl border-2 border-dashed border-zinc-800">
                <p className="text-zinc-600 text-sm mb-6">Capture your thoughts and share them with the world.</p>
                <a href="/record" className="bg-green-500 text-black px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform inline-block">
                  Go to Studio
                </a>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
