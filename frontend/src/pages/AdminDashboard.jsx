import React, { useEffect, useState } from 'react';
import { userService } from '../services/userService';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Users, Mic, Radio, ShieldAlert, BarChart3, Activity, TrendingUp, UserPlus, Clock, Play, Server, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({ 
    totalUsers: 0, 
    totalPodcasts: 0, 
    totalRecordings: 0,
    totalCreators: 0,
    totalPlays: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, usersData] = await Promise.all([
        userService.getAnalytics(),
        userService.getAllUsersAdmin()
      ]);
      
      setAnalytics(analyticsData || { 
        totalUsers: 0, 
        totalPodcasts: 0, 
        totalRecordings: 0,
        totalCreators: 0,
        totalPlays: 0
      });
      setRecentUsers(Array.isArray(usersData) ? usersData.slice(0, 5) : []);
    } catch (err) {
      console.error('Dashboard data sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-6" />
      <div className="text-green-500 font-black mono animate-pulse uppercase tracking-[0.4em] text-xs">System Status: Operational</div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-black text-white font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black flex items-center gap-4 tracking-tighter uppercase">
            <ShieldAlert className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" size={48} /> 
            Command Center
          </h1>
          <p className="text-zinc-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Infrastructure Monitoring & System Override</p>
        </div>
        <div className="flex items-center gap-4 bg-zinc-900/80 border border-zinc-800 px-6 py-3 rounded-2xl backdrop-blur-md shadow-2xl">
          <Activity size={18} className="text-green-500 animate-bounce" />
          <span className="text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase">CORE STATUS: OPTIMAL</span>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
         <ActionButton icon={<Users />} label="Manage Users" onClick={() => navigate('/admin/users')} color="blue" />
         <ActionButton icon={<Radio />} label="Broadcasting" onClick={() => navigate('/admin/podcasts')} color="green" />
         <ActionButton icon={<Mic />} label="Recordings" onClick={() => navigate('/admin/recordings')} color="purple" />
         <ActionButton icon={<Zap />} label="Override" onClick={() => toast.info('Override Protocol Active')} color="red" />
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <StatCard icon={<Users />} title="Total Identities" value={analytics.totalUsers} color="blue" subtitle="Registered Nodes" />
        <StatCard icon={<Play />} title="Total Plays" value={analytics.totalPlays || 0} color="green" subtitle="Consumption" />
        <StatCard icon={<Radio />} title="Broadcast Assets" value={analytics.totalPodcasts} color="purple" subtitle="Live Streams" />
        <StatCard icon={<UserPlus />} title="Active Creators" value={analytics.totalCreators || 0} color="yellow" subtitle="Verified Nodes" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* RECENT ACTIVITY TABLE */}
        <section className="xl:col-span-2 bg-zinc-900/40 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl backdrop-blur-sm group hover:border-red-600/20 transition-all duration-500">
          <div className="p-8 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
            <h2 className="text-2xl font-black flex items-center gap-3 uppercase tracking-tighter">
              <Clock size={24} className="text-blue-500" /> Recent Arrivals
            </h2>
            <button 
              onClick={() => navigate('/admin/users')}
              className="text-[10px] font-black text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              View Full Log
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-800 bg-black/20">
                  <th className="px-8 py-5">Node Identity</th>
                  <th className="px-8 py-5">Auth Level</th>
                  <th className="px-8 py-5 text-right">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {recentUsers.map(u => (
                  <tr key={u._id} className="hover:bg-white/[0.03] transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 font-bold border border-zinc-700/50 group-hover:border-blue-500/50 transition-all">
                          {u.name?.[0] || '?'}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-zinc-200">{u.name}</div>
                          <div className="text-[10px] text-zinc-500 font-medium tracking-tight">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        u.role === 'admin' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        u.role === 'podcaster' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                      {u.createdAt && u.createdAt !== 'INVALID DATE' 
                        ? new Date(u.createdAt).toLocaleDateString() 
                        : 'New Node'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SYSTEM PERFORMANCE */}
        <div className="space-y-6">
          <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl backdrop-blur-sm hover:border-green-500/20 transition-all duration-500">
            <h3 className="text-lg font-black mb-6 uppercase tracking-tighter flex items-center gap-3">
              <Server size={20} className="text-green-500" /> System Vitals
            </h3>
            <div className="space-y-6">
               <VitalBar label="Network Latency" value="12ms" percent={12} color="green" />
               <VitalBar label="Voice Engine Load" value="45%" percent={45} color="blue" />
               <VitalBar label="Database Uptime" value="99.9%" percent={99} color="purple" />
               <VitalBar label="API Throughput" value="1.2k/s" percent={82} color="yellow" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600/10 to-transparent p-8 rounded-[2.5rem] border border-red-900/20 shadow-2xl flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                <ShieldAlert className="text-red-500 animate-pulse" size={32} />
             </div>
             <h3 className="text-sm font-black uppercase tracking-widest text-red-500 mb-2">Security override</h3>
             <p className="text-xs text-zinc-500 leading-relaxed font-medium">All administrative actions are logged. Unauthorized manipulation will trigger system lockdown.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, subtitle }) {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
  };

  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-zinc-900/60 p-8 rounded-[2.5rem] border border-zinc-800 relative group hover:border-zinc-700 transition-all duration-300 shadow-xl overflow-hidden"
    >
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-110 transition-all duration-700">
         {React.cloneElement(icon, { size: 120 })}
      </div>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border ${colorMap[color]} shadow-inner`}>
        {React.cloneElement(icon, { size: 32 })}
      </div>
      <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</h3>
      <p className="text-5xl font-black mt-2 tracking-tighter text-white">{value}</p>
      <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-2">{subtitle}</div>
    </motion.div>
  );
}

function ActionButton({ icon, label, onClick, color }) {
  const colorClasses = {
    blue: 'hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/5',
    green: 'hover:text-green-400 hover:border-green-500/30 hover:bg-green-500/5',
    purple: 'hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/5',
    red: 'hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/5'
  };

  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl transition-all duration-300 group ${colorClasses[color]}`}
    >
      <div className="text-zinc-500 group-hover:scale-110 transition-transform">
         {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-inherit">{label}</span>
    </button>
  );
}

function VitalBar({ label, value, percent, color }) {
  const colorMap = {
    green: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]',
    blue: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    purple: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    yellow: 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
        <span className="text-zinc-500">{label}</span>
        <span className="text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${colorMap[color]}`}
        />
      </div>
    </div>
  );
}
