import React from 'react';
import { BookOpen, GraduationCap, LayoutGrid, Zap, RotateCcw, RefreshCw, Sliders, Play, Square, Info, BrainCircuit, Hash, Check } from 'lucide-react';
import { cn } from '../../utils/cn';

export const SudokuControlCard = ({ 
    selectedSize, 
    setSelectedSize,
    difficulty,
    setDifficulty,
    selectedAlgos,
    toggleAlgo,
    toggleAllAlgos,
    mainMode, 
    setMainMode,
    onRun,
    onReset,
    onNewGame,
    isRunning,
}) => {

  const SIZES = [4, 9];
  
  const simulationAlgos = [
    { id: 'backtrack', label: 'Backtrack', icon: RotateCcw },
    { id: 'naked', label: 'Naked Single', icon: Zap },
    { id: 'dynamic', label: 'CSP Solver', icon: BrainCircuit },
  ];

  const allSelected = selectedAlgos.size === simulationAlgos.length;
  const noneSelected = selectedAlgos.size === 0;

  return (
    <div className="bg-slate-800/60 backdrop-blur-xl border border-amber-500/30 rounded-xl p-4 flex flex-col gap-3 shadow-2xl relative overflow-hidden group h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <LayoutGrid size={16} className="text-amber-400 fill-amber-400/20" />
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Lab Control</h3>
      </div>

      {/* Main Mode Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/50 rounded-lg border border-white/5">
        {[
            { id: 'simulation', label: 'SIMULATION', icon: Zap },
            { id: 'practice', label: 'PRACTICE', icon: GraduationCap }
        ].map(m => (
            <button 
                key={m.id}
                onClick={() => setMainMode(m.id)}
                className={cn(
                    "flex items-center justify-center gap-1.5 py-2 rounded-md text-[9px] font-bold tracking-widest transition-all",
                    mainMode === m.id 
                    ? "bg-amber-400/20 border border-amber-400/30 text-amber-300 shadow-lg shadow-amber-500/10" 
                    : "bg-transparent text-slate-500 hover:text-slate-400 hover:bg-white/5"
                )}
            >
                <m.icon size={11} /> {m.label}
            </button>
        ))}
      </div>

      {/* Primary Actions (Run / Reset / New) */}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button 
            onClick={onReset}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-[10px] border border-slate-600/50 transition-all active:scale-95"
            title="Reset All Progress"
          >
            <RotateCcw size={12} /> RESET
          </button>
          <button 
            onClick={onNewGame}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-bold text-[10px] border border-emerald-500/20 transition-all active:scale-95"
            title="Generate Global New Puzzle"
          >
            <RefreshCw size={12} /> NEW PUZZLE
          </button>
        </div>

        {isRunning ? (
          <button 
            disabled
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700/50 text-slate-300 rounded-xl font-bold text-[10px] border border-white/10"
          >
            <Square size={12} fill="currentColor" /> HOLDING LAB...
          </button>
        ) : (
          <button 
            onClick={onRun}
            disabled={mainMode === 'practice'}
            className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[11px] shadow-xl transition-all active:scale-95",
                mainMode === 'practice' 
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                  : "bg-amber-500 hover:bg-amber-400 text-white shadow-amber-500/20 tracking-[0.2em]"
            )}
          >
            <Play size={13} fill="currentColor" /> RUN ALL LABS
          </button>
        )}
      </div>

      {/* Algorithm Selection - for simulation */}
      {mainMode === 'simulation' && (
        <div className="flex flex-col gap-2">
           <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Logic Engines</label>
           <button 
              onClick={toggleAllAlgos}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border transition-all hover:bg-amber-500/10",
                noneSelected ? "border-slate-700 text-slate-500" : "border-amber-500/20 text-amber-300"
              )}
           >
              <div className={cn(
                  "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0",
                  allSelected ? "bg-amber-400" : 
                  (noneSelected ? "border border-slate-700 bg-slate-800/50" : "border border-amber-400/30 bg-amber-400/10")
              )}>
                  {allSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  {!allSelected && !noneSelected && <div className="w-1.5 h-1.5 bg-amber-400/80 rounded-sm" />}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest">
                 {allSelected ? "Unselect" : noneSelected ? "Select All" : "Reset Selection"}
              </span>
           </button>

          <div className="grid grid-cols-1 gap-1.5">
            {simulationAlgos.map(algo => (
              <label 
                key={algo.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 rounded-lg border transition-all cursor-pointer group",
                  selectedAlgos.has(algo.id) 
                    ? "bg-amber-600/10 border-amber-500/30 text-white" 
                    : "bg-slate-900/20 border-white/5 text-slate-500 hover:text-slate-400 hover:border-white/10"
                )}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={selectedAlgos.has(algo.id)}
                  onChange={() => toggleAlgo(algo.id)}
                />
                <div className={cn(
                    "w-3 h-3 rounded flex items-center justify-center transition-all",
                    selectedAlgos.has(algo.id) 
                      ? "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.3)]" 
                      : "border border-slate-700 bg-slate-800/50 group-hover:border-slate-600"
                )}>
                    {selectedAlgos.has(algo.id) && <div className="w-1 h-1 bg-white rounded-full" />}
                </div>
                <algo.icon size={11} className={selectedAlgos.has(algo.id) ? "text-amber-400" : "text-slate-600"} />
                <span className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">{algo.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Selection - Always visible */}
      <div className="flex flex-col gap-2">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Difficulty</label>
          <div className="grid grid-cols-3 gap-1.5">
            {['easy', 'medium', 'hard'].map(diff => (
              <button 
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={cn(
                  "py-2 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-widest",
                  difficulty === diff
                    ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20 scale-105 z-10" 
                    : "bg-slate-900/20 border-white/5 text-slate-500 hover:text-slate-400"
                )}
              >
                {diff}
              </button>
            ))}
          </div>
      </div>

       {/* Size Selection */}
       <div className="mt-auto pt-3 border-t border-slate-700/50">
        <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Select Order (N x N)</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SIZES.map(size => (
            <button 
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "py-2 rounded-lg font-bold text-xs transition-all border",
                selectedSize === size 
                  ? "bg-amber-400/30 border-amber-400/40 text-amber-200 shadow-md shadow-amber-500/10" 
                  : "bg-slate-900/30 border-transparent text-slate-500 hover:text-slate-400"
              )}
            >
              {size}x{size}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
