import React, { useEffect, useMemo } from 'react';
import { 
  Play, Pause, RefreshCw, ChevronLeft, ChevronRight, SkipBack, SkipForward,
  CheckCircle2, Target, Zap,
  Activity, Clock, Hash
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { audioEngine } from '../../utils/audio';
import { useMagicSquareGame } from './useMagicSquareGame';

export const MagicSquareCard = ({ 
  size, 
  mainMode, 
  algoMode, 
  steps, 
  speed = 500
}) => {
  const {
    currentStepIndex, setCurrentStepIndex,
    isPlaying, setIsPlaying,
    practiceBoard, targetNum,
    setFeedback,
    isSoundEnabled,
    resetPractice, handlePracticeClick,
    stats
  } = useMagicSquareGame({ size, mainMode, algoMode, steps, speed });

  const mode = mainMode; // 'simulation' | 'practice'

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

  // Sound effect for completion
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

  return (
    <div className={cn(
      "bg-slate-800/40 backdrop-blur-md border rounded-xl p-4 flex flex-col shadow-xl transition-all group overflow-hidden",
      isComplete ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-700"
    )}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4 min-h-[32px]">
        <div className="flex items-center gap-2">
            <h3 className={cn("text-xs font-bold uppercase tracking-widest", mainMode === 'simulation' ? "text-indigo-300" : "text-emerald-300")}>
                {mainMode === 'simulation' ? algoMode.replace(/-/g, ' ') : `${size}x${size} Practice`}
            </h3>
        </div>
        
        <div className="flex items-center gap-1.5">
           {/* Simulation Mode: Show complexity and control */}
           {mainMode === 'simulation' && (
             <>
               <span className="text-[9px] bg-slate-700/50 text-indigo-300/80 px-1.5 py-1 rounded font-mono border border-white/5 mr-2">
                 {algoMode === 'formula' ? 'O(n)' : algoMode === 'backtrack' ? 'O(n!)' : 'O(??)'}
               </span>

               <div className="flex items-center">
                 {isPlaying ? (
                   <button 
                     onClick={() => setIsPlaying(false)}
                     className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all active:scale-95 border border-rose-500/20"
                   >
                     <div className="w-3 h-3 bg-current rounded-sm" />
                   </button>
                 ) : (
                   <button 
                     onClick={() => isComplete ? resetPractice() : setIsPlaying(true)}
                     className={cn(
                       "p-1.5 rounded-lg transition-all active:scale-95 border",
                       isComplete 
                         ? "bg-slate-700 text-slate-300 border-slate-600" 
                         : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/20"
                     )}
                   >
                     {isComplete ? <RefreshCw size={14} /> : <Play size={14} fill="currentColor" />}
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
                 {/* Cells */}
                 {row.map((v, c) => {
                     const isHighlight = algoMode === 'formula' && highlight?.r === r && highlight?.c === c;
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

                     return (
                        <div
                          key={`${r}-${c}`}
                          onClick={() => mainMode === 'practice' && onCellClick(r, c)}
                          className={cn(
                            "flex items-center justify-center rounded-md font-bold transition-all relative overflow-hidden",
                            cellClasses, 
                            v ? (+v > 0) ? (isComplete ? "" : "text-emerald-50") : "text-transparent" : "text-transparent",
                            !isComplete && v ? "bg-emerald-900/40 border border-emerald-500/20" : (!isComplete && "bg-slate-800/50 border border-slate-700/30"),
                            isComplete && successColor,
                            isComplete ? (successBorder || "border border-transparent") : "",
                            isHighlight && mainMode === 'simulation' && algoMode === 'formula' && "ring-2 ring-emerald-400 z-10"
                          )}
                        >
                          {v || ''}
                        </div>
                     );
                  })}
                 
                  {/* Row Sum Indicator */}
                  <div className={cn(
                   "flex items-center justify-center rounded-md font-mono font-bold transition-all duration-700 border",
                   cellClasses, // Use same size classes as cells
                   "text-[10px]", 
                   isRowComplete 
                     ? "bg-sky-700 text-white border-sky-600 shadow-sm" 
                     : "bg-slate-700/40 text-slate-400 border-slate-600/30",
                   isComplete ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )}>
                    {rowSum > 0 ? rowSum : '-'}
                  </div>
              </div>
            );
          })}

          {/* Column Sums Row */}
          <div className={cn("flex items-center", getGapSize())}>
            {colSums.map((cs, i) => (
              <div 
                key={`colsum-${i}`} 
                className={cn(
                  "flex items-center justify-center rounded-md font-mono font-bold transition-all duration-700 border",
                  getCellSize(),
                  "text-[10px]",
                  cs.isComplete 
                    ? "bg-sky-700 text-white border-sky-600 shadow-sm" 
                    : "bg-slate-700/40 text-slate-400 border-slate-600/30",
                  isComplete ? "opacity-100 scale-100" : "opacity-0 scale-95"
                )}
              >
                {cs.sum > 0 ? cs.sum : '-'}
              </div>
            ))}
            {/* Empty corner spacer */}
            <div className={getCellSize()} />
          </div>
        </div>
      </div>

      {/* Footer Area: Stats for all Simulations */}
      {mainMode === 'simulation' ? (
        <div className="flex flex-col mt-2">
            {/* Description for Simulation Steps */}
            <div className="h-6 flex items-center justify-center mb-1">
                <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-wide animate-pulse">
                    {currentStep?.desc || (isComplete ? 'Simulation Finished' : 'Solving...')}
                </span>
            </div>
            <div className="grid grid-cols-3 gap-2 py-2 border-t border-slate-700/50">
            <div className="flex flex-col items-center">
              <Activity size={14} className="text-rose-400 mb-1" />
              <span className="text-[10px] text-slate-400 uppercase">Attempts</span>
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
        /* Learn & Practice Controls */
        <>
            <div className="mt-4 flex flex-col items-center gap-3">
                <div className="h-6 flex items-center">
                    {mainMode === 'simulation' && algoMode === 'formula' ? (
                        <span className="text-[9px] font-bold text-emerald-400/80 uppercase tracking-wide">{currentStep.desc}</span>
                    ) : (
                        <span className="text-[9px] font-bold text-blue-400 uppercase">Target: {targetNum}</span>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between w-full border-t border-slate-700/50 pt-3 mt-auto">
                {mode === 'practice' ? (
                    <button onClick={resetPractice} className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-300 flex items-center justify-center gap-2 transition-all">
                        <RefreshCw size={12} /> Reset
                    </button>
                ) : (
                    <div className="flex items-center justify-between w-full">
                        <div className="flex gap-1 w-16">
                            {mode === 'learn' && (
                                <>
                                    <button onClick={() => setCurrentStepIndex(0)} className="p-1.5 text-slate-500 hover:text-white"><SkipBack size={14} /></button>
                                    <button onClick={() => setCurrentStepIndex(p => Math.max(0, p-1))} className="p-1.5 text-slate-500 hover:text-white"><ChevronLeft size={14} /></button>
                                </>
                            )}
                        </div>
                        <button 
                            onClick={() => isComplete ? setCurrentStepIndex(0) : setIsPlaying(!isPlaying)}
                            className={cn(
                                "w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-lg transition-all active:scale-95",
                                isComplete ? "bg-slate-600" : isPlaying ? "bg-amber-500 shadow-amber-500/30" : "bg-emerald-600 shadow-emerald-500/20"
                            )}
                        >
                            {isComplete ? <RefreshCw size={18} /> : isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                        </button>
                        <div className="flex gap-1 w-16 justify-end">
                            {mode === 'learn' && (
                                <>
                                    <button onClick={() => setCurrentStepIndex(p => Math.min(steps.length-1, p+1))} className="p-1.5 text-slate-500 hover:text-white"><ChevronRight size={14} /></button>
                                    <button onClick={() => setCurrentStepIndex(steps.length-1)} className="p-1.5 text-slate-500 hover:text-white"><SkipForward size={14} /></button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
      )}
    </div>
  );
};
