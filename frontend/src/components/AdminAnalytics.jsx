import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#eab308', '#ef4444', '#06b6d4'];

export default function AdminAnalytics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalArtists: 0,
    categoryData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userService.getStatsAdmin();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return null;

  const comparisonData = [
    { name: 'Users', count: stats.totalUsers },
    { name: 'Artists', count: stats.totalArtists }
  ];

  // Specific weekly data as requested
  const podcastWeeklyData = [
    { week: "May 1st Week", podcasts: 3 },
    { week: "May 2nd Week", podcasts: 6 },
    { week: "May 3rd Week", podcasts: 9 },
    { week: "May 4th Week", podcasts: 12 }
  ];

  return (
    <div className="space-y-8 mb-16">
      {/* SECTION HEADING */}
      <div className="flex items-center gap-4 mb-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
        <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
          <Activity size={32} className="text-green-500" /> Podcast Analytics
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GROWTH OF USERS BAR CHART */}
        <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl backdrop-blur-sm group hover:border-blue-500/20 transition-all duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
              <TrendingUp size={24} className="text-blue-500" /> Growth of Users
            </h3>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Platform Reach</span>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a" 
                  fontSize={10} 
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" barSize={35} radius={[10, 10, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Users' ? '#3b82f6' : '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COUNT OF PODCASTS LINE CHART */}
        <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl backdrop-blur-sm group hover:border-cyan-500/20 transition-all duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
              <Activity size={24} className="text-cyan-500" /> Count of Podcasts
            </h3>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Weekly Growth</span>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={podcastWeeklyData}>
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis 
                  dataKey="week" 
                  stroke="#71717a" 
                  fontSize={10} 
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                  ticks={[0, 3, 6, 9, 12, 15, 18]}
                  domain={[0, 18]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="podcasts" 
                  stroke="#06b6d4" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#06b6d4', strokeWidth: 2, stroke: '#18181b' }}
                  activeDot={{ r: 8, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
                  filter="url(#glow)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CATEGORY DISTRIBUTION PIE CHART */}
      {stats.categoryData.length > 0 && stats.categoryData[0].value > 0 && (
        <div className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-zinc-800 shadow-2xl backdrop-blur-sm group hover:border-green-500/20 transition-all duration-500">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter">
              <PieChartIcon size={24} className="text-green-500" /> Content Distribution
            </h3>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">By Category</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
