import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { podcastService } from '../services/podcastService';
import { useAuth } from '../context/AuthContext';
import { useVoice } from '../context/VoiceContext';
import { toast } from 'react-toastify';
import { Mic, Radio, Upload, Trash2, Edit, BarChart, Users, Play } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function PodcasterDashboard() {
  const { user } = useAuth();
  const { playPodcast } = useVoice();
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalListens: 0, totalFollowers: 0 });

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const fetchCreatorData = async () => {
    try {
      console.log("📊 [CREATOR-HUB] Fetching creator data...");
      const profileData = await userService.getProfile();
      const profile = profileData?.success ? profileData.data : profileData;
      setRecordings(Array.isArray(profile?.recordings) ? profile.recordings : []);
      
      // Fetch podcasts and stats in parallel
      const [myPodcastsRes, creatorStatsRes] = await Promise.all([
        podcastService.getMyPodcasts(),
        userService.getCreatorStats()
      ]);

      const myPodcasts = Array.isArray(myPodcastsRes) ? myPodcastsRes : [];
      const creatorStats = creatorStatsRes?.success ? creatorStatsRes.data : creatorStatsRes;

      console.log("📊 [CREATOR-HUB] Podcasts:", myPodcasts.length);
      console.log("📊 [CREATOR-HUB] Stats:", creatorStats);

      setPodcasts(myPodcasts);
      setStats({
        totalListens: creatorStats?.totalPlays || 0,
        totalFollowers: creatorStats?.totalFollowers || 0
      });
    } catch (err) {
      console.error("🔥 [CREATOR-HUB] Load Failed:", err);
      toast.error('Failed to load creator data');
    } finally {
      setLoading(false);
    }
  };

  const deletePodcast = async (id) => {
    if (!window.confirm('Delete this podcast?')) return;
    try {
      await podcastService.deletePodcast(id);
      toast.success('Podcast deleted');
      setPodcasts(podcasts.filter(p => p._id !== id));
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading creator panel...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold mb-2">Creator Hub</h1>
          <p className="text-zinc-400">Manage your content and track your performance</p>
        </div>
        <button 
          onClick={() => navigate('/add-podcast')}
          className="bg-green-500 text-black font-bold px-6 py-3 rounded-full hover:scale-105 transition-transform"
        >
          Add Podcast
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={<Radio />} title="Total Podcasts" value={podcasts.length} color="green" />
        <StatCard icon={<BarChart />} title="Total Listens" value={stats.totalListens} color="blue" />
        <StatCard icon={<Users />} title="Followers" value={stats.totalFollowers} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Manage Podcasts */}
        <section className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Radio size={20} className="text-green-500" /> My Podcasts
            </h2>
          </div>
          <div className="p-6">
            {podcasts.length > 0 ? (
              <div className="space-y-4">
                {podcasts.map(p => (
                  <div key={p._id} className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <img 
                        src={(p.thumbnail || p.image || '').startsWith('/uploads/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p.thumbnail || p.image}` : (p.thumbnail || p.image || '/default-podcast.png')} 
                        className="w-12 h-12 rounded-lg object-cover" 
                        alt="" 
                        onError={(e) => { e.target.src = '/default-podcast.png'; }}
                      />
                      <div>
                        <h4 className="font-bold text-sm">{p.title}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-zinc-500 uppercase">{p.genre || p.category || 'General'}</p>
                          <span className="text-zinc-700 text-[8px]">•</span>
                          <p className="text-[10px] text-zinc-500">{new Date(p.createdAt || p.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => playPodcast(p)}
                        className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 text-green-500"
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                      <button onClick={() => deletePodcast(p._id)} className="p-2 text-zinc-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-600 py-10">No podcasts uploaded yet.</p>
            )}
          </div>
        </section>

        {/* Recent Recordings */}
        <section className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Mic size={20} className="text-blue-500" /> Recent Recordings
            </h2>
            <a href="/record" className="text-xs text-blue-500 font-bold hover:underline">Open Studio</a>
          </div>
          <div className="p-6">
            {recordings.length > 0 ? (
              <div className="space-y-4">
                {recordings.slice(0, 5).map(r => (
                  <div key={r._id || r.url} className="flex items-center justify-between bg-black/20 p-4 rounded-2xl border border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-blue-500">
                        <Mic size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{r.title}</h4>
                        <p className="text-[10px] text-zinc-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700">
                      <Play size={14} fill="white" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-zinc-600 py-10">No recordings saved.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
