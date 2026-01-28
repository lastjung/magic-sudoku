import React, { useEffect, useMemo } from 'react';
import { 
  Play, Pause, RefreshCw, ChevronLeft, ChevronRight, SkipBack, SkipForward,
  CheckCircle2, Target, Zap,
  Activity, Clock, Hash, BrainCircuit, LayoutGrid, Trophy
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { audioEngine } from '../../utils/audio';
import { useMagicSquareGame } from './useMagicSquareGame';
import { MagicCell } from './components/MagicCell';

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
    // 1. Force 100% if completed
    if (isComplete) return "100.0";

    // 2. Linear Progress for Formula/Swing Mode (Milestone Based)
    if (mainMode === 'simulation' && (algoMode === 'swing' || (algoMode === 'formula' && size % 2 === 0)) && steps.length > 0) {
      const type = steps[currentStepIndex]?.type;
      if (type === 'complete') return "100.0";
      
      if (algoMode === 'swing') {
        if (type === 'swing_rotating') return "80.0";
        if (type === 'highlight_targets') return "50.0";
        return "0.0";
      }
      
      if (algoMode === 'formula') {
        if (type === 'setup') return "0.0";
        if (type === 'scan' || type === 'pop_prepare') return "50.0";
        if (type === 'mass_invert') return "85.0";
        return "90.0";
      }
    }

    // 3. Default Linear Progress for Simulation Steps
    if (mainMode === 'simulation' && steps.length > 0) {
      const current = currentStepIndex + 1;
      return ((current / steps.length) * 100).toFixed(1);
    }

    // 4. Fallback: Linear cell counting for Solver/Practice modes
    let filledCount = 0;
    displayBoard.forEach(row => {
      row.forEach(cell => {
        if (cell !== null && cell > 0 && cell <= size * size) filledCount++;
      });
    });
    
    // Safety: ensure it doesn't exceed 100 unless actually complete
    const percent = (filledCount / (size * size)) * 100;
    return (percent >= 100 && !isComplete) ? "99.9" : percent.toFixed(1);
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

  const cellClasses = getCellSize();
  const gapClass = getGapSize();

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
                {row.map((v, c) => (
                  <MagicCell
                    key={`${r}-${c}`}
                    v={v} r={r} c={c} size={size}
                    algoMode={algoMode}
                    mainMode={mainMode}
                    isComplete={isComplete}
                    isPlaying={isPlaying}
                    currentStep={currentStep}
                    highlight={highlight}
                    dynamicHighlight={dynamicHighlight}
                    onClick={() => mainMode === 'practice' && onCellClick(r, c)}
                    cellClasses={cellClasses}
                    getFormulaColor={getFormulaColor}
                  />
                ))}
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
