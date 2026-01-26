import React, { useState } from 'react';
import { Settings2, RefreshCcw, LayoutGrid, Sliders, Volume2, VolumeX, Grid3x3, Hash } from 'lucide-react';
import { cn } from '../utils/cn';
import { audioEngine } from '../utils/audio';

export const ControlPanel = ({ 
  activeTab,
  onTabChange,
  arraySize, 
  setArraySize, 
  speed, 
  setSpeed, 
  onRandomize 
}) => {
  const [soundEnabled, setSoundEnabled] = useState(audioEngine.enabled);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioEngine.setEnabled(next);
  };

  const tabs = [
    { id: 'sorting', label: 'Sorting', icon: Sliders, color: 'indigo' },
    { id: 'magic', label: 'Magic', icon: Grid3x3, color: 'emerald' },
    { id: 'sudoku', label: 'Sudoku', icon: Hash, color: 'amber' },
  ];

  const activeColor = tabs.find(t => t.id === activeTab)?.color || 'indigo';

  const colorConfig = {
    indigo: {
      bg: 'bg-indigo-600',
      shadow: 'shadow-indigo-500/20',
      text: 'text-indigo-400',
      accent: 'accent-indigo-500',
      shadowLg: 'shadow-indigo-500/30'
    },
    emerald: {
      bg: 'bg-emerald-600',
      shadow: 'shadow-emerald-500/20',
      text: 'text-emerald-400',
      accent: 'accent-emerald-500',
      shadowLg: 'shadow-emerald-500/30'
    },
    amber: {
      bg: 'bg-amber-600',
      shadow: 'shadow-amber-500/20',
      text: 'text-amber-400',
      accent: 'accent-amber-500',
      shadowLg: 'shadow-amber-500/30'
    }
  };

  const theme = colorConfig[activeColor];

  return (
    <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-row flex-wrap items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Logo & Tabs */}
        <div className="flex items-center gap-3 sm:gap-6 w-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={cn("p-1.5 sm:p-2 rounded-lg shadow-lg transition-colors duration-500", theme.bg, theme.shadow)}>
              <LayoutGrid className="text-white" size={18} />
            </div>
            <div className="hidden xs:block">
              <h1 className="text-sm sm:text-lg font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                AlgoStudio
              </h1>
            </div>
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex p-1 bg-slate-800/50 rounded-xl border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                    isActive 
                      ? `${theme.bg} text-white shadow-lg ${theme.shadow}` 
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section: Compact Controls */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Sliders (Desktop Only) */}
          <div className="hidden lg:flex items-center gap-6 bg-slate-800/50 px-5 py-2 rounded-xl border border-white/5 mr-2">
            {/* Count Slider */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                <span>COUNT</span>
                <span className={theme.text}>{arraySize}</span>
              </div>
              <input 
                type="range" min="10" max="100" value={arraySize} 
                onChange={(e) => setArraySize(Number(e.target.value))}
                className={cn("h-1 w-full bg-slate-700 rounded-lg appearance-none cursor-pointer", theme.accent)}
              />
            </div>
            {/* Speed Slider */}
            <div className="flex flex-col gap-1 min-w-[100px]">
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                <span>SPEED</span>
                <span className={theme.text}>{speed}</span>
              </div>
              <input 
                type="range" min="1" max="1000" value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className={cn("h-1 w-full bg-slate-700 rounded-lg appearance-none cursor-pointer", theme.accent)}
              />
            </div>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Sound Toggle */}
            <button 
              onClick={toggleSound}
              className={cn(
                "p-2 rounded-lg transition-all border",
                soundEnabled ? `${theme.bg} text-white shadow-lg ${theme.shadowLg} border-white/20` : "bg-slate-800/80 text-slate-400 hover:text-white border-white/5"
              )}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Random Button (Hidden in Magic Tab) */}
            {activeTab !== 'magic' && (
              <button 
                onClick={onRandomize}
                className="group flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-lg font-black text-[10px] sm:text-xs transition-all active:scale-95 shadow-lg shadow-white/5"
              >
                <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden sm:inline">Random</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

