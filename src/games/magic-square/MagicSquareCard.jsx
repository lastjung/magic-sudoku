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
  steps = [], 
  speed = 500,
  triggerRun = 0,
  triggerReset = 0
}) => {
  const {
    currentStepIndex, setCurrentStepIndex,
    isPlaying, setIsPlaying,
    isComplete: gameIsComplete, // 이름을 변경하여 충돌 방지
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
  
  // Logic for completion
  const isComplete = mainMode === 'simulation' 
    ? ((algoMode === 'formula' || algoMode === 'swing') ? currentStep?.type === 'complete' : gameIsComplete) 
    : gameIsComplete;

  const magicConstant = (size * (size * size + 1)) / 2;

  // Sync board for Formula/Swing Mode
  const displayBoard = (mainMode === 'simulation' && (algoMode === 'formula' || algoMode === 'swing') && (isPlaying || isComplete || currentStepIndex > 0) && currentStep?.board?.length > 0) 
    ? currentStep.board 
    : practiceBoard;

  const colSums = useMemo(() => {
    const sums = Array(size).fill(0);
    const filled = Array(size).fill(0);
    displayBoard.forEach(row => {
      if (row) {
        row.forEach((v, c) => {
          if (v !== null) {
            sums[c] += v;
            filled[c]++;
          }
        });
      }
    });
    return sums.map((s, i) => ({ 
      sum: s, 
      isComplete: s === magicConstant && filled[i] === size 
    }));
  }, [displayBoard, size, magicConstant]);

  const progressPercent = useMemo(() => {
    if (isComplete) return "100.0";

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

    if (mainMode === 'simulation' && steps.length > 0) {
      const current = currentStepIndex + 1;
      return ((current / steps.length) * 100).toFixed(1);
    }

    let filledCount = 0;
    displayBoard.forEach(row => {
      if (row) {
        row.forEach(cell => {
          if (cell !== null && cell > 0 && cell <= size * size) filledCount++;
        });
      }
    });
    const percent = (filledCount / (size * size)) * 100;
    return (percent >= 100 && !isComplete) ? "99.9" : percent.toFixed(1);
  }, [displayBoard, size, isComplete, currentStepIndex, steps, algoMode, mainMode]);

  const getCellSize = () => {
    if (size <= 3) return 'w-16 h-16 text-2xl';
    if (size <= 4) return 'w-12 h-12 text-xl';
    if (size <= 6) return 'w-10 h-10 text-lg';
    if (size <= 8) return 'w-8 h-8 text-base';
    return 'w-7 h-7 text-sm';
  };

  const getGapSize = () => {
    if (size <= 4) return 'gap-2';
    if (size <= 6) return 'gap-1.5';
    return 'gap-1';
  };

  const onCellClick = (r, c) => {
    handlePracticeClick(
      r, c,
      (step) => {
        if (isSoundEnabled) audioEngine.playNote(step.val);
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
                {mainMode === 'simulation' ? algoMode : `${size}x${size} Practice`}
            </h3>
        </div>
        
        <div className="flex items-center gap-1.5">
           {mainMode === 'simulation' && (
             <>
               <button 
                 onClick={resetPractice}
                 className="p-1.5 rounded-lg bg-slate-700/30 text-slate-500 hover:text-emerald-400 border border-white/5 transition-all active:scale-95 mr-1"
               >
                 <RefreshCw size={13} />
               </button>
               {!isPlaying ? (
                  <button onClick={() => {
                     if (isComplete) {
                        resetPractice();
                        setTimeout(() => setIsPlaying(true), 10);
                     } else {
                        setIsPlaying(true);
                     }
                   }} className="p-1.5 rounded-lg bg-emerald-400/10 text-emerald-400/60 hover:bg-emerald-400/20 border border-emerald-500/10 transition-all active:scale-95">
                    <Play size={14} fill="currentColor" />
                  </button>
               ) : (
                  <button onClick={() => setIsPlaying(false)} className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all active:scale-95 border border-rose-500/20">
                    <Pause size={14} fill="currentColor" />
                  </button>
               )}
              </>
            )}
         </div>
      </div>

      {/* Board */}
      <div className={cn("flex flex-col items-center justify-center relative px-2 flex-1 transition-all duration-500", size > 7 ? "py-6" : "py-3")}>
        <div className="flex flex-col gap-1">
          {displayBoard.map((row, r) => {
            const rowSum = row ? row.reduce((a, b) => a + (b || 0), 0) : 0;
            const isRowComplete = rowSum === magicConstant && row && row.every(v => v !== null);
            const cellSizeClass = getCellSize();

            return (
              <div key={`row-${r}`} className={cn("flex items-center", getGapSize())}>
                <div className="w-5 h-5 mr-1 opacity-0" />
                {row && row.map((v, c) => (
                  <MagicCell
                    key={`${r}-${c}`}
                    v={v} r={r} c={c} size={size}
                    algoMode={algoMode}
                    mainMode={mainMode}
                    isComplete={isComplete}
                    isPlaying={isPlaying}
                    currentStep={currentStep}
                    dynamicHighlight={dynamicHighlight}
                    onClick={() => mainMode === 'practice' && onCellClick(r, c)}
                    cellClasses={cellSizeClass}
                    getFormulaColor={getFormulaColor}
                  />
                ))}
                <div className={cn("flex items-center justify-center font-mono font-bold w-5 h-5 ml-1 text-[8px]", isRowComplete ? "text-sky-400" : "text-slate-600", isComplete ? "opacity-100" : "opacity-0")}>
                  {rowSum > 0 ? rowSum : ''}
                </div>
              </div>
            );
          })}
        </div>
        
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
            {/* Main Diagonal Sum (Bottom-Right Corner) */}
            <div className={cn(
              "flex items-center justify-center font-mono font-bold w-5 h-5 ml-1 text-[8px] transition-all duration-700",
              (displayBoard.reduce((acc, row, idx) => acc + (row && row[idx] ? row[idx] : 0), 0) === magicConstant && displayBoard.every((row, idx) => row && row[idx])) ? "text-sky-400" : "text-slate-600",
              isComplete ? "opacity-100" : "opacity-0"
            )}>
               {/* Calc Main Diagonal Sum directly inline */}
               {(() => {
                  const diagSum = displayBoard.reduce((acc, row, idx) => acc + (row && row[idx] ? row[idx] : 0), 0);
                  return diagSum > 0 ? diagSum : '';
               })()}
            </div>
          </div>
      </div>

      {/* Footer Area */}
      {mainMode === 'simulation' && (
        <div className="flex flex-col mt-1">
            <div className="h-10 flex items-center justify-center mb-1 px-4 bg-slate-900/60 rounded-lg border border-amber-500/20 shadow-inner">
                <span className="text-[12px] font-black uppercase tracking-wider text-center text-amber-400">
                    {(algoMode !== 'formula' && algoMode !== 'swing') ? (dynamicDesc || "Ready...") : (currentStep?.desc || (isComplete ? 'Simulation Finished' : 'Solving...'))}
                </span>
            </div>

            <div className="grid grid-cols-4 gap-2 py-2 border-t border-slate-700/50">
                <div className="flex flex-col items-center">
                  <Activity size={14} className="text-rose-400 mb-1" />
                  <span className="text-sm font-mono text-slate-200">{stats?.attempts || 0}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Trophy size={14} className="text-emerald-400 mb-1" />
                  <span className="text-sm font-mono text-emerald-200">{progressPercent}%</span>
                </div>
                <div className="flex flex-col items-center">
                  <Hash size={14} className="text-amber-400 mb-1" />
                  <span className="text-sm font-mono text-slate-200">{magicConstant}</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock size={14} className="text-sky-400 mb-1" />
                  <span className="text-sm font-mono text-slate-200">{(stats?.time / 1000 || 0).toFixed(2)}s</span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
