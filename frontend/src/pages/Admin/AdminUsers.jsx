import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Users, Trash2, Search, Filter, ShieldAlert } from 'lucide-react';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsersAdmin();
      setUsers(data);
    } catch (err) {
      toast.error('Failed to intercept user data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser._id) return toast.warning('Security protocol: Cannot terminate self');
    if (!window.confirm('Terminate this user account permanently?')) return;

    try {
      await userService.deleteUserAdmin(id);
      toast.success('User terminated');
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      toast.error('Termination failed');
    }
  };

  const handleChangeRole = async (id, newRole) => {
    if (id === currentUser._id) return toast.warning('Security protocol: Cannot demote self');
    try {
      await userService.updateUserRoleAdmin(id, newRole);
      toast.success(`Node role elevated to ${newRole}`);
      setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      toast.error('Role elevation failed');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return <div className="p-8 text-green-500 font-mono animate-pulse text-center mt-20 uppercase tracking-widest">Intercepting User Identities...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-black text-white font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-4 tracking-tighter uppercase">
            <Users className="text-blue-500" size={40} /> Identity Manager
          </h1>
          <p className="text-zinc-500 mt-1 font-medium">Monitoring {users.length} registered network nodes</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by name/email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            />
          </div>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-2xl py-3 px-6 focus:outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="podcaster">Creators</option>
            <option value="user">Listeners</option>
          </select>
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
                <th className="px-8 py-6">Node Identity</th>
                <th className="px-8 py-6">Role Elevation</th>
                <th className="px-8 py-6">Registration Date</th>
                <th className="px-8 py-6 text-right">System Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {filteredUsers.map(u => (
                <tr key={u._id} className="hover:bg-white/[0.03] transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-600 font-bold group-hover:text-white group-hover:bg-blue-500/20 transition-all border border-zinc-700/50">
                        {u.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-zinc-200">{u.name}</div>
                        <div className="text-[10px] text-zinc-500 font-medium tracking-tight">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={u.role}
                      onChange={(e) => handleChangeRole(u._id, e.target.value)}
                      className={`inline-block px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-zinc-800 border border-zinc-700 outline-none cursor-pointer hover:border-zinc-500 transition-all ${
                        u.role === 'admin' ? 'text-red-500' : 
                        u.role === 'podcaster' ? 'text-blue-500' : 'text-zinc-400'
                      }`}
                    >
                      <option value="user">Listener</option>
                      <option value="podcaster">Creator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                    {u.createdAt && u.createdAt !== 'INVALID DATE' 
                      ? new Date(u.createdAt).toLocaleDateString() 
                      : 'Recently Registered'}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => handleDeleteUser(u._id)}
                      className={`p-3 rounded-xl transition-all ${u._id === currentUser._id ? 'opacity-10 cursor-not-allowed' : 'text-zinc-600 hover:text-red-500 hover:bg-red-500/10 active:scale-90'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-20 text-center text-zinc-600 font-mono uppercase tracking-[0.3em] text-xs">Zero Matches Found</div>
        )}
      </motion.div>
    </div>
  );
}
