
import React from 'react';
import { TargetLanguage } from '../types';
import { LANGUAGES } from '../constants';

interface SidebarProps {
  activeTab: 'history' | 'scenario' | 'journal' | 'quiz' | 'dictionary';
  setActiveTab: (tab: 'history' | 'scenario' | 'journal' | 'quiz' | 'dictionary') => void;
  pendingCount: number;
  currentLanguage: TargetLanguage;
  onLanguageChange: (lang: TargetLanguage) => void;
  onOpenSettings: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, pendingCount, currentLanguage, onLanguageChange, onOpenSettings }) => {
  const navItems: { id: 'history' | 'scenario' | 'journal' | 'quiz' | 'dictionary'; label: string; icon: string; badge?: number }[] = [
    { id: 'dictionary', label: 'AI 查詞', icon: 'fa-magnifying-glass' },
    { id: 'history', label: '歷史書', icon: 'fa-book-bookmark' },
    { id: 'scenario', label: '情境道場', icon: 'fa-gamepad' },
    { id: 'journal', label: '母語日記', icon: 'fa-pen-fancy' },
    { id: 'quiz', label: '智慧複習', icon: 'fa-bolt', badge: pendingCount },
  ];

  return (
    <nav className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 md:h-screen z-10">
      <div className="p-6">
        <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
          <i className="fa-solid fa-earth-asia text-2xl"></i>
          PolyGlot Master
        </h1>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-[0.2em] font-bold">AI v6.0 Engine</p>
      </div>

      <div className="px-4 mb-6">
        <label className="block text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">目標語言</label>
        <div className="grid grid-cols-3 md:grid-cols-1 gap-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang.name}
              onClick={() => onLanguageChange(lang.name)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                currentLanguage === lang.name 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="hidden md:inline font-bold">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 space-y-1">
        <label className="block text-[10px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-wider">學習模組</label>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-slate-900 text-white' 
                : 'text-gray-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <i className={`fa-solid ${item.icon} w-5`}></i>
              <span className="font-semibold">{item.label}</span>
            </div>
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === item.id ? 'bg-indigo-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 mt-auto">
        <button 
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
        >
          <i className="fa-solid fa-cog"></i>
          <span className="font-semibold text-sm">系統設定</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
