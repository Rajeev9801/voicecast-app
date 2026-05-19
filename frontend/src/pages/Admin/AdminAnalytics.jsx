import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { BarChart3, TrendingUp, Users, Radio, Mic, Play } from 'lucide-react';

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState({ 
    totalUsers: 0, 
    totalPodcasts: 0, 
    totalRecordings: 0,
    totalCreators: 0,
    totalPlays: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await userService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-green-500 font-mono animate-pulse text-center mt-20 uppercase tracking-[0.3em]">System Analysis in Progress...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-black text-white font-sans">
      <div className="mb-12">
        <h1 className="text-4xl font-black flex items-center gap-4 tracking-tighter uppercase">
          <BarChart3 className="text-purple-500" size={40} /> Global Analytics
        </h1>
        <p className="text-zinc-500 mt-1 font-medium">Detailed performance metrics and network growth</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
         <MetricCard title="User Base" value={analytics.totalUsers} icon={<Users />} color="blue" />
         <MetricCard title="Total Plays" value={analytics.totalPlays} icon={<Play />} color="green" />
         <MetricCard title="Live Assets" value={analytics.totalPodcasts} icon={<Radio />} color="purple" />
         <MetricCard title="Creator Nodes" value={analytics.totalCreators} icon={<TrendingUp />} color="yellow" />
         <MetricCard title="Stored Audio" value={analytics.totalRecordings} icon={<Mic />} color="red" />
      </div>

      <div className="bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 p-10 shadow-2xl backdrop-blur-md">
         <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
            <TrendingUp size={24} className="text-green-500" /> Network Growth
         </h2>
         <div className="h-64 flex items-end gap-2 px-4">
            {[45, 62, 38, 85, 54, 72, 90, 65, 48, 77, 82, 95].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.05, duration: 0.8 }}
                className="flex-1 bg-gradient-to-t from-green-500/20 to-green-500 rounded-t-lg"
              />
            ))}
         </div>
         <div className="flex justify-between mt-6 text-[10px] font-black text-zinc-500 uppercase tracking-widest px-2">
            <span>Jan</span>
            <span>Jun</span>
            <span>Dec</span>
         </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }) {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10',
    green: 'text-green-500 bg-green-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
    yellow: 'text-yellow-500 bg-yellow-500/10',
    red: 'text-red-500 bg-red-500/10'
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-zinc-700 transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colorMap[color]}`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-4xl font-black">{value}</p>
    </div>
  );
}
