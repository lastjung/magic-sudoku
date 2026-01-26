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
    { id: 'sorting', label: 'Sorting', icon: Sliders },
    { id: 'magic', label: 'Magic', icon: Grid3x3 },
    { id: 'sudoku', label: 'Sudoku', icon: Hash },
  ];

  return (
    <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Logo & Tabs */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <LayoutGrid className="text-white" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
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
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
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

        {/* Right: Controls (Always Visible) */}
        <div className={cn(
          "flex items-center gap-6 bg-slate-800/50 px-6 py-3 rounded-2xl border border-white/5 transition-all"
        )}>
          {/* Sound Toggle */}
          <button 
            onClick={toggleSound}
            className={cn(
              "p-2 rounded-lg transition-all",
              soundEnabled ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30" : "bg-slate-700 text-slate-400 hover:text-white"
            )}
            title={soundEnabled ? "Mute" : "Sound"}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Count Slider */}
          <div className="hidden lg:flex flex-col gap-1.5 min-w-[120px]">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 Count
              </label>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">{arraySize}</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={arraySize} 
              onChange={(e) => setArraySize(Number(e.target.value))}
              className="accent-indigo-500 h-1 w-full bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Speed Slider */}
          <div className="hidden lg:flex flex-col gap-1.5 min-w-[120px]">
            <div className="flex justify-between items-center px-0.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                 Speed
              </label>
              <span className="text-[10px] font-mono text-indigo-400 font-bold">{speed}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="1000" 
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="accent-indigo-500 h-1 w-full bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Randomize Button */}
          <button 
            onClick={onRandomize}
            className="group flex items-center gap-2 px-5 py-2 bg-slate-100 hover:bg-white text-slate-900 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-white/5"
          >
            <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            Random
          </button>
        </div>
      </div>
    </div>
  );
};

