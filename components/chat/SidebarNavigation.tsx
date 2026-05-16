'use client';
import { useState } from 'react';
import { Folder, FolderLock, Inbox, Search, Settings, ShieldAlert, Zap } from 'lucide-react';

interface SidebarNavigationProps {
  onSelectFolder: (folder: string) => void;
  onOpenSettings: () => void;
  activeFolder: string;
}

export default function SidebarNavigation({ onSelectFolder, onOpenSettings, activeFolder }: SidebarNavigationProps) {
  const folders = [
    { id: 'all', name: 'All Chats', icon: Inbox },
    { id: 'institutional', name: 'Institutional', icon: ShieldAlert },
    { id: 'signals', name: 'Alpha Signals', icon: Zap },
    { id: 'secret', name: 'Secret ZK', icon: FolderLock },
  ];

  return (
    <div className="w-[80px] hover:w-[260px] transition-all duration-300 group border-r border-white/5 bg-[#050505] flex flex-col items-center hover:items-start py-6 relative z-50 overflow-hidden">
      <div className="px-4 w-full flex items-center justify-center group-hover:justify-start mb-8 transition-all">
        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
          <Folder className="text-white" size={18} />
        </div>
        <span className="ml-4 font-mono text-[13px] font-bold tracking-widest text-white opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
          FOLDERS
        </span>
      </div>

      <div className="w-full px-3 mb-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-white/5 rounded-xl flex items-center px-3 py-2 border border-white/5">
          <Search size={14} className="text-white/30 mr-2" />
          <input 
            type="text" 
            placeholder="Search ZK index..." 
            className="bg-transparent border-none outline-none text-xs font-mono text-white placeholder:text-white/30 w-full"
          />
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col gap-2 px-3">
        {folders.map(folder => {
          const Icon = folder.icon;
          const isActive = activeFolder === folder.id;
          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={`w-full flex items-center justify-center group-hover:justify-start p-3 rounded-xl transition-all ${
                isActive ? 'bg-[#00C076]/10 border border-[#00C076]/20' : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-[#00C076]' : 'text-white/50'} />
              <span className={`ml-4 font-mono text-[12px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'text-[#00C076] font-bold' : 'text-white/70'}`}>
                {folder.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="w-full px-3 mt-auto">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center group-hover:justify-start p-3 rounded-xl hover:bg-white/5 transition-all border border-transparent"
        >
          <Settings size={20} className="text-white/50" />
          <span className="ml-4 font-mono text-[12px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Settings
          </span>
        </button>
      </div>
    </div>
  );
}
