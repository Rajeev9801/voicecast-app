import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, Mic, User, ListMusic, ShieldAlert, Radio, LogOut, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { to: '/', icon: <Home size={24} />, label: 'Home' },
    { to: '/search', icon: <Search size={24} />, label: 'Search' },
    { to: '/library', icon: <Library size={24} />, label: 'Your Library' },
  ];

  const featureItems = [
    { to: '/record', icon: <Mic size={24} />, label: 'Recording Studio' },
    { to: '/dashboard', icon: <User size={24} />, label: 'Dashboard' },
  ];

  const playlistItems = [
    { to: '/create-playlist', icon: <PlusSquare size={24} />, label: 'Create Playlist' },
    { to: '/liked', icon: <Heart size={24} />, label: 'Liked Songs' },
  ];

  return (
    <aside className="w-64 bg-black flex flex-col h-full border-r border-zinc-900 overflow-y-auto">
      <div className="p-6 flex flex-col h-full min-h-[calc(100vh-4rem)]">
        {/* LOGO */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <Library className="text-black" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">VoiceCast</span>
        </div>

        {/* MAIN NAV */}
        <nav className="flex flex-col gap-4">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to}
              {...item}
              active={isActive(item.to)}
              onClick={() => navigate(item.to)}
            />
          ))}
        </nav>

        {/* FEATURES */}
        <div className="mt-10 flex flex-col gap-4">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Features</h4>
          {featureItems.map((item) => (
            <SidebarItem 
              key={item.to}
              {...item}
              active={isActive(item.to)}
              onClick={() => navigate(item.to)}
            />
          ))}
          
          {(user?.role === 'podcaster' || user?.role === 'admin') && (
            <SidebarItem 
              to="/creator-dashboard"
              icon={<ListMusic size={24} />}
              label="Creator Panel"
              active={isActive('/creator-dashboard')}
              onClick={() => navigate('/creator-dashboard')}
            />
          )}
        </div>

        {/* ADMIN CONTROLS */}
        {user?.role === 'admin' && (
          <div className="mt-10 flex flex-col gap-2">
            <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] px-4 mb-2 opacity-80">Admin Center</h4>
            <SidebarItem 
              to="/admin"
              icon={<ShieldAlert size={22} />}
              label="Admin Dashboard"
              active={location.pathname.startsWith('/admin')}
              onClick={() => navigate('/admin')}
              variant="admin"
            />
          </div>
        )}

        {/* PLAYLISTS */}
        <div className="mt-10 flex flex-col gap-4">
          <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest px-1">Playlists</h4>
          {playlistItems.map((item) => (
            <SidebarItem 
              key={item.to}
              {...item}
              active={isActive(item.to)}
              onClick={() => navigate(item.to)}
            />
          ))}
        </div>

        {/* LOGOUT */}
        <div className="mt-auto pt-10 pb-4">
           <button 
            onClick={handleLogout}
            className="flex items-center gap-4 text-zinc-500 hover:text-red-500 transition-all duration-300 group px-1 w-full"
          >
            <span className="transition-transform group-hover:scale-110"><LogOut size={24} /></span>
            <span className="text-sm font-bold tracking-tight">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

const SidebarItem = ({ icon, label, active, onClick, variant }) => {
  const baseClasses = "flex items-center gap-4 transition-all duration-300 group px-4 py-3 w-full text-left rounded-xl mb-1";
  
  const activeClasses = variant === 'admin' 
    ? "bg-red-500/10 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)] border border-red-500/20"
    : "bg-green-500/10 text-green-500 border border-green-500/10";
    
  const inactiveClasses = "text-zinc-500 hover:text-white hover:bg-zinc-900";

  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${active ? activeClasses : inactiveClasses}`}
    >
      <span className={`transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${active ? (variant === 'admin' ? 'text-red-500' : 'text-green-500') : 'group-hover:text-inherit'}`}>
        {icon}
      </span>
      <span className={`text-sm font-black tracking-tight uppercase ${active ? 'text-white' : 'font-bold'}`}>
        {label}
      </span>
    </button>
  );
};

export default Sidebar;
