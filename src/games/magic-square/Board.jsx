import React, { useState, useMemo, useEffect } from 'react';
import { MagicSquareCard } from './MagicSquareCard';
import { generateMagicSquareSteps } from './logic';
import { BookOpen, GraduationCap, LayoutGrid, Zap, RotateCcw, Sliders, Play, Check, BrainCircuit } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import { useMagicSquareGame } from './useMagicSquareGame';
import { MagicMobileControlBar } from './MagicMobileControlBar';
import { MagicScoreboard } from './MagicScoreboard';
import { MagicAlgoTable } from './MagicAlgoTable';
import { Info } from 'lucide-react';

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
    onResetAll,
    showAlgoTable,
    setShowAlgoTable
}) => {
  const simulationAlgos = [
    { id: 'dynamic', label: 'Heuristic CSP', icon: BrainCircuit },
    { id: 'heuristic', label: 'Smart Backtrack', icon: LayoutGrid },
    { id: 'metric', label: 'Metric Backtrack', icon: Zap },
    { id: 'backtrack', label: 'Recursive Backtrack', icon: RotateCcw },
    { id: 'brute', label: 'Pure Brute Force', icon: Sliders },
    { id: 'formula', label: 'Direct Formula', icon: BookOpen },
  ];

  const allSelected = selectedAlgos.size === simulationAlgos.length;
  const noneSelected = selectedAlgos.size === 0;

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
                    ? "bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 shadow-lg shadow-emerald-500/10" 
                    : "bg-transparent text-slate-500 hover:text-slate-400 hover:bg-white/5"
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
                : "bg-emerald-400/90 hover:bg-emerald-400 text-white shadow-emerald-400/20 font-black tracking-widest"
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
             className={cn(
               "flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/40 border transition-all hover:bg-emerald-500/10",
               noneSelected ? "border-slate-700 text-slate-500" : "border-emerald-500/20 text-emerald-300"
             )}
          >
             <div className={cn(
                 "w-4 h-4 rounded-md flex items-center justify-center transition-all",
                 allSelected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]" : 
                 (noneSelected ? "border border-slate-700 bg-slate-800/50" : "border border-emerald-400/30 bg-emerald-400/10")
             )}>
                 {allSelected && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />}
                 {!allSelected && !noneSelected && <div className="w-1.5 h-1.5 bg-emerald-400/80 rounded-sm" />}
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">
                {allSelected ? "Deselect All" : noneSelected ? "Select All" : "Reset Selection"} ({selectedAlgos.size}/{simulationAlgos.length})
             </span>
          </button>

          <div className="grid grid-cols-1 gap-1.5">
            {simulationAlgos.map(algo => (
              <label 
                key={algo.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all cursor-pointer group",
                  selectedAlgos.has(algo.id) 
                    ? "bg-emerald-600/10 border-emerald-500/40 text-white" 
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
                    "w-4 h-4 rounded-md flex items-center justify-center transition-all",
                    selectedAlgos.has(algo.id) 
                      ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.3)]" 
                      : "border border-slate-700 bg-slate-800/50 group-hover:border-slate-600"
                )}>
                    {selectedAlgos.has(algo.id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <algo.icon size={13} className={selectedAlgos.has(algo.id) ? "text-emerald-400" : "text-slate-600"} />
                <span className="text-[11px] font-black uppercase tracking-tight">{algo.label}</span>
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

export default function MagicSquareBoard({ speed }) {
  const [selectedSize, setSelectedSize] = useState(3);
  const [selectedAlgos, setSelectedAlgos] = useState(new Set(['formula', 'metric']));
  const [mainMode, setMainMode] = useState('simulation');
  const [triggerRun, setTriggerRun] = useState(0);
  const [triggerReset, setTriggerReset] = useState(0);
  
  // Scoreboard state
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [scoreboardResults, setScoreboardResults] = useState([]);
  const resultsRef = React.useRef({});
  const runningSetRef = React.useRef(new Set());

  // Table state
  const [showAlgoTable, setShowAlgoTable] = useState(false);

  const toggleAlgo = (id) => {
    setSelectedAlgos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllAlgos = () => {
    const allIds = ['dynamic', 'heuristic', 'metric', 'backtrack', 'brute', 'formula'];
    if (selectedAlgos.size === allIds.length) {
        setSelectedAlgos(new Set());
    } else {
        setSelectedAlgos(new Set(allIds));
    }
  };

  const stepsData = useMemo(() => {
    return generateMagicSquareSteps(selectedSize);
  }, [selectedSize]);

  const handleRunAll = () => {
    resultsRef.current = {};
    runningSetRef.current = new Set(selectedAlgos);
    setShowScoreboard(false);
    setTriggerRun(prev => prev + 1);
  };

  const handleResetAll = () => {
    runningSetRef.current = new Set();
    setShowScoreboard(false);
    setTriggerReset(prev => prev + 1);
  };

  const handleAlgoComplete = (algoId, stats) => {
    if (mainMode !== 'simulation') return;
    
    const labels = {
      dynamic: { name: 'Heuristic CSP', complexity: 'O(Exp)' },
      heuristic: { name: 'Smart Backtrack', complexity: 'O(Exp)' },
      metric: { name: 'Metric Backtrack', complexity: 'O(Exp)' },
      backtrack: { name: 'Recursive Backtrack', complexity: 'O(n!)' },
      brute: { name: 'Pure Brute Force', complexity: 'O(Exp)' },
      formula: { name: 'Direct Formula', complexity: 'O(n^2)' }
    };

    if (runningSetRef.current.has(algoId)) {
        resultsRef.current[algoId] = {
            id: algoId,
            name: labels[algoId]?.name || algoId,
            attempts: stats.attempts,
            time: stats.time,
            complexity: labels[algoId]?.complexity
        };
        runningSetRef.current.delete(algoId);

        if (runningSetRef.current.size === 0 && Object.keys(resultsRef.current).length > 0) {
            setScoreboardResults(Object.values(resultsRef.current));
            // setShowScoreboard(true); // Temporarily disabled by user request
        }
    }
  };

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
                    showAlgoTable={showAlgoTable}
                    setShowAlgoTable={setShowAlgoTable}
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

      {/* Comparison Scoreboard */}
      {mainMode === 'simulation' && activeAlgos.length > 0 && (
          <div className="mt-12 overflow-hidden bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
              <div className="bg-slate-900/50 px-8 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                          <Sliders size={20} />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">실시간 성능 비교 분석 (Performance Analysis)</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE RANKING
                  </div>
              </div>
              <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeAlgos.map((algoId) => (
                            <ScoreCard 
                             key={`score-${algoId}`} 
                             algoId={algoId} 
                             size={selectedSize}
                             triggerRun={triggerRun}
                             triggerReset={triggerReset}
                             speed={speed}
                             steps={stepsData}
                             onComplete={(s) => handleAlgoComplete(algoId, s)}
                           />
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Lab Info Banner - Only show when no simulation is active to reduce clutter */}
      {mainMode !== 'simulation' && (
          <div className="mt-12 flex flex-col gap-6">
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                  <div className="p-5 bg-emerald-500/20 rounded-2xl text-emerald-300 shadow-xl shadow-emerald-500/10">
                      <GraduationCap size={40} />
                  </div>
                  <div className="text-center md:text-left flex-1">
                      <h4 className="text-emerald-300 font-black text-xl mb-2 uppercase tracking-widest">Algorithm Comparison Lab</h4>
                      <p className="text-emerald-100/60 text-sm leading-relaxed max-w-2xl font-semibold">
                          실험실 모드에서는 동일한 <span className="text-emerald-400">{selectedSize}x{selectedSize}</span> 환경에서 다양한 논리 엔진이 어떻게 동작하는지 관찰합니다. 
                          <br className="hidden md:block" />
                          직관적인 공식(Formula)부터 복잡한 백트래킹(Backtracking)까지, 각 알고리즘의 효율성을 실시간으로 비교해보세요.
                      </p>
                  </div>
              </div>
          </div>
      )}

      {showAlgoTable && <MagicAlgoTable />}

      {/* Mobile Floating Menu */}
      <MagicMobileControlBar 
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedAlgos={selectedAlgos}
          toggleAlgo={toggleAlgo}
          toggleAllAlgos={toggleAllAlgos}
          onRunAll={handleRunAll}
          onResetAll={handleResetAll}
          isRunningAny={false}
          mainMode={mainMode}
          setMainMode={setMainMode}
          showAlgoTable={showAlgoTable}
          setShowAlgoTable={setShowAlgoTable}
      />

      {/* Results Modal */}
      {showScoreboard && (
          <MagicScoreboard 
            results={scoreboardResults}
            onClose={() => setShowScoreboard(false)}
          />
      )}
    </div>
  );
}

const ScoreCard = ({ algoId, size, triggerRun, triggerReset, speed, steps, onComplete }) => {
    const [finalStats, setFinalStats] = useState({ attempts: 0, time: 0 });
    const [isDone, setIsDone] = useState(false);

    const labels = {
      dynamic: { name: 'Heuristic CSP', desc: '제약 충돌 회피 알고리즘', color: 'text-emerald-400/80', bg: 'bg-emerald-400/60' },
      heuristic: { name: 'Smart Backtrack', desc: '강제 할당 기반 백트래킹', color: 'text-teal-400/80', bg: 'bg-teal-400/60' },
      metric: { name: 'Metric Backtrack', desc: '거리 기반 가지치기', color: 'text-lime-400/80', bg: 'bg-lime-400/60' },
      backtrack: { name: 'Recursive Backtrack', desc: '재귀적 탐색 알고리즘', color: 'text-rose-400', bg: 'bg-rose-500' },
      brute: { name: 'Pure Brute Force', desc: '단순 전수 조사', color: 'text-slate-400', bg: 'bg-slate-500' },
      formula: { name: 'Direct Formula', desc: '정적 마방진 공식', color: 'text-emerald-400', bg: 'bg-emerald-500' }
    };

    const l = labels[algoId] || { name: algoId, desc: '', color: 'text-white', bg: 'bg-white' };

    const { stats: currentStats, isPlaying } = useMagicSquareGame({ 
        size, 
        mainMode: 'simulation', 
        algoMode: algoId, 
        steps: steps, 
        speed, 
        triggerRun, 
        triggerReset,
        onComplete: (s) => {
            setFinalStats(s);
            setIsDone(true);
            if (onComplete) onComplete(s);
        }
    });

    useEffect(() => {
        if (triggerReset > 0) {
            setFinalStats({ attempts: 0, time: 0 });
            setIsDone(false);
        }
    }, [triggerReset]);

    const displayStats = isDone ? finalStats : currentStats;

    return (
        <div className={cn(
            "p-5 rounded-2xl border transition-all duration-500",
            isPlaying ? "bg-slate-700/30 border-indigo-500/30 scale-105 shadow-lg shadow-indigo-500/10" : "bg-slate-900/40 border-white/5"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h5 className={cn("text-xs font-black uppercase tracking-widest mb-1", l.color)}>{l.name}</h5>
                    <p className="text-[9px] text-slate-500 font-bold">{l.desc}</p>
                </div>
                {isDone && <Check size={14} className="text-emerald-500" />}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Total Steps</span>
                    <span className="text-xl font-mono text-white flex items-baseline gap-1">
                        {displayStats.attempts.toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-bold tracking-normal">steps</span>
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Elapsed Time</span>
                    <span className="text-xl font-mono text-white flex items-baseline gap-1">
                        {(displayStats.time / 1000).toFixed(3)}
                        <span className="text-[10px] text-slate-500 font-bold tracking-normal">sec</span>
                    </span>
                </div>
            </div>

            <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    style={{ width: isPlaying ? '100%' : (isDone ? '100%' : '0%') }}
                    className={cn("h-full transition-all duration-1000 ease-out", l.bg, isPlaying ? "animate-pulse" : "")}
                />
            </div>
        </div>
    );
}
