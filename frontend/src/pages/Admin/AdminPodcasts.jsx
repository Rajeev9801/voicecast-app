import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Radio, Trash2, Search, ExternalLink, Calendar, User } from 'lucide-react';

export default function AdminPodcasts() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllPodcastsAdmin();
      setPodcasts(data);
    } catch (err) {
      toast.error('Failed to intercept broadcast data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePodcast = async (id) => {
    if (!window.confirm('Delete this broadcast asset permanently?')) return;

    try {
      await userService.deletePodcastAdmin(id);
      toast.success('Podcast removed');
      setPodcasts(podcasts.filter(p => p._id !== id));
    } catch (err) {
      toast.error('Removal failed');
    }
  };

  const filteredPodcasts = podcasts.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.uploadedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-green-500 font-mono animate-pulse text-center mt-20 uppercase tracking-[0.3em]">Intercepting Broadcast Streams...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-black text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-4 tracking-tighter uppercase">
            <Radio className="text-green-500" size={40} /> Content Filter
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Monitoring {podcasts.length} active broadcast assets</p>
        </div>

        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by title/owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-green-500/50 transition-all"
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
                <th className="px-8 py-6">Broadcast Asset</th>
                <th className="px-8 py-6">Origin Node (Owner)</th>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {filteredPodcasts.map(p => (
                <tr key={p._id} className="hover:bg-white/[0.03] transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-zinc-800 rounded-xl overflow-hidden shadow-inner border border-zinc-700/50 group-hover:border-green-500/30 transition-all">
                         {p.image ? (
                           <img src={p.image.startsWith('http') ? p.image : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${p.image}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-zinc-700 text-xl group-hover:bg-green-500/10 group-hover:text-green-500 transition-all">🎙️</div>
                         )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-zinc-200 truncate max-w-[250px]">{p.title}</div>
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                           <Calendar size={10} /> {p.category || 'Standard Broadcast'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-zinc-600" />
                      <div>
                        <div className="text-[11px] font-bold text-zinc-300">{p.uploadedBy?.name || p.author || 'SYSTEM'}</div>
                        <div className="text-[9px] text-zinc-600 font-medium">{p.uploadedBy?.email || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    {new Date(p.createdAt || p.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <a 
                        href={p.audio.startsWith('http') ? p.audio : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${p.audio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl text-zinc-600 hover:text-white hover:bg-zinc-800 transition-all active:scale-90"
                        title="Preview Stream"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <button 
                        onClick={() => handleDeletePodcast(p._id)}
                        className="p-3 rounded-xl text-zinc-600 hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all"
                        title="Delete Asset"
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
        {filteredPodcasts.length === 0 && (
          <div className="py-20 text-center text-zinc-600 font-mono uppercase tracking-[0.3em] text-xs">Zero Assets Intercepted</div>
        )}
      </motion.div>
    </div>
  );
}
