import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RefreshCw, ChevronLeft, ChevronRight, SkipBack, SkipForward,
  CheckCircle2, Target, ArrowDown, ArrowUp, ArrowRight, BrainCircuit
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { audioEngine } from '../../utils/audio';

export const MagicSquareCard = ({ 
  size, 
  mode, 
  steps, 
  onPracticeCorrect,
  speed 
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackDelay = Math.max(10, 1000 - speed);
  const [practiceBoard, setPracticeBoard] = useState([]);
  const [targetNum, setTargetNum] = useState(2);
  const [lastCorrectPos, setLastCorrectPos] = useState({ r: 0, c: Math.floor(size/2) });
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);
  const prevStepRef = useRef(0);

  // Initialize Learn/Practice state when size or steps change
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    resetPractice();
  }, [size, steps]);

  const resetPractice = () => {
    const initialBoard = Array.from({ length: size }, () => Array(size).fill(null));
    const startRow = 0;
    const startCol = Math.floor(size / 2);
    initialBoard[startRow][startCol] = 1;
    setPracticeBoard(initialBoard);
    setTargetNum(2);
    setLastCorrectPos({ r: startRow, c: startCol });
    setFeedback(null);
  };

  // Playback Loop
  useEffect(() => {
    if (isPlaying && mode === 'learn' && steps && steps.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            const next = prev + 1;
            if (steps[next] && steps[next].val) {
                audioEngine.playNote(steps[next].val);
            }
            return next;
          }
          setIsPlaying(false);
          return prev;
        });
      }, playbackDelay);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps, playbackDelay, mode]);

  const handlePracticeClick = (r, c) => {
    if (practiceBoard[r][c] !== null || targetNum > size * size) return;

    const correctStep = steps.find(s => s.val === targetNum);
    const correctPos = correctStep ? correctStep.highlight : null;

    if (correctPos && correctPos.r === r && correctPos.c === c) {
        const newBoard = practiceBoard.map(row => [...row]);
        newBoard[r][c] = targetNum;
        setPracticeBoard(newBoard);
        setLastCorrectPos({ r, c });
        setTargetNum(prev => prev + 1);
        audioEngine.playNote(targetNum);
        setFeedback({ type: 'success', msg: correctStep.desc, icon: CheckCircle2 });
        setTimeout(() => setFeedback(null), 1000);
    } else {
        let hint = "Up 1, Right 1";
        let Icon = Target;
        const nextRow = (lastCorrectPos.r - 1 + size) % size;
        const nextCol = (lastCorrectPos.c + 1) % size;
        
        if (practiceBoard[nextRow][nextCol] !== null) { hint = "Blocked -> Down"; Icon = ArrowDown; }
        else if (lastCorrectPos.r === 0) { hint = "Top Wrap"; Icon = ArrowUp; }
        else if (lastCorrectPos.c === size - 1) { hint = "Right Wrap"; Icon = ArrowRight; }
        
        setFeedback({ type: 'error', msg: hint, icon: Icon });
    }
  };

  const currentStep = steps[currentStepIndex] || { board: [], desc: "" };
  const { board: learnBoard, highlight, type } = currentStep;
  const isComplete = mode === 'learn' ? type === 'complete' : targetNum > size * size;
  const magicConstant = (size * (size * size + 1)) / 2;

  // --- Dynamic Sizing ---
  // Base size for the grid area is roughly 240px to 320px
  const getCellSize = () => {
    if (size <= 3) return "w-16 h-16 text-2xl"; // 3x3: Large
    if (size <= 5) return "w-12 h-12 text-lg";  // 5x5: Medium
    if (size <= 7) return "w-9 h-9 text-xs";    // 7x7: Small
    if (size <= 11) return "w-6 h-6 text-[8px]"; // 11x11: Tiny
    if (size <= 13) return "w-5 h-5 text-[6px]"; // 13x13
    return "w-4 h-4 text-[5px]"; // 15+ : Minimal
  };

  const getGapSize = () => {
    if (size <= 5) return "gap-2";
    if (size <= 9) return "gap-1";
    return "gap-0.5";
  };

  return (
    <div className={cn(
      "bg-slate-800/40 backdrop-blur-md border rounded-2xl p-4 flex flex-col shadow-xl transition-all group overflow-hidden",
      isComplete ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-700"
    )}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/20">
            <BrainCircuit size={14} className="text-white" />
          </div>
          <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest">{size}x{size} Grid</h3>
        </div>
        <div className="flex items-center gap-1.5">
           <span className="text-[10px] font-mono text-slate-500">M={magicConstant}</span>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
        <div 
          className={cn(
              "bg-slate-900/50 rounded-xl border border-slate-700/50 grid",
              getGapSize(),
              size <= 7 ? "p-3" : size <= 11 ? "p-1.5" : "p-1"
          )}
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          {(mode === 'learn' ? learnBoard : practiceBoard).map((row, r) => 
            row.map((v, c) => {
              const isHighlight = mode === 'learn' && highlight?.r === r && highlight?.c === c;
              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => mode === 'practice' && handlePracticeClick(r, c)}
                  className={cn(
                    "flex items-center justify-center rounded-md font-bold transition-all relative overflow-hidden",
                    getCellSize(),
                    v ? "text-emerald-50" : "text-transparent",
                    isComplete ? "bg-emerald-600/40 border-emerald-400" : 
                    v ? "bg-emerald-900/40 border border-emerald-500/20" : "bg-slate-800/50 border border-slate-700/30",
                    isHighlight && "ring-2 ring-emerald-400 z-10",
                    mode === 'practice' && !v && !isComplete && "cursor-pointer hover:bg-white/5"
                  )}
                >
                  {v || ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Feedback / Desc */}
      <div className="mt-4 h-10 flex items-center justify-center px-2">
         <AnimatePresence mode="wait">
            {mode === 'learn' ? (
              <motion.span 
                key={currentStepIndex}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-bold text-emerald-200/80 text-center uppercase tracking-tight"
              >
                {currentStep.desc}
              </motion.span>
            ) : feedback ? (
              <motion.div 
                key={feedback.msg}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "flex items-center gap-1.5 text-[10px] font-bold px-3 py-1 rounded-full border",
                  feedback.type === 'error' ? "bg-rose-500/20 text-rose-300 border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                )}
              >
                <feedback.icon size={12} /> {feedback.msg}
              </motion.div>
            ) : !isComplete ? (
              <div className="flex flex-col items-center">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Target</span>
                  <span className="text-xl font-black text-white">{targetNum}</span>
              </div>
            ) : (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                    <CheckCircle2 size={14} /> Solved!
                </div>
            )}
         </AnimatePresence>
      </div>

      {/* Local Controls (Learn Only) */}
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between gap-4">
         {mode === 'learn' ? (
           <div className="flex items-center justify-between w-full">
              <div className="flex gap-1">
                <button onClick={() => setCurrentStepIndex(0)} className="p-1.5 rounded-md hover:bg-white/5 text-slate-500" title="Start"><SkipBack size={14} /></button>
                <button onClick={() => setCurrentStepIndex(p => Math.max(0, p-1))} className="p-1.5 rounded-md hover:bg-white/5 text-slate-500"><ChevronLeft size={14} /></button>
              </div>
              
              <button 
                onClick={() => isComplete ? setCurrentStepIndex(0) : setIsPlaying(!isPlaying)}
                className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-xl text-white shadow-lg transition-all",
                    isComplete ? "bg-slate-600" : isPlaying ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-600 shadow-emerald-500/20 text-emerald-50"
                )}
              >
                {isComplete ? <RefreshCw size={18} /> : isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>

              <div className="flex gap-1">
                <button onClick={() => setCurrentStepIndex(p => Math.min(steps.length-1, p+1))} className="p-1.5 rounded-md hover:bg-white/5 text-slate-500"><ChevronRight size={14} /></button>
                <button onClick={() => setCurrentStepIndex(steps.length-1)} className="p-1.5 rounded-md hover:bg-white/5 text-slate-500" title="End"><SkipForward size={14} /></button>
              </div>
           </div>
         ) : (
           <button 
             onClick={resetPractice}
             className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2"
           >
             <RefreshCw size={12} /> Reset Practice
           </button>
         )}
      </div>
    </div>
  );
};
