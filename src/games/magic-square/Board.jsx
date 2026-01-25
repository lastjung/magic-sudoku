import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateMagicSquareSteps } from './logic';
import { cn } from '../../utils/cn';
import { 
  RefreshCw, Grid3x3, Play, Pause, ChevronRight, ChevronLeft, SkipBack, SkipForward, 
  BookOpen, GraduationCap, MousePointerClick, ArrowLeft,
  Target, BrainCircuit, ArrowRight, ArrowUp, ArrowDown, ArrowUpRight, Trophy, CheckCircle2 
} from 'lucide-react';
import rulesData from './rules.json';

export default function MagicSquareBoard() {
  // Common State
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState('learn'); // 'learn' | 'practice'

  // Learn Mode State
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(500);
  const timerRef = useRef(null);

  // Practice Mode State
  const [practiceBoard, setPracticeBoard] = useState([]);
  const [targetNum, setTargetNum] = useState(2);
  const [lastCorrectPos, setLastCorrectPos] = useState({ r: 0, c: Math.floor(3/2) });
  const [feedback, setFeedback] = useState(null);

  // Initialize Learn Mode
  useEffect(() => {
    const newSteps = generateMagicSquareSteps(size);
    setSteps(newSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    startPracticeGame(n => n); 
  }, [size]);

  // Practice Init Helper
  const startPracticeGame = (getSize) => {
    const n = getSize(size);
    const initialBoard = Array.from({ length: n }, () => Array(n).fill(null));
    const startRow = 0;
    const startCol = Math.floor(n / 2);
    initialBoard[startRow][startCol] = 1;
    
    setPracticeBoard(initialBoard);
    setTargetNum(2);
    setLastCorrectPos({ r: startRow, c: startCol });
    setFeedback({ type: 'info', msg: 'Tap the correct cell for number 2!', icon: Target });
  };

  // Playback Loop
  useEffect(() => {
    if (isPlaying && mode === 'learn') {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, playbackSpeed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, steps, playbackSpeed, mode]);

  // Derived State
  const currentStep = steps[currentStepIndex] || { board: [], desc: "Loading..." };
  const { board: learnBoard, desc, highlight, type } = currentStep;
  const magicConstant = (size * (size * size + 1)) / 2;
  const isLearnComplete = type === 'complete';

  // --- Handlers ---
  const handleLearnStep = (delta) => {
    setIsPlaying(false);
    setCurrentStepIndex(prev => Math.min(Math.max(prev + delta, 0), steps.length - 1));
  };

  const handleLearnJump = (toEnd) => {
      setIsPlaying(false);
      setCurrentStepIndex(toEnd ? steps.length - 1 : 0);
  };

  // Allow clicking cells in Learn Mode to jump to that step
  const handleLearnCellClick = (val) => {
      if (!val) return;
      const stepIndex = steps.findIndex(s => s.val === val);
      if (stepIndex !== -1) {
          setIsPlaying(false);
          setCurrentStepIndex(stepIndex);
      }
  };

  const handlePracticeClick = (r, c) => {
    if (practiceBoard[r][c] !== null) return;
    if (targetNum > size * size) return;

    // Find the correct step for the TARGET number
    const correctStep = steps.find(s => s.val === targetNum);
    const correctPos = correctStep ? correctStep.highlight : null;

    if (correctPos && correctPos.r === r && correctPos.c === c) {
        // Correct
        const newBoard = practiceBoard.map(row => [...row]);
        newBoard[r][c] = targetNum;
        setPracticeBoard(newBoard);
        setLastCorrectPos({ r, c });
        
            // SHOW THE RULE FROM THE CORRECT STEP
            const ruleDescription = correctStep.desc;
            
            setFeedback({ 
                type: 'success', 
                msg: `${ruleDescription}`, // Just the rule, keep it simple
                icon: CheckCircle2 
            });
            setTargetNum(prev => prev + 1);
            
            // Auto hide after 1.5s to prevent dizziness ("보여주고 끝")
            setTimeout(() => setFeedback(null), 1500);
    } else {
        // Incorrect
        let hint = "Up 1, Right 1";
        let Icon = AlertTriangle;
        const nextRow = (lastCorrectPos.r - 1 + size) % size;
        const nextCol = (lastCorrectPos.c + 1) % size;
        
        if (practiceBoard[nextRow][nextCol] !== null) {
            hint = "Blocked -> Move Down";
            Icon = ArrowDown;
        } else if (lastCorrectPos.r === 0) {
            hint = "Top Wall -> Wrap Bottom";
            Icon = ArrowUp;
        } else if (lastCorrectPos.c === size - 1) {
            hint = "Right Wall -> Wrap Left";
            Icon = ArrowRight;
        }

        setFeedback({ type: 'error', msg: hint, icon: Icon });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-slate-800/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm flex flex-col lg:flex-row min-h-[650px]">
        
        {/* Left Panel: Settings Only */}
        <div className="lg:w-1/4 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-900/30 p-6 flex flex-col gap-6">
            
            {/* Title & Mode */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                        <Grid3x3 size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Magic Square</h2>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          <BrainCircuit size={12} />
                          <span>Siamese Method</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 p-1 bg-slate-800 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setMode('learn')}
                        className={cn("w-full py-2.5 px-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-all", mode === 'learn' ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        <BookOpen size={18} /> Learn
                    </button>
                    <button 
                         onClick={() => {
                             setMode('practice');
                             startPracticeGame(n => n);
                         }}
                        className={cn("w-full py-2.5 px-3 rounded-lg text-sm font-bold flex items-center gap-3 transition-all", mode === 'practice' ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500 hover:text-white")}
                    >
                        <GraduationCap size={18} /> Practice
                    </button>
                </div>
            </div>

            {/* Size Selector */}
            <div className="flex flex-col gap-2">
                 <span className="text-xs font-bold text-slate-500 uppercase ml-1">Grid Size</span>
                 <div className="flex bg-slate-800 p-1.5 rounded-xl border border-white/5">
                    {[3, 5, 7].map((n) => (
                        <button
                            key={n}
                            onClick={() => setSize(n)}
                            className={cn(
                                "flex-1 py-2 rounded-lg font-bold text-sm transition-all",
                                size === n
                                    ? "bg-emerald-600 text-white shadow-lg"
                                    : "text-slate-500 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {n}x{n}
                        </button>
                    ))}
                </div>
            </div>

        </div>

        {/* Right Panel: Board + Description Area */}
        <div className="flex-1 p-4 lg:p-12 flex flex-col items-center justify-start bg-slate-900/50 relative">
           
           {/* Grid Container */}
           <div className="relative mt-4">
                {/* Sum Indicators */}
                <AnimatePresence>
                    {(isLearnComplete || (mode === 'practice' && targetNum > size * size)) && (
                        <>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                                className="absolute -right-16 top-0 h-full flex flex-col justify-around py-4"
                            >
                                {Array.from({length: size}).map((_, i) => (
                                    <div key={i} className="text-emerald-400 font-bold text-sm flex items-center gap-1">
                                        <span className="text-xs text-slate-500">=</span> {magicConstant}
                                    </div>
                                ))}
                            </motion.div>
                             <motion.div 
                                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                                className="absolute -bottom-10 left-0 w-full flex justify-around px-4"
                            >
                                {Array.from({length: size}).map((_, i) => (
                                    <div key={i} className="text-emerald-400 font-bold text-sm flex flex-col items-center gap-1">
                                        <span className="text-xs text-slate-500 rotate-90">=</span> 
                                        {magicConstant}
                                    </div>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <div
                    className={cn(
                        "grid gap-3 p-4 bg-slate-800 rounded-2xl shadow-2xl border transition-all duration-500 selection:bg-none",
                        (isLearnComplete || (mode === 'practice' && targetNum > size*size)) 
                          ? "border-emerald-500/50 shadow-emerald-500/20" 
                          : "border-slate-700"
                    )}
                    style={{
                        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                    }}
                >
                    {(mode === 'learn' ? learnBoard : practiceBoard)?.map((row, rIndex) =>
                        row.map((v, cIndex) => {
                            const isHighlight = mode === 'learn' && highlight && highlight.r === rIndex && highlight.c === cIndex;
                            const isJustPlaced = mode === 'learn' && type === 'place' && isHighlight;
                            
                            return (
                                <motion.div
                                    key={`${rIndex}-${cIndex}`}
                                    layout
                                    onClick={() => {
                                        if (mode === 'practice') handlePracticeClick(rIndex, cIndex);
                                        if (mode === 'learn') handleLearnCellClick(v);
                                    }}
                                    initial={false}
                                    animate={{ 
                                        scale: isHighlight ? 1.05 : 1,
                                        backgroundColor: 
                                            // Learn Mode Styles
                                            mode === 'learn' ? (
                                                isLearnComplete ? 'rgba(6, 78, 59, 0.6)' 
                                                : isJustPlaced ? 'rgba(16, 185, 129, 0.3)' 
                                                : isHighlight ? 'rgba(255, 255, 255, 0.1)' 
                                                : v ? 'rgba(6, 78, 59, 0.4)' 
                                                : 'rgba(30, 41, 59, 0.5)'
                                            )
                                            // Practice Mode Styles
                                            : (
                                                targetNum > size * size ? 'rgba(6, 78, 59, 0.6)' 
                                                : v ? 'rgba(67, 56, 202, 0.4)' 
                                                : 'rgba(30, 41, 59, 0.5)' 
                                            )
                                    }}
                                    className={cn(
                                        "w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl text-xl sm:text-2xl font-bold shadow-inner relative overflow-hidden transition-all",
                                        mode === 'practice' && !v && targetNum <= size*size ? "cursor-pointer hover:bg-white/5 active:scale-95 hover:border-white/20" : "cursor-default",
                                        mode === 'learn' && v ? "cursor-pointer hover:bg-emerald-500/20" : "", // Learn mode click

                                        // Colors
                                        mode === 'learn' ? (v ? "text-emerald-100" : "text-transparent") 
                                                         : (v ? "text-indigo-100" : "text-transparent"),
                                        
                                        // Dynamic Borders
                                        mode === 'learn' && v && !isLearnComplete && "border border-emerald-500/30",
                                        mode === 'learn' && isLearnComplete && "border-2 border-emerald-400 text-white",
                                        
                                        mode === 'practice' && v && targetNum <= size*size && "border border-indigo-500/30",
                                        mode === 'practice' && !v && "border border-slate-700/50",
                                        mode === 'practice' && targetNum > size*size && "border-2 border-emerald-400 text-white",

                                        isHighlight && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900 z-10"
                                    )}
                                >   
                                    {v && (
                                        <motion.span 
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                        >
                                            {v}
                                        </motion.span>
                                    )}
                                    <span className="absolute bottom-1 right-1 text-[8px] text-slate-600 font-mono opacity-30 pointer-events-none">
                                        {rIndex},{cIndex}
                                    </span>
                                </motion.div>
                            );
                        })
                    )}
                </div>
           </div>

           {/* --- RULE ONLY TEXT AREA --- */}
           <div className="w-full max-w-lg mt-8 mb-4 min-h-[80px] flex items-center justify-center">
                {mode === 'learn' ? (
                     <motion.div 
                        key={currentStepIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/80 border border-emerald-500/20 rounded-2xl px-8 py-5 w-full text-center relative backdrop-blur-sm shadow-2xl flex flex-col items-center justify-center"
                     >
                         <div className="flex items-center justify-center">
                            <span className="text-white text-3xl font-bold">
                                {size === 3 ? rulesData["3x3"][currentStep?.ruleId]?.label : desc}
                            </span>
                         </div>
                     </motion.div>
                ) : (
                    // Practice Mode Feedback
                    <div className="w-full">
                        {targetNum <= size * size ? (
                             <div className="flex flex-col items-center gap-2">

                                 <div className="flex items-center gap-4">
                                     <ArrowLeft className="text-indigo-500/50 animate-pulse" />
                                     <span className="text-5xl font-black text-white">{targetNum}</span>
                                     <ArrowRight className="text-indigo-500/50 animate-pulse" />
                                 </div>
                                 {/* Feedback Toast */}
                                 <AnimatePresence mode="wait">
                                    {feedback && (
                                        <motion.div 
                                        key={feedback.msg}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={cn(
                                            "mt-2 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border shadow-lg",
                                            feedback.type === 'error' ? "bg-red-500/20 text-red-200 border-red-500/20" : 
                                            feedback.type === 'success' ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/20" :
                                            "bg-indigo-500/20 text-indigo-200 border-indigo-500/20"
                                        )}>
                                            {feedback.icon && <feedback.icon size={14} />}
                                            {feedback.msg}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                             </div>
                        ) : (
                            <div className="text-center p-4 bg-emerald-900/20 rounded-2xl border border-emerald-500/30">
                                <Trophy className="mx-auto text-yellow-400 mb-2" size={32} />
                                <div className="text-xl font-bold text-white">All Done!</div>
                            </div>
                        )}
                    </div>
                )}
           </div>

           {/* Controls (Learn Mode Only) */}
           {mode === 'learn' && (
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-between gap-2 bg-slate-800 p-2 rounded-2xl border border-white/10 shadow-xl z-10 w-full">
                        <button onClick={() => handleLearnJump(false)} className="p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <SkipBack size={20} />
                        </button>
                        <button onClick={() => handleLearnStep(-1)} className="p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        
                        <button 
                            onClick={() => {
                                if (isLearnComplete) handleLearnJump(false);
                                else setIsPlaying(!isPlaying);
                            }}
                            className={cn(
                                "flex-1 h-12 flex items-center justify-center rounded-xl transition-all shadow-lg text-white mx-2",
                                isLearnComplete 
                                    ? "bg-slate-600 hover:bg-slate-500 shadow-slate-500/30"
                                    : isPlaying 
                                        ? "bg-amber-500 hover:bg-amber-400 shadow-amber-500/20" 
                                        : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30"
                            )}
                        >
                            {isLearnComplete ? <RefreshCw size={24} /> : isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>

                        <button onClick={() => handleLearnStep(1)} className="p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <ChevronRight size={24} />
                        </button>
                        <button onClick={() => handleLearnJump(true)} className="p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                            <SkipForward size={20} />
                        </button>
                    </div>
                    
                    {/* Speed Control Small */}
                    <div className="mt-4 flex justify-center gap-2">
                        {[800, 400, 100].map(s => (
                            <button
                                key={s}
                                onClick={() => setPlaybackSpeed(s)}
                                className={cn(
                                    "px-3 py-1 rounded-md text-[10px] font-bold transition-all uppercase tracking-wider border",
                                    playbackSpeed === s ? "bg-slate-600 text-white border-white/10" : "bg-transparent text-slate-500 border-transparent hover:text-slate-300"
                                )}
                            >
                                {s === 800 ? 'Slow' : s === 400 ? 'Normal' : 'Fast'}
                            </button>
                        ))}
                    </div>
                </div>
           )}

           {/* Practice Mode Actions */}
           {mode === 'practice' && targetNum > size * size && (
               <button 
                    onClick={() => startPracticeGame(n => n)}
                    className="mt-8 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 transition-all hover:scale-105 active:scale-95"
               >
                   <RefreshCw size={20} /> Play Again
               </button>
           )}

        </div>
      </div>
    </div>
  );
}
