import React from 'react';
import { BookOpen, RotateCcw, LayoutGrid, Zap, Sliders, Play, BrainCircuit, Square, Info, GraduationCap } from 'lucide-react';
import { cn } from "../../../utils/cn";

export const MagicControlCard = ({ 
    selectedSize, 
    setSelectedSize,
    selectedAlgos, 
    toggleAlgo, 
    toggleAllAlgos,
    mainMode, 
    setMainMode,
    onRunAll,
    onResetAll,
    isRunningAny,
    showAlgoTable,
    setShowAlgoTable,
    simulationAlgos,
    ALL_SIZES
}) => {
  const allSelected = selectedAlgos.size === simulationAlgos.length;
  const noneSelected = selectedAlgos.size === 0;

  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col gap-4 shadow-2xl relative overflow-hidden group h-full">
      <div className="absolute inset-0 bg-blueprint opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1 relative z-10">
        <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
          <Zap size={14} className="fill-amber-400/20" />
        </div>
        <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Lab Control</h3>
      </div>

      {/* Main Mode Switcher */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-white/5 relative z-10">
        {[
            { id: 'simulation', label: 'SIMULATION', icon: Zap },
            { id: 'practice', label: 'PRACTICE', icon: GraduationCap }
        ].map(m => (
            <button 
                key={m.id}
                onClick={() => setMainMode(m.id)}
                className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-lg text-[9px] font-black tracking-[0.2em] transition-all",
                    mainMode === m.id 
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 shadow-xl shadow-emerald-500/10" 
                    : "bg-transparent text-slate-500 hover:text-slate-400 hover:bg-white/5"
                )}
            >
                <m.icon size={12} /> {m.label}
            </button>
        ))}
      </div>

      {/* Primary Actions (Run / Reset) */}
      <div className="flex gap-2">
        <button 
          onClick={onResetAll}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-[10px] border border-slate-600/50 transition-all active:scale-95"
        >
          <RotateCcw size={12} /> RESET
        </button>
        {isRunningAny ? (
          <button 
            onClick={onResetAll}
            className="flex-[1.5] flex items-center justify-center gap-2 py-2.5 bg-slate-700/50 hover:bg-slate-700/80 text-slate-300 rounded-xl font-bold text-[10px] border border-white/10 transition-all active:scale-95"
          >
            <Square size={12} fill="currentColor" /> HOLD
          </button>
        ) : (
          <button 
            onClick={onRunAll}
            disabled={mainMode === 'practice'}
            className={cn(
                "flex-[1.5] flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[10px] shadow-xl transition-all active:scale-95",
                mainMode === 'practice' 
                  ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                  : "bg-emerald-400/90 hover:bg-emerald-400 text-white shadow-emerald-400/20 font-black tracking-widest"
            )}
          >
            <Play size={12} fill="currentColor" /> RUN SELECTED
          </button>
        )}
      </div>

      {/* Algorithm Selection (Checkboxes) - only for simulation */}
      {mainMode === 'simulation' && (
        <div className="flex flex-col gap-2">
          <button 
             onClick={toggleAllAlgos}
             className={cn(
               "flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border transition-all hover:bg-emerald-500/10",
               noneSelected ? "border-slate-700 text-slate-500" : "border-emerald-500/20 text-emerald-300"
             )}
          >
             <div className={cn(
                 "w-4 h-4 rounded flex items-center justify-center transition-all shrink-0",
                 allSelected ? "bg-emerald-400" : 
                 (noneSelected ? "border border-slate-700 bg-slate-800/50" : "border border-emerald-400/30 bg-emerald-400/10")
             )}>
                 {allSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                 {!allSelected && !noneSelected && <div className="w-1.5 h-1.5 bg-emerald-400/80 rounded-sm" />}
             </div>
             <span className="text-[11px] font-black uppercase tracking-widest">
                {allSelected ? "Unselect" : noneSelected ? "Select All" : "Reset Selection"} ({selectedAlgos.size}/{simulationAlgos.length})
             </span>
          </button>

          <div className="grid grid-cols-2 gap-1.5">
            {simulationAlgos.map(algo => (
              <label 
                key={algo.id}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all cursor-pointer group",
                  selectedAlgos.has(algo.id) 
                    ? "bg-emerald-600/10 border-emerald-500/30 text-white" 
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
                      ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.3)]" 
                      : "border border-slate-700 bg-slate-800/50 group-hover:border-slate-600"
                )}>
                    {selectedAlgos.has(algo.id) && <div className="w-1 h-1 bg-white rounded-full" />}
                </div>
                <algo.icon size={11} className={selectedAlgos.has(algo.id) ? "text-emerald-400" : "text-slate-600"} />
                <span className="text-[10px] font-black uppercase tracking-tighter whitespace-nowrap">{algo.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Unified Size Selection */}
      <div className="mt-auto pt-3 border-t border-slate-700/50">
        <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Select Order (N x N)</span>
            <button 
                onClick={() => setShowAlgoTable(!showAlgoTable)}
                className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-tighter transition-all border",
                    showAlgoTable 
                        ? "bg-slate-700 border-white/20 text-slate-300" 
                        : "bg-emerald-500/30 border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/50"
                )}
            >
                <Info size={10} />
                {showAlgoTable ? 'Hide Matrix' : 'Engine Matrix'}
            </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {ALL_SIZES.map(size => (
            <button 
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "py-2 rounded-lg font-bold text-xs transition-all border",
                selectedSize === size 
                  ? "bg-emerald-400/30 border-emerald-400/40 text-emerald-200 shadow-md shadow-emerald-500/10" 
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
