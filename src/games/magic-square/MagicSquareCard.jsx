import React, { useEffect, useMemo } from 'react';
import { 
  Play, Pause, RefreshCw, ChevronLeft, ChevronRight, SkipBack, SkipForward,
  CheckCircle2, Target, Zap,
  Activity, Clock, Hash, BrainCircuit, LayoutGrid
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { audioEngine } from '../../utils/audio';
import { useMagicSquareGame } from './useMagicSquareGame';

export const MagicSquareCard = ({ 
  size, 
  mainMode, 
  algoMode, 
  steps, 
  speed = 500,
  triggerRun = 0,
  triggerReset = 0
}) => {
  const {
    currentStepIndex, setCurrentStepIndex,
    isPlaying, setIsPlaying,
    practiceBoard, targetNum,
    setFeedback,
    isSoundEnabled,
    resetPractice, handlePracticeClick,
    stats,
    dynamicDesc,
    dynamicHighlight
  } = useMagicSquareGame({ size, mainMode, algoMode, steps, speed, triggerRun, triggerReset });

  const mode = mainMode; 

  const currentStep = steps[currentStepIndex] || { board: [], desc: "" };
  const { highlight } = currentStep;
  const isComplete = mainMode === 'simulation' ? (algoMode === 'formula' ? currentStep?.type === 'complete' : targetNum > size * size) : targetNum > size * size;
  const magicConstant = (size * (size * size + 1)) / 2;

  const colSums = useMemo(() => {
    const sums = Array(size).fill(0);
    const filled = Array(size).fill(0);
    practiceBoard.forEach(row => {
      row.forEach((v, c) => {
        if (v !== null) {
          sums[c] += v;
          filled[c]++;
        }
      });
    });
    return sums.map((s, i) => ({ 
      sum: s, 
      isComplete: s === magicConstant && filled[i] === size 
    }));
  }, [practiceBoard, size, magicConstant]);

  useEffect(() => {
    if (isComplete && isSoundEnabled) audioEngine.playSuccess();
  }, [isComplete, isSoundEnabled]);

  const onCellClick = (r, c) => {
    handlePracticeClick(
      r, c,
      (correctStep) => {
        setFeedback({ type: 'success', msg: correctStep.desc, icon: CheckCircle2 });
        setTimeout(() => setFeedback(null), 1000);
      },
      () => {
        setFeedback({ type: 'error', msg: "Wrong", icon: Target });
        setTimeout(() => setFeedback(null), 1000);
      }
    );
  };

  const getCellSize = () => {
    if (size <= 3) return "w-16 h-16 text-2xl";
    if (size <= 5) return "w-12 h-12 text-lg";
    return "w-8 h-8 text-xs";
  };

  const getGapSize = () => {
    if (size <= 5) return "gap-2";
    if (size <= 9) return "gap-1";
    return "gap-0.5";
  };

  const getAlgoFullLabel = (id) => {
    const labels = {
      dynamic: 'Heuristic CSP',
      heuristic: 'Smart Backtrack',
      metric: 'Metric Backtrack',
      backtrack: 'Recursive Backtrack',
      brute: 'Pure Brute Force',
      formula: 'Direct Formula'
    };
    return labels[id] || id;
  };

  return (
    <div className={cn(
      "bg-slate-800/40 backdrop-blur-md border rounded-xl p-3 flex flex-col shadow-xl transition-all group overflow-hidden h-full",
      isComplete ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]" : "border-slate-700/50"
    )}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 min-h-[32px]">
        <div className="flex items-center gap-2">
            {algoMode === 'dynamic' ? <BrainCircuit size={14} className="text-emerald-400/60" /> : <Zap size={14} className="text-emerald-400/60" />}
            <h3 className={cn("text-xs font-bold uppercase tracking-widest", mainMode === 'simulation' ? "text-emerald-400/50" : "text-emerald-400/50")}>
                {mainMode === 'simulation' ? getAlgoFullLabel(algoMode) : `${size}x${size} Practice`}
            </h3>
        </div>
        
        <div className="flex items-center gap-1.5">
           {mainMode === 'simulation' && (
             <>
               <span className="text-[9px] bg-slate-700/30 text-emerald-400/40 px-1.5 py-1 rounded font-mono border border-white/5 mr-2">
                 {algoMode === 'formula' ? 'O(n^2)' : algoMode === 'backtrack' ? 'O(n!)' : 'O(Exp)'}
               </span>

               <div className="flex items-center">
                 {!isPlaying ? (
                    <button 
                      onClick={() => isComplete ? resetPractice() : setIsPlaying(true)}
                      className={cn(
                        "p-1.5 rounded-lg transition-all active:scale-95 border",
                        isComplete 
                          ? "bg-slate-700/50 text-slate-400 border-slate-600/30" 
                          : "bg-emerald-400/10 text-emerald-400/60 hover:bg-emerald-400/20 border-emerald-500/10"
                      )}
                    >
                      {isComplete ? <RefreshCw size={14} /> : <Play size={14} fill="currentColor" />}
                    </button>
                 ) : (
                    <button 
                      onClick={() => setIsPlaying(false)}
                      className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all active:scale-95 border border-rose-500/20"
                    >
                      <div className="w-3 h-3 bg-current rounded-sm" />
                    </button>
                 )}
               </div>
             </>
           )}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] relative p-2">
        <div className="flex flex-col gap-1">
          {practiceBoard.map((row, r) => {
            const rowSum = row.reduce((a, b) => a + (b || 0), 0);
            const isRowComplete = rowSum === magicConstant && row.every(v => v !== null);
            const cellClasses = getCellSize();

            return (
              <div key={`row-${r}`} className={cn("flex items-center", getGapSize())}>
                 {row.map((v, c) => {
                     // Dynamic Highlight (Learning Focus)
                     const isDynHighlight = algoMode === 'dynamic' && dynamicHighlight?.r === r && dynamicHighlight?.c === c;
                     const isFormulaHighlight = algoMode === 'formula' && highlight?.r === r && highlight?.c === c;
                     const highlightType = algoMode === 'dynamic' ? dynamicHighlight?.type : null;

                     let successColor = "";
                     let successBorder = "";
                     if (isComplete) {
                        const isCorner = (r===0 || r===size-1) && (c===0 || c===size-1);
                        const isCenter = r === Math.floor(size/2) && c === Math.floor(size/2);
                        if (isCorner || isCenter) {
                            successBorder = "border-2 border-amber-400/80";
                            successColor = "text-white";
                        } else if (c === Math.floor(size/2)) {
                            successColor = "text-pink-300 bg-pink-900/20";
                            successBorder = "border border-pink-500/30";
                        } else {
                            successColor = "text-sky-300 bg-sky-900/40";
                            successBorder = "border border-sky-500/30";
                        }
                     }

                      const getFormulaColor = (val, r, c, isDone) => {
                          if (!val) return null;
                          const spatialRatio = (r + c) / ((size - 1) * 2);
                          // Shift gradient towards orange using power function
                          // 140 (Emerald) to 20 (Deep Orange)
                          const hue = 140 - (Math.pow(spatialRatio, 0.6) * 120);
                          const saturation = isDone ? '85%' : '95%';
                          const lightness = isDone ? '45%' : '50%';
                          return `hsla(${hue}, ${saturation}, ${lightness}, ${isDone ? 0.75 : 0.9})`;
                      };

                      const isFormula = algoMode === 'formula';
                      const formulaStyle = v && isFormula ? {
                          backgroundColor: getFormulaColor(v, r, c, isComplete),
                          borderColor: `hsla(${140 - (Math.pow((r + c) / ((size - 1) * 2), 0.6) * 120)}, 95%, 65%, 0.75)`,
                          color: '#fff',
                          textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                          boxShadow: isFormulaHighlight ? `0 0 30px hsla(${140 - (Math.pow((r + c) / ((size - 1) * 2), 0.6) * 120)}, 95%, 65%, 0.7)` : 'inset 0 0 10px rgba(0,0,0,0.2)'
                      } : {};

                      return (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => mainMode === 'practice' && onCellClick(r, c)}
                          style={formulaStyle}
                          className={cn(
                            "flex items-center justify-center rounded-md font-black transition-all relative overflow-hidden",
                            cellClasses, 
                            v ? (+v > 0) ? (isComplete ? "" : "text-emerald-50") : "text-transparent" : "text-transparent",
                            isFormula ? "border-2" : (
                                !isComplete && v ? "bg-emerald-900/40 border border-emerald-500/20" : (!isComplete && "bg-slate-800/50 border border-slate-700/30")
                            ),
                            // Advanced initial state for Formula
                            isFormula && !v && !isComplete && "bg-slate-900/60 border-emerald-500/10 border-dashed",
                            isComplete && !isFormula && successColor,
                            isComplete && !isFormula ? (successBorder || "border border-transparent") : "",
                            isFormulaHighlight && mainMode === 'simulation' && "ring-2 ring-white z-20 scale-125 shadow-[0_0_30px_rgba(255,255,255,0.4)] rotate-[2deg] animate-in zoom-in duration-200",
                            isDynHighlight && highlightType === 'active' && "ring-2 ring-amber-400 bg-amber-900/40 z-10 scale-105",
                            isDynHighlight && highlightType === 'forced' && "ring-2 ring-purple-400 bg-purple-900/60 z-10 scale-110 shadow-lg shadow-purple-500/40",
                            isDynHighlight && highlightType === 'backtrack' && "ring-2 ring-rose-500 bg-rose-500/30 z-10 animate-pulse"
                          )}
                        >
                          {v || (isFormula && !isComplete && <div className="opacity-[0.03] scale-150"><LayoutGrid size={24} /></div>)}
                          {/* Forced/Backtrack Indicators */}
                          {isDynHighlight && highlightType === 'forced' && (
                             <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
                          )}
                          {isDynHighlight && highlightType === 'backtrack' && (
                             <div className="absolute inset-0 bg-rose-500/20 animate-pulse" />
                          )}
                        </div>
                     );
                  })}
                 
                  <div className={cn(
                    "flex items-center justify-center font-mono font-bold transition-all duration-700",
                    "w-6 h-6 ml-1 text-[9px]", 
                    isRowComplete ? "text-sky-400" : "text-slate-600",
                    isComplete ? "opacity-100" : "opacity-0"
                  )}>
                    {rowSum > 0 ? rowSum : ''}
                  </div>
              </div>
            );
          })}

          <div className={cn("flex items-center mt-1", getGapSize())}>
            {colSums.map((cs, i) => (
              <div 
                key={`colsum-${i}`} 
                className={cn(
                  "flex items-center justify-center font-mono font-bold transition-all duration-700",
                  getCellSize(), 
                  "text-[9px] h-6",
                  cs.isComplete ? "text-sky-400" : "text-slate-600",
                  isComplete ? "opacity-100" : "opacity-0"
                )}
              >
                {cs.sum > 0 ? cs.sum : ''}
              </div>
            ))}
            <div className="w-6 h-6 ml-1" /> 
          </div>
        </div>
      </div>

      {/* Footer Area */}
      {mainMode === 'simulation' ? (
        <div className="flex flex-col mt-2">
            {/* Intelligent Description for Learning */}
            <div className="h-10 flex items-center justify-center mb-1 px-4 bg-slate-900/60 rounded-lg border border-amber-500/20 shadow-inner">
                <span className={cn(
                    "text-[12px] font-black uppercase tracking-wider text-center",
                    "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]"
                )}>
                    {algoMode !== 'formula' ? (dynamicDesc || "Ready...") : (currentStep?.desc || (isComplete ? 'Simulation Finished' : 'Solving...'))}
                </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-700/50">
                <div className="flex flex-col items-center">
                <Activity size={14} className="text-rose-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase">Steps</span>
                <span className="text-sm font-mono text-slate-200">{stats?.attempts || 0}</span>
                </div>
                <div className="flex flex-col items-center">
                <Hash size={14} className="text-amber-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase">Target</span>
                <span className="text-sm font-mono text-slate-200">{magicConstant}</span>
                </div>
                <div className="flex flex-col items-center">
                <Clock size={14} className="text-sky-400 mb-1" />
                <span className="text-[10px] text-slate-400 uppercase">Time</span>
                <span className="text-sm font-mono text-slate-200">{stats ? (stats.time / 1000).toFixed(2) : "0.00"}s</span>
                </div>
            </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3 border-t border-slate-700/50 pt-3">
             <div className="h-6 flex items-center">
                 <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">Next Number: {targetNum}</span>
             </div>
             <button onClick={resetPractice} className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-300 flex items-center justify-center gap-2 transition-all">
                <RefreshCw size={12} /> Reset Board
             </button>
        </div>
      )}
    </div>
  );
};
