import React, { useState, useMemo } from 'react';
import { MagicSquareCard } from './MagicSquareCard';
import { generateMagicSquareSteps } from './logic';
import { BookOpen, GraduationCap, LayoutGrid, Zap, RotateCcw, Sliders, Play, Check, BrainCircuit } from 'lucide-react';
import { cn } from '../../utils/cn';

const ALL_SIZES = [3, 4, 5, 6, 7, 8, 9, 10];

const MagicControlCard = ({ 
    selectedSize, 
    setSelectedSize,
    selectedAlgos, 
    toggleAlgo, 
    toggleAllAlgos,
    mainMode, 
    setMainMode,
    onRunAll,
    onResetAll
}) => {
  const simulationAlgos = [
    { id: 'formula', label: 'Direct Formula', icon: BookOpen },
    { id: 'backtrack', label: 'Recursive Backtrack', icon: RotateCcw },
    { id: 'smart', label: 'Pruned Backtrack', icon: Zap },
    { id: 'heuristic', label: 'Heuristic Search', icon: LayoutGrid },
    { id: 'dynamic', label: 'CSP Solver (Heuristic)', icon: BrainCircuit },
    { id: 'brute', label: 'Pure Brute Force', icon: Sliders },
  ];

  const allSelected = selectedAlgos.size === simulationAlgos.length;

  return (
    <div className="bg-slate-800/60 backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-3 shadow-2xl relative overflow-hidden group h-full min-h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Zap size={16} className="text-amber-400 fill-amber-400/20" />
        <h3 className="text-xs font-bold text-white uppercase tracking-widest">Lab Control</h3>
      </div>

      {/* Main Mode Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900/50 rounded-lg border border-white/5">
        {[
            { id: 'simulation', label: 'LAB / Simulation', icon: Zap },
            { id: 'practice', label: 'PRACTICE / Play', icon: GraduationCap }
        ].map(m => (
            <button 
                key={m.id}
                onClick={() => setMainMode(m.id)}
                className={cn(
                    "flex items-center justify-center gap-1.5 py-2.5 rounded-md text-[9px] font-black tracking-widest transition-all",
                    mainMode === m.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "bg-transparent text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <m.icon size={12} /> {m.id.toUpperCase()}
            </button>
        ))}
      </div>

      {/* Primary Actions (Run / Reset) */}
      <div className="flex gap-2 mt-1">
        <button 
          onClick={onResetAll}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs border border-slate-600/50 transition-all active:scale-95"
        >
          <RotateCcw size={14} /> RESET
        </button>
        <button 
          onClick={onRunAll}
          disabled={mainMode === 'practice'}
          className={cn(
              "flex-[2] flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs shadow-xl transition-all active:scale-95",
              mainMode === 'practice' 
                ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30"
          )}
        >
          <Play size={14} fill="currentColor" /> RUN SELECTED
        </button>
      </div>

      {/* Algorithm Selection (Checkboxes) - only for simulation */}
      {mainMode === 'simulation' && (
        <div className="flex flex-col gap-2 mt-2">
          <button 
             onClick={toggleAllAlgos}
             className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase transition-all hover:bg-indigo-500/10"
          >
             <div className={cn(
                 "w-4 h-4 rounded border flex items-center justify-center transition-all",
                 allSelected ? "bg-indigo-500 border-indigo-500" : "border-slate-600"
             )}>
                 {allSelected && <Check size={12} className="text-white" />}
             </div>
             {allSelected ? 'Deselect All' : 'Select All Algorithms'}
          </button>

          <div className="grid grid-cols-1 gap-1.5">
            {simulationAlgos.map(algo => (
              <label 
                key={algo.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all cursor-pointer",
                  selectedAlgos.has(algo.id) 
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-100" 
                    : "bg-slate-900/30 border-transparent text-slate-500 hover:text-slate-400"
                )}
              >
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={selectedAlgos.has(algo.id)}
                  onChange={() => toggleAlgo(algo.id)}
                />
                <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-all",
                    selectedAlgos.has(algo.id) ? "bg-indigo-500 border-indigo-500" : "border-slate-700"
                )}>
                    {selectedAlgos.has(algo.id) && <Check size={12} className="text-white" />}
                </div>
                <algo.icon size={12} className={selectedAlgos.has(algo.id) ? "text-indigo-400" : ""} />
                <span className="text-[10px] font-bold tracking-wider">{algo.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Unified Size Selection */}
      <div className="mt-auto pt-3 border-t border-slate-700/50">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2 text-center">Select Order (N x N)</span>
        <div className="grid grid-cols-4 gap-1.5">
          {ALL_SIZES.map(size => (
            <button 
              key={size}
              onClick={() => setSelectedSize(size)}
              className={cn(
                "py-2 rounded-lg font-bold text-xs transition-all border",
                selectedSize === size 
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-lg" 
                  : "bg-slate-900/30 border-transparent text-slate-500 hover:text-slate-300"
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

export default function MagicSquareBoard({ speed }) {
  const [selectedSize, setSelectedSize] = useState(3);
  const [selectedAlgos, setSelectedAlgos] = useState(new Set(['formula', 'smart']));
  const [mainMode, setMainMode] = useState('simulation');
  const [triggerRun, setTriggerRun] = useState(0);
  const [triggerReset, setTriggerReset] = useState(0);

  const toggleAlgo = (id) => {
    setSelectedAlgos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllAlgos = () => {
    if (selectedAlgos.size === 5) {
        setSelectedAlgos(new Set(['formula']));
    } else {
        setSelectedAlgos(new Set(['formula', 'backtrack', 'smart', 'heuristic', 'brute']));
    }
  };

  const stepsData = useMemo(() => {
    return generateMagicSquareSteps(selectedSize);
  }, [selectedSize]);

  const handleRunAll = () => setTriggerRun(prev => prev + 1);
  const handleResetAll = () => setTriggerReset(prev => prev + 1);

  const activeAlgos = [...selectedAlgos];
  
  // Combine boards and controller into a list for indexed rendering
  const renderItems = [];
  if (mainMode === 'simulation') {
    activeAlgos.forEach((algoId, idx) => {
      renderItems.push({ type: 'board', algoId });
    });
  } else {
    renderItems.push({ type: 'board', algoId: 'formula' });
  }

  // Insert controller at 3rd position (index 2) or at the end if fewer than 2 boards
  const insertIdx = Math.min(2, renderItems.length);
  renderItems.splice(insertIdx, 0, { type: 'control' });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {renderItems.map((item, index) => (
            item.type === 'control' ? (
                <MagicControlCard 
                    key="control-card"
                    selectedSize={selectedSize}
                    setSelectedSize={setSelectedSize}
                    selectedAlgos={selectedAlgos}
                    toggleAlgo={toggleAlgo}
                    toggleAllAlgos={toggleAllAlgos}
                    mainMode={mainMode}
                    setMainMode={setMainMode}
                    onRunAll={handleRunAll}
                    onResetAll={handleResetAll}
                />
            ) : (
                <MagicSquareCard 
                    key={`${selectedSize}-${item.algoId}-${index}`}
                    size={selectedSize}
                    mainMode={mainMode}
                    algoMode={item.algoId}
                    steps={stepsData}
                    speed={speed}
                    triggerRun={triggerRun}
                    triggerReset={triggerReset}
                />
            )
        ))}
      </div>

      {/* Lab Info Banner */}
      <div className="mt-12 bg-indigo-950/20 border border-indigo-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-inner">
          <div className="p-5 bg-indigo-500/20 rounded-2xl text-indigo-400 shadow-lg shadow-indigo-500/20">
              <GraduationCap size={40} />
          </div>
          <div className="text-center md:text-left">
              <h4 className="text-indigo-200 font-black text-xl mb-2 uppercase tracking-widest">Algorithm Comparison Lab</h4>
              <p className="text-indigo-100/40 text-sm leading-relaxed max-w-2xl font-medium">
                  실험실 모드에서는 동일한 <span className="text-indigo-300">{selectedSize}x{selectedSize}</span> 환경에서 다양한 논리 엔진이 어떻게 동작하는지 관찰합니다. 
                  <br className="hidden md:block" />
                  직관적인 공식(Formula)부터 복잡한 백트래킹(Backtracking)까지, 각 알고리즘의 효율성을 실시간으로 비교해보세요.
              </p>
          </div>
      </div>
    </div>
  );
}
