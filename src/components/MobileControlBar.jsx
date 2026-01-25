import React, { useState } from 'react';
import { Play, RotateCcw, Settings2, CheckSquare, Square, ChevronUp, ChevronDown, Volume2, VolumeX, Sliders, RefreshCcw } from 'lucide-react';
import { cn } from '../utils/cn';
import { audioEngine } from '../utils/audio';

export const MobileControlBar = ({
  selectedIds,
  onToggleSelect,
  onRunSelected,
  onStopAll,
  onReset,
  onSelectAll,
  onDeselectAll,
  isRunningAny,
  arraySize,
  setArraySize,
  speed,
  setSpeed,
  onRandomize
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioEngine.setEnabled(next);
  };

  const ALGO_LABELS = [
    { id: 'bubble', label: 'Bubble' },
    { id: 'selection', label: 'Selection' },
    { id: 'insertion', label: 'Insertion' },
    { id: 'quick', label: 'Quick' },
    { id: 'merge', label: 'Merge' },
    { id: 'heap', label: 'Heap' },
    { id: 'shell', label: 'Shell' },
    { id: 'cocktail', label: 'Cocktail' },
  ];

  return (
    <div className="lg:hidden fixed bottom-6 left-0 right-0 z-40 px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex flex-col gap-2 pointer-events-auto">
      {/* Expanded Menu (Algorithm Selection) */}
      {isMenuOpen && (
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 shadow-2xl mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
          {/* Row 1: Title + Sound */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Algorithms</span>
            <button 
              onClick={toggleSound}
              className={cn(
                "p-1.5 rounded transition-all",
                soundEnabled 
                  ? "bg-indigo-500 text-white" 
                  : "bg-slate-700 text-slate-500"
              )}
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>
          
          {/* Row 2: Randomize + Select All (2-column grid) */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button 
              onClick={onRandomize}
              className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-white text-slate-900 rounded-lg font-bold text-xs transition-all active:scale-95"
            >
              <RefreshCcw size={14} />
              Randomize
            </button>
            <button
              onClick={() => selectedIds.size === 8 ? onDeselectAll() : onSelectAll()}
              className="flex items-center justify-center py-2.5 text-xs font-bold uppercase tracking-wide rounded-lg bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 active:bg-indigo-600"
            >
              {selectedIds.size === 8 ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          {/* Algorithm Selection (2-column grid) */}
          <div className="grid grid-cols-2 gap-2">
            {ALGO_LABELS.map(algo => (
              <div
                key={algo.id}
                onClick={() => onToggleSelect(algo.id)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-95 cursor-pointer",
                  selectedIds.has(algo.id)
                    ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
                    : "bg-slate-900/40 border-slate-700/50 text-slate-400"
                )}
              >
                <div className={cn(
                  "w-4 h-4 rounded border flex items-center justify-center transition-all",
                  selectedIds.has(algo.id) ? "bg-indigo-500 border-indigo-500" : "border-slate-600"
                )}>
                  {selectedIds.has(algo.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                </div>
                <span className="text-sm font-medium">{algo.label}</span>
              </div>
            ))}
          </div>
          
          {/* Sliders Section */}
          <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
            {/* Count Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sliders size={10} /> Count
                </label>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">{arraySize}</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={arraySize} 
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="accent-indigo-500 h-1.5 w-full bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Speed Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Settings2 size={10} /> Speed
                </label>
                <span className="text-[10px] font-mono text-indigo-400 font-bold">{speed}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="1000" 
                value={speed} 
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="accent-indigo-500 h-1.5 w-full bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="h-16 bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl flex items-center justify-between p-2 pr-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex items-center gap-2">
          {/* Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={cn(
              "w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95",
              isMenuOpen ? "bg-slate-700 text-white" : "bg-transparent text-slate-400 hover:text-white"
            )}
          >
            {isMenuOpen ? <ChevronDown size={20} /> : <Settings2 size={20} />}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Main Action Button */}
        <div className="flex-1 pl-2">
            {isRunningAny ? (
            <button
              onClick={onStopAll}
              className="w-full h-12 flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl font-bold shadow-lg shadow-rose-900/10 active:scale-95 transition-all"
            >
              <Square size={16} fill="currentColor" /> STOP
            </button>
            ) : (
            <button
              onClick={onRunSelected}
              disabled={selectedIds.size === 0}
              className="w-full h-12 flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:active:scale-100 text-white rounded-xl font-bold shadow-lg shadow-emerald-400/30 active:scale-95 transition-all"
            >
              <Play size={18} fill="currentColor" /> RUN
            </button>
            )}
        </div>
      </div>
      </div>
    </div>
  );
};
