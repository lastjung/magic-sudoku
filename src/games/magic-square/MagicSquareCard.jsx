import React, { useEffect, useMemo } from 'react';
import { 
  Play, Pause, RefreshCw, ChevronLeft, ChevronRight, SkipBack, SkipForward,
  CheckCircle2, Target, Zap,
  Activity, Clock, Hash, BrainCircuit, LayoutGrid, Trophy
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

  const currentStep = steps[currentStepIndex] || { board: [], desc: "" };
  const { highlight } = currentStep;
  const isComplete = mainMode === 'simulation' ? ((algoMode === 'formula' || algoMode === 'swing') ? currentStep?.type === 'complete' : targetNum > size * size) : targetNum > size * size;
  const magicConstant = (size * (size * size + 1)) / 2;

  // Sync board for Formula/Swing Mode - only when playing or complete
  const displayBoard = (mainMode === 'simulation' && (algoMode === 'formula' || algoMode === 'swing') && (isPlaying || isComplete || currentStepIndex > 0) && currentStep?.board?.length > 0) 
    ? currentStep.board 
    : practiceBoard;

  const colSums = useMemo(() => {
    const sums = Array(size).fill(0);
    const filled = Array(size).fill(0);
    displayBoard.forEach(row => {
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
  }, [displayBoard, size, magicConstant]);

  useEffect(() => {
    if (isComplete && isSoundEnabled) audioEngine.playSuccess();
  }, [isComplete, isSoundEnabled]);

  const progressPercent = useMemo(() => {
    // Milestone-based progress for both Swing and Direct Formula
    if (mainMode === 'simulation' && (algoMode === 'swing' || (algoMode === 'formula' && size % 2 === 0)) && steps.length > 0) {
      const type = steps[currentStepIndex]?.type;
      
      // Completion is always 100%
      if (isComplete || type === 'complete') return "100.0";
      
      // Swing Specific Milestones
      if (algoMode === 'swing') {
        if (type === 'swing_rotating') return "80.0";
        if (type === 'highlight_targets') return "50.0";
        return "0.0"; // 0 during fill
      }
      
      // Doubly/Singly Even (Formula) Milestones
      if (algoMode === 'formula') {
        if (type === 'setup') return "0.0";
        if (type === 'scan' || type === 'pop_prepare') return "50.0";
        if (type === 'mass_invert') return "85.0";
        return "90.0"; // Settle/other phases
      }
    }

    // Default Linear Progress for Odd squares or others
    if (mainMode === 'simulation' && steps.length > 0) {
      const total = steps.length;
      const current = isComplete ? total : currentStepIndex + 1;
      return ((current / total) * 100).toFixed(1);
    }

    // Default: Count filled cells
    let filledCount = 0;
    displayBoard.forEach(row => {
      row.forEach(cell => {
        if (cell !== null && cell > 0) filledCount++;
      });
    });
    return ((filledCount / (size * size)) * 100).toFixed(1);
  }, [displayBoard, size, isComplete, currentStepIndex, steps.length, algoMode, mainMode]);

  const getCellSize = () => {
    if (size <= 3) return "w-16 h-16 text-2xl";
    if (size <= 4) return "w-14 h-14 text-xl";
    if (size <= 5) return "w-12 h-12 text-lg font-black";
    if (size <= 7) return "w-11 h-11 text-base font-black";
    if (size <= 9) return "w-[38px] h-[38px] text-xs font-black"; // Slightly reduced for breathing room
    return "w-[30px] h-[30px] text-[10px]";
  };

  const getGapSize = () => {
    if (size <= 5) return "gap-2";
    if (size <= 7) return "gap-1.5";
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
      formula: 'Direct Formula',
      swing: 'Formula Swing'
    };
    return labels[id] || id;
  };

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

  const getFormulaColor = (val, r, c, isDone) => {
    if (!val) return null;
    const spatialRatio = (r + c) / ((size - 1) * 2);
    const hue = 140 - (Math.pow(spatialRatio, 0.6) * 120);
    const saturation = isDone ? '85%' : '95%';
    const lightness = isDone ? '45%' : '50%';
    return `hsla(${hue}, ${saturation}, ${lightness}, ${isDone ? 0.75 : 0.9})`;
  };

  return (
    <div className={cn(
      "bg-slate-800/40 backdrop-blur-md border rounded-xl p-1.5 flex flex-col shadow-xl transition-all group overflow-hidden",
      isComplete ? "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.05)]" : "border-slate-700/50"
    )}>
      {/* Header */}
      <div className="flex justify-between items-center mb-1.5 min-h-[28px]">
        <div className="flex items-center gap-2">
            {algoMode === 'dynamic' ? <BrainCircuit size={14} className="text-emerald-400/60" /> : <Zap size={14} className="text-emerald-400/60" />}
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/50">
                {mainMode === 'simulation' ? getAlgoFullLabel(algoMode) : `${size}x${size} Practice`}
            </h3>
        </div>
        
        <div className="flex items-center gap-1.5">
           {mainMode === 'simulation' && (
             <>
               <button 
                 onClick={resetPractice}
                 className="p-1.5 rounded-lg bg-slate-700/30 text-slate-500 hover:text-emerald-400 border border-white/5 transition-all active:scale-95 mr-1"
                 title="Reset Strategy"
               >
                 <RefreshCw size={13} />
               </button>

                <div className="flex items-center">
                 {!isPlaying ? (
                    <button 
                      onClick={() => {
                        if (isComplete) resetPractice();
                        setIsPlaying(true);
                      }}
                      className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400/60 hover:bg-emerald-400/20 border border-emerald-500/10 transition-all active:scale-95"
                    >
                      <Play size={14} fill="currentColor" />
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

      {/* Algorithm Legend - Shared layout to align board starting points */}
      {mainMode === 'simulation' && (
          <div className={cn(
            "flex justify-between px-4 py-2.5 border-b border-slate-700/30 bg-slate-900/40",
            (algoMode === 'formula' || algoMode === 'swing') ? "invisible h-[34px]" : "h-auto"
          )}>
              <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Active</span>
              </div>
              <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_5px_rgba(168,85,247,0.5)]" />
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Forced</span>
              </div>
              <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Backtrack</span>
              </div>
              <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Success</span>
              </div>
          </div>
      )}

      {/* Board */}
      <div className={cn(
        "flex flex-col items-center justify-center relative px-2 flex-1 transition-all duration-500",
        size > 7 ? "py-6" : "py-3"
      )}>
        <div className="flex flex-col gap-1">
          {displayBoard.map((row, r) => {
            const rowSum = row.reduce((a, b) => a + (b || 0), 0);
            const isRowComplete = rowSum === magicConstant && row.every(v => v !== null);
            const cellClasses = getCellSize();

            return (
              <div key={`row-${r}`} className={cn("flex items-center", getGapSize())}>
                <div className="w-5 h-5 mr-1 opacity-0" />
                {row.map((v, c) => {
                  const isDynHighlight = isPlaying && algoMode === 'dynamic' && dynamicHighlight?.r === r && dynamicHighlight?.c === c;
                  const isFormulaHighlight = isPlaying && (algoMode === 'formula' || algoMode === 'swing') && highlight?.r === r && highlight?.c === c;
                  const highlightType = algoMode === 'dynamic' ? dynamicHighlight?.type : null;
                  const isFormula = algoMode === 'formula' || algoMode === 'swing';

                  let cellStyle = {};
                  if (v && algoMode === 'formula') {
                    const bg = getFormulaColor(v, r, c, isComplete);
                    cellStyle = {
                      backgroundColor: bg,
                      borderColor: `hsla(${140 - (Math.pow((r + c) / ((size - 1) * 2), 0.6) * 120)}, 95%, 65%, 0.75)`,
                      color: '#fff',
                      textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                      boxShadow: isFormulaHighlight ? `0 0 30px ${bg}` : 'inset 0 0 10px rgba(0,0,0,0.2)'
                    };
                  }

                  let swingStyle = {};
                  const isSwingTarget4 = algoMode === 'swing' && size === 4 && (c === 1 || c === 2);
                  const isSwingTarget8 = algoMode === 'swing' && size === 8 && (c === 1 || c === 2 || c === 5 || c === 6);
                  
                  if (isSwingTarget4 && (currentStep?.type === 'highlight_targets' || currentStep?.type === 'swing_rotating' || isComplete)) {
                    const w = 56; // Cell width for 4x4
                    const g = 8;  // gap-2 is 8px
                    const stride = w + g;
                    
                    const offsetX = (1.5 - c) * stride;
                    const offsetY = (1.5 - r) * stride;
                    
                    const originX = ((w / 2 + offsetX) / w) * 100;
                    const originY = ((w / 2 + offsetY) / w) * 100;

                    swingStyle = {
                      backgroundColor: 'rgba(245, 158, 11, 0.6)',
                      borderColor: 'rgb(245, 158, 11)',
                      boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)',
                      color: '#fff',
                      zIndex: 40,
                      ...(currentStep?.type === 'swing_rotating' ? {
                        transformOrigin: `${originX}% ${originY}%`,
                        transform: 'rotate(180deg)',
                        transition: 'transform 3.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      } : {
                        transform: 'none',
                        transition: isComplete ? 'none' : 'background-color 1s ease-in-out, border-color 1s ease-in-out, box-shadow 1s ease-in-out'
                      })
                    };
                  }

                  if (isSwingTarget8 && (currentStep?.type === 'highlight_targets' || currentStep?.type === 'swing_rotating' || isComplete)) {
                    const w = 38; // Cell width for 8x8
                    const g = 4;  // gap-1 is 4px
                    const stride = w + g; // Real distance between cell centers
                    
                    // The center of an 8x8 board is between index 3 and 4 -> 3.5
                    const offsetX = (3.5 - c) * stride;
                    const offsetY = (3.5 - r) * stride;
                    
                    // transformOrigin is relative to the cell's own top-left.
                    // Center of cell is (w/2, w/2). We add the offset to the board center.
                    const originX = ((w / 2 + offsetX) / w) * 100;
                    const originY = ((w / 2 + offsetY) / w) * 100;

                    swingStyle = {
                      backgroundColor: 'rgba(245, 158, 11, 0.6)',
                      borderColor: 'rgb(245, 158, 11)',
                      boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)',
                      color: '#fff',
                      zIndex: 40,
                      ...(currentStep?.type === 'swing_rotating' ? {
                        transformOrigin: `${originX}% ${originY}%`,
                        transform: 'rotate(180deg)',
                        transition: 'transform 3.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      } : {
                        transform: 'none',
                        transition: isComplete ? 'none' : 'background-color 1s ease-in-out, border-color 1s ease-in-out, box-shadow 1s ease-in-out'
                      })
                    };
                  }

                  let successColor = "";
                  let successBorder = "";
                  if (isComplete && algoMode !== 'formula') {
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
                      style={{ ...cellStyle, ...swingStyle }}
                      className={cn(
                        "flex items-center justify-center rounded-md font-black transition-all relative overflow-hidden",
                        cellClasses, 
                        v ? (+v > 0 ? (isComplete ? "" : "text-emerald-50") : "text-transparent") : "text-transparent",
                        isFormula ? "border-2" : (
                          !isComplete && v ? "bg-emerald-900/40 border border-emerald-500/20" : (!isComplete && "bg-slate-800/50 border border-slate-700/30")
                        ),
                        isFormula && !v && !isComplete && "bg-slate-900/60 border-emerald-500/10 border-dashed",
                        isComplete && !isFormula && successColor,
                        isComplete && !isFormula ? (successBorder || "border border-transparent") : "",
                        isFormulaHighlight && mainMode === 'simulation' && "ring-2 ring-white z-20 shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-in zoom-in duration-200",
                        
                        // Phase 2: Scan (Diagonals vs Others)
                        isFormula && currentStep?.type === 'scan' && (
                           ((r % 4 === c % 4) || (r % 4 + c % 4 === 3)) 
                             ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200" // Keep (Diagonal)
                             : "bg-slate-700/50 border-slate-600/50 text-slate-400" // Others (Grey)
                        ),

                        // Phase 3 & 4: Strict Group Pop & Flip
                        isFormula && (currentStep?.type === 'pop_prepare' || currentStep?.type === 'mass_invert') && 
                        highlight?.targets?.some(t => t.r === r && t.c === c) && (
                            cn(
                                "z-30 transition-all duration-700 ease-in-out",
                                // Pop Up Phase
                                currentStep?.type === 'pop_prepare' ? (
                                    cn(
                                        "scale-110 shadow-2xl",
                                        // Color logic: Top/Left = Red, Bottom/Right = Blue
                                        (highlight?.group === 'top_bottom' ? r === 0 : c === 0) 
                                            ? "bg-rose-500/40 border-rose-400 text-rose-100 shadow-rose-500/30" 
                                            : "bg-blue-500/40 border-blue-400 text-blue-100 shadow-blue-500/30"
                                    )
                                ) : "", 
                                // Flip Phase
                                currentStep?.type === 'mass_invert' ? "scale-100 rotate-y-180 bg-purple-500/50 border-purple-400 text-white shadow-purple-500/40 ring-1 ring-purple-300" : ""  
                            )
                        ),
                        
                        // --- Swing Mode Specific Visuals ---
                        algoMode === 'swing' && (currentStep?.type === 'swing_prepare' || currentStep?.type === 'swing_done') &&
                        highlight?.targets?.some(t => t.r === r && t.c === c) && (
                            cn(
                                "z-40 transition-all duration-1000 ease-in-out",
                                currentStep?.type === 'swing_prepare' ? (
                                    "scale-110 shadow-[0_0_30px_rgba(56,189,248,0.6)] border-sky-400 bg-sky-500/40 text-white"
                                ) : "",
                                currentStep?.type === 'swing_done' ? (
                                    "scale-100 rotate-y-180 bg-indigo-500/70 border-indigo-300 text-white shadow-[0_0_40px_rgba(99,102,241,0.7)] ring-2 ring-indigo-400/50"
                                ) : ""
                            )
                        ),
                        
                        algoMode === 'swing' && currentStep?.type === 'scan_swing' && (
                             highlight?.targets?.some(t => t.r === r && t.c === c)
                               ? "ring-2 ring-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.3)] bg-sky-900/60 text-sky-100 z-10"
                               : "opacity-30 grayscale-[0.8]"
                        ),
                        algoMode === 'swing' && currentStep?.type === 'highlight_targets' &&
                        highlight?.targets?.some(t => t.r === r && t.c === c) && (
                            "bg-blue-600 text-white z-10"
                        ),
                        // -----------------------------------
                        
                        // Individual Invert (Fallback)
                        isFormula && currentStep?.type === 'invert' && isFormulaHighlight && "bg-purple-500/40 border-purple-400 ring-1 ring-purple-400 animate-pulse text-white",

                        isDynHighlight && highlightType === 'active' && "ring-2 ring-amber-400 bg-amber-900/40 z-10 scale-105",
                        isDynHighlight && highlightType === 'forced' && "ring-2 ring-purple-400 bg-purple-900/60 z-10 scale-110 shadow-lg shadow-purple-500/40",
                        isDynHighlight && highlightType === 'backtrack' && "ring-2 ring-rose-500 bg-rose-500/30 z-10 animate-pulse"
                      )}
                    >
                      {v}
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
                  "w-5 h-5 ml-1 text-[8px]", 
                  isRowComplete ? "text-sky-400" : "text-slate-600",
                  isComplete ? "opacity-100" : "opacity-0"
                )}>
                  {rowSum > 0 ? rowSum : ''}
                </div>
              </div>
            );
          })}

          <div className={cn("flex items-center mt-1", getGapSize())}>
            <div className="w-5 h-5 mr-1 opacity-0" />
            {colSums.map((cs, i) => (
              <div 
                key={`colsum-${i}`} 
                className={cn(
                  "flex items-center justify-center font-mono font-bold transition-all duration-700",
                  getCellSize(), 
                  "text-[8px] h-5",
                  cs.isComplete ? "text-sky-400" : "text-slate-600",
                  isComplete ? "opacity-100" : "opacity-0"
                )}
              >
                {cs.sum > 0 ? cs.sum : ''}
              </div>
            ))}
            <div className="w-5 h-5 ml-1" /> 
          </div>
        </div>
      </div>

      {/* Footer Area */}
      {mainMode === 'simulation' ? (
        <div className="flex flex-col mt-1">
            <div className="h-10 flex items-center justify-center mb-1 px-4 bg-slate-900/60 rounded-lg border border-amber-500/20 shadow-inner">
                <span className="text-[12px] font-black uppercase tracking-wider text-center text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.2)]">
                    {(algoMode !== 'formula' && algoMode !== 'swing') ? (dynamicDesc || "Ready...") : (currentStep?.desc || (isComplete ? 'Simulation Finished' : 'Solving...'))}
                </span>
            </div>


            <div className="grid grid-cols-4 gap-2 py-2 border-t border-slate-700/50">
                <div className="flex flex-col items-center">
                  <Activity size={14} className="text-rose-400 mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase">Steps</span>
                  <span className="text-sm font-mono text-slate-200">
                    {(algoMode === 'formula' || algoMode === 'swing') ? (isComplete ? steps.length : currentStepIndex + 1) : (stats?.attempts || 0)}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Trophy size={14} className="text-emerald-400 mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase">Progress</span>
                  <span className="text-sm font-mono text-emerald-200">{progressPercent}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <Hash size={14} className="text-amber-400 mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase">Target Sum</span>
                  <span className="text-sm font-mono text-slate-200">{magicConstant}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock size={14} className="text-sky-400 mb-1" />
                  <span className="text-[10px] text-slate-400 uppercase">Time</span>
                  <span className="text-sm font-mono text-slate-200">{(stats.time / 1000).toFixed(2)}s</span>
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
