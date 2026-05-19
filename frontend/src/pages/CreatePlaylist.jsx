import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Music, Trash2, X, Play, ListMusic } from 'lucide-react';

export default function CreatePlaylist() {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      const data = await userService.getPlaylists();
      setPlaylists(data || []);
    } catch (err) {
      console.error('Failed to fetch playlists', err);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      await userService.createPlaylist(newPlaylistName);
      toast.success(`Playlist "${newPlaylistName}" created!`);
      setNewPlaylistName('');
      fetchPlaylists();
    } catch (err) {
      console.error('Playlist creation failed', err);
      toast.error('Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (id, name) => {
    if (!window.confirm(`Delete playlist "${name}"?`)) return;

    try {
      await userService.deletePlaylist(id);
      toast.success('Playlist deleted');
      if (selectedPlaylist?._id === id) setSelectedPlaylist(null);
      fetchPlaylists();
    } catch (err) {
      toast.error('Failed to delete playlist');
    }
  };

  const handleRemoveFromPlaylist = async (playlistId, podcastId) => {
    try {
      await userService.removeFromPlaylist(playlistId, podcastId);
      toast.success('Removed from playlist');
      fetchPlaylists();
      // Update local selection
      if (selectedPlaylist?._id === playlistId) {
          const updatedPlaylists = await userService.getPlaylists();
          const updated = updatedPlaylists.find(p => p._id === playlistId);
          setSelectedPlaylist(updated);
      }
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  if (loading) return <div className="p-8 text-zinc-500">Loading playlists...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-black text-white">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Playlists</h1>
          <p className="text-zinc-400">Organize your favorite podcasts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Playlist List & Creation */}
        <div className="lg:col-span-1 space-y-6">
          <form onSubmit={handleCreatePlaylist} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
            <label className="block text-sm font-medium text-zinc-400 mb-3">Create New Playlist</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist Name"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-green-500"
              />
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-black p-2 rounded-xl transition-colors"
              >
                <Plus size={24} />
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {playlists.length === 0 ? (
              <div className="text-center py-10 bg-zinc-900/50 rounded-2xl border border-dashed border-zinc-800">
                <Music className="mx-auto mb-3 text-zinc-700" size={32} />
                <p className="text-zinc-500 text-sm">No playlists yet</p>
              </div>
            ) : (
              playlists.map((playlist) => (
                <div 
                  key={playlist._id}
                  onClick={() => setSelectedPlaylist(playlist)}
                  className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                    selectedPlaylist?._id === playlist._id 
                    ? 'bg-zinc-800 border-green-500/50 border' 
                    : 'bg-zinc-900 border-transparent border hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-green-500">
                      <ListMusic size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold">{playlist.name}</h3>
                      <p className="text-xs text-zinc-500">{playlist.podcasts?.length || 0} tracks</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist._id, playlist.name); }}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Playlist Content View */}
        <div className="lg:col-span-2">
          {selectedPlaylist ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden"
            >
              <div className="p-8 bg-gradient-to-b from-green-500/20 to-zinc-900">
                <div className="flex items-end gap-6">
                  <div className="w-48 h-48 bg-zinc-800 shadow-2xl rounded-2xl flex items-center justify-center text-green-500">
                    <ListMusic size={80} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-green-500">Playlist</span>
                    <h2 className="text-5xl font-black mt-2 mb-4">{selectedPlaylist.name}</h2>
                    <p className="text-zinc-400 font-medium">
                      {selectedPlaylist.podcasts?.length || 0} podcasts • Created by you
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-zinc-500 text-sm border-b border-zinc-800">
                      <th className="pb-4 font-medium pl-4">#</th>
                      <th className="pb-4 font-medium">Title</th>
                      <th className="pb-4 font-medium">Artist</th>
                      <th className="pb-4 font-medium text-right pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {selectedPlaylist.podcasts?.length > 0 ? (
                      selectedPlaylist.podcasts.map((podcast, index) => (
                        <tr key={podcast._id} className="group hover:bg-zinc-800/50 transition-colors">
                          <td className="py-4 pl-4 text-zinc-500">{index + 1}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center">
                                <Play size={16} className="text-green-500" />
                              </div>
                              <span className="font-medium text-white">{podcast.title}</span>
                            </div>
                          </td>
                          <td className="py-4 text-zinc-400 text-sm">{podcast.creator?.name || 'Unknown'}</td>
                          <td className="py-4 text-right pr-4">
                            <button 
                              onClick={() => handleRemoveFromPlaylist(selectedPlaylist._id, podcast._id)}
                              className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                            >
                              <X size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-10 text-center text-zinc-500 italic">
                          This playlist is empty. Go find some podcasts to add!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800 p-12 text-center">
              <ListMusic size={64} className="text-zinc-800 mb-4" />
              <h2 className="text-xl font-bold text-zinc-400">Select a playlist</h2>
              <p className="text-zinc-500 max-w-xs mt-2">
                Choose a playlist from the left to view and manage its contents.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
