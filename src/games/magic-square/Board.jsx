import React, { useState, useMemo } from 'react';
import { MagicSquareCard } from './MagicSquareCard';
import { generateMagicSquareSteps } from './logic';
import { BookOpen, GraduationCap, LayoutGrid, Zap, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

const ALL_8_SIZES = [3, 5, 7, 9];

const MagicControlCard = ({ 
    activeSizes, 
    toggleSize, 
    selectAll, 
    deselectAll, 
    mode, 
    setMode 
}) => {
  return (
    <div className="bg-slate-800/60 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-3 shadow-2xl relative overflow-hidden group h-[320px]">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap size={16} className="text-amber-400 fill-amber-400/20" />
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Logic Control</h3>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/50 rounded-lg border border-white/5">
        {[
            { id: 'learn', label: 'LEARN', icon: BookOpen },
            { id: 'practice', label: 'PRACTICE', icon: GraduationCap },
            { id: 'brute', label: 'BRUTE', icon: Zap }
        ].map(m => (
            <button 
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn(
                    "flex items-center justify-center gap-1.5 py-2 rounded-md text-[10px] font-black tracking-widest transition-all",
                    mode === m.id 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-transparent text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <m.icon size={12} /> {m.label}
            </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={deselectAll}
          className="flex-1 group flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 hover:text-white text-slate-300 rounded-lg font-bold text-xs border border-slate-600/50 transition-all active:scale-95"
        >
          <RotateCcw size={14} className="transition-transform duration-500 group-hover:-rotate-180" /> RESET
        </button>
        <button 
          onClick={selectAll}
          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-xl shadow-emerald-500/30 transition-all active:scale-95"
        >
          SELECT ALL
        </button>
      </div>

      {/* Grid Selection Grid (2x4) */}
      <div className="grid grid-cols-2 gap-2 mt-1">
        {ALL_8_SIZES.map(size => (
          <label 
            key={size}
            className={cn(
              "flex items-center gap-2 cursor-pointer p-1.5 rounded-lg border transition-all active:scale-95",
              activeSizes.has(size) 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                : "bg-slate-900/30 border-transparent text-slate-500 hover:text-slate-400"
            )}
          >
            <input 
              type="checkbox"
              className="hidden"
              checked={activeSizes.has(size)}
              onChange={() => toggleSize(size)}
            />
            <div className={cn(
              "w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0",
              activeSizes.has(size) ? "bg-emerald-500 border-emerald-500" : "border-slate-600"
            )}>
              {activeSizes.has(size) && <div className="w-2 h-2 bg-white rounded-sm" />}
            </div>
            <span className="text-xs font-bold uppercase tracking-tight">{size}x{size}</span>
          </label>
        ))}
      </div>

      {/* Footer Info */}
      <p className="mt-auto text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
        3x3 to 10x10 Logic Dashboard
      </p>
    </div>
  );
};

export default function MagicSquareBoard({ speed }) {
  const [activeSizes, setActiveSizes] = useState(new Set(ALL_8_SIZES));
  const [mode, setMode] = useState('learn'); // 'learn' | 'practice'

  const toggleSize = (size) => {
    setActiveSizes(prev => {
      const next = new Set(prev);
      if (next.has(size)) {
        if (next.size > 1) next.delete(size);
      } else {
        next.add(size);
      }
      return next;
    });
  };

  const selectAll = () => setActiveSizes(new Set(ALL_8_SIZES));
  const deselectAll = () => {
    const min = new Set();
    min.add(3);
    setActiveSizes(min);
  };

  const stepsData = useMemo(() => {
    const data = {};
    activeSizes.forEach(size => {
      data[size] = generateMagicSquareSteps(size);
    });
    return data;
  }, [activeSizes]);

  const visibleSizes = [...activeSizes].sort((a, b) => a - b);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* First 2 Cards */}
        {visibleSizes.slice(0, 2).map(size => (
          <MagicSquareCard 
            key={size}
            size={size}
            mode={mode}
            steps={stepsData[size]}
            speed={speed}
          />
        ))}

        {/* 3rd Position: Control Card */}
        <MagicControlCard 
          activeSizes={activeSizes}
          toggleSize={toggleSize}
          selectAll={selectAll}
          deselectAll={deselectAll}
          mode={mode}
          setMode={setMode}
        />

        {/* Remaining Cards */}
        {visibleSizes.slice(2).map(size => (
          <MagicSquareCard 
            key={size}
            size={size}
            mode={mode}
            steps={stepsData[size]}
            speed={speed}
          />
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-8 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400">
              <LayoutGrid size={24} />
          </div>
          <div>
              <h4 className="text-emerald-300 font-bold text-sm mb-0.5 uppercase tracking-wide">Multi-Order Magic Square Studio</h4>
              <p className="text-emerald-100/40 text-[11px] leading-relaxed uppercase tracking-tight">
                  Visualizing Siamese (Odd), Inversion (Doubly Even), and Strachey (Singly Even) methods across orders 3-10.
              </p>
          </div>
      </div>
    </div>
  );
}
