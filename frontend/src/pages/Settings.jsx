import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Shield, Volume2, Moon, Globe, Check } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Security', icon: <Shield size={18} /> },
    { id: 'audio', label: 'Audio', icon: <Volume2 size={18} /> },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-black text-white">
      <div className="mb-12">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">System Config</h1>
        <p className="text-zinc-500 font-medium">Personalize your VoiceCast interface and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Tabs Sidebar */}
        <aside className="md:w-64 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === tab.id ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-zinc-900/50 rounded-[2.5rem] border border-zinc-800 p-10 shadow-2xl backdrop-blur-sm">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            {activeTab === 'general' && (
              <>
                <SettingSection title="Interface Appearance">
                  <SettingItem 
                    icon={<Moon className="text-purple-500" />} 
                    label="Dark Mode" 
                    description="Always active for premium experience" 
                    value="Always On"
                  />
                  <SettingItem 
                    icon={<Globe className="text-blue-500" />} 
                    label="Language" 
                    description="System primary language" 
                    value="English (US)"
                  />
                </SettingSection>

                <SettingSection title="Network Connections">
                   <div className="p-6 bg-zinc-800/50 rounded-3xl border border-zinc-700 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center">
                            <Check size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold">Frontend synchronized</p>
                            <p className="text-xs text-zinc-500">Connected to local node: 5173</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</span>
                   </div>
                </SettingSection>
              </>
            )}

            {activeTab !== 'general' && (
              <div className="py-20 text-center">
                 <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">⚡</div>
                 <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Protocol Pending</h3>
                 <p className="text-zinc-500 text-sm">This system module is currently undergoing optimization.</p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function SettingSection({ title, children }) {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-zinc-600 uppercase tracking-[0.2em] px-2">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SettingItem({ icon, label, description, value }) {
  return (
    <div className="p-6 bg-zinc-800/50 rounded-3xl border border-zinc-800 flex items-center justify-between group hover:border-zinc-600 transition-all cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-700 group-hover:border-zinc-500 transition-colors shadow-inner">
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-200">{label}</p>
          <p className="text-xs text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="text-xs font-black text-zinc-400 uppercase tracking-widest bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
        {value}
      </div>
    </div>
  );
}
