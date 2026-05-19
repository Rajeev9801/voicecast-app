import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Mic, Trash2, Search, ExternalLink, Calendar, User, CheckCircle, Clock } from 'lucide-react';

export default function AdminRecordings() {
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecordings();
  }, []);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllRecordingsAdmin();
      setRecordings(data);
    } catch (err) {
      toast.error('Failed to intercept recording data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this raw voice recording?')) return;
    try {
      await userService.deleteRecordingAdmin(id);
      toast.success('Recording purged');
      setRecordings(recordings.filter(r => r._id !== id));
    } catch (err) {
      toast.error('Purge failed');
    }
  };

  const filtered = recordings.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <div className="text-blue-500 font-bold mono animate-pulse tracking-widest text-xs uppercase">Intercepting Voice Packets...</div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-4 tracking-tighter uppercase">
            <Mic className="text-blue-500" size={40} /> Signal interceptor
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Monitoring {recordings.length} raw voice captures</p>
        </div>

        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search recordings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl backdrop-blur-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-800 bg-black/20">
                <th className="px-8 py-6">Voice Signal</th>
                <th className="px-8 py-6">Source Node</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {filtered.map(r => (
                <tr key={r._id} className="hover:bg-white/[0.03] transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform shadow-inner">
                         <Mic size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-zinc-200">{r.title}</div>
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                           <Clock size={10} /> {r.duration || '0:00'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-zinc-600" />
                      <div className="text-[11px] font-bold text-zinc-300">{r.user?.name || 'UNKNOWN'}</div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-green-500">
                      <CheckCircle size={10} /> Captured
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <a 
                        href={`${import.meta.env.VITE_API_URL || 'https://voicecast-app-production.up.railway.app'}${r.url}`}

                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl text-zinc-600 hover:text-white hover:bg-zinc-800 transition-all active:scale-90"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <button 
                        onClick={() => handleDelete(r._id)}
                        className="p-3 rounded-xl text-zinc-600 hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center text-zinc-600 font-mono uppercase tracking-[0.3em] text-xs">Zero Signal Intercepted</div>
        )}
      </motion.div>
    </div>
  );
}
