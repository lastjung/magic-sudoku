import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Play, RefreshCw, RotateCcw, Activity, Clock, Hash, BrainCircuit, 
    Zap, Trophy, CheckCircle2, Edit3, Eraser, AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSudokuGame } from './useSudokuGame';
import { audioEngine } from '../../utils/audio';

const SudokuCard = ({ 
    size, 
    mainMode, 
    initialBoard = [], 
    solution, 
    algoId, 
    speed,
    triggerRun,
    triggerReset,
    onReset
}) => {
    const boxSize = Math.sqrt(size);
    
    // Stable algo set
    const algoSet = useMemo(() => new Set([algoId]), [algoId]);

    // Local Practice State
    const [localBoard, setLocalBoard] = useState([]);
    const [selected, setSelected] = useState(null);
    const [mistakes, setMistakes] = useState(0);
    const [noteMode, setNoteMode] = useState(false);
    const [isSolved, setIsSolved] = useState(false);

    // Sync initialization
    useEffect(() => {
        if (initialBoard && initialBoard.length > 0) {
            setLocalBoard(initialBoard.map(row => [...row]));
            setMistakes(0);
            setIsSolved(false);
            setSelected(null);
        }
    }, [initialBoard]);

    // Sim Hook
    const {
        board: displayBoard,
        isPlaying: isSimPlaying,
        stats: simStats,
        activeCell,
        dynamicDesc,
        runSimulation,
        stop: stopSimulation,
        reset: resetSimulation
    } = useSudokuGame({
        initialBoard: (initialBoard && initialBoard.length > 0) ? initialBoard : Array(size).fill().map(() => Array(size).fill(0)),
        size,
        speed,
        onComplete: (success) => {
            setIsSolved(success);
            if(success) audioEngine.playSuccess();
        },
        selectedAlgos: algoSet,
        triggerRun,
        triggerReset
    });

    const handleCardReset = useCallback(() => {
        if (mainMode === 'simulation') {
            resetSimulation();
            setIsSolved(false);
        } else {
            setLocalBoard(initialBoard.map(row => [...row]));
            setMistakes(0);
            setIsSolved(false);
            setSelected(null);
        }
    }, [mainMode, resetSimulation, initialBoard]);

    const progressPercent = useMemo(() => {
        const boardToUse = mainMode === 'simulation' ? displayBoard : localBoard;
        if (!boardToUse || boardToUse.length === 0) return "0.0";
        const filled = boardToUse.reduce((acc, row) => acc + row.filter(c => c !== 0).length, 0);
        return ((filled / (size * size)) * 100).toFixed(1);
    }, [displayBoard, localBoard, mainMode, size]);
    
    const handleCellClick = (r, c) => {
        if (mainMode === 'simulation') return;
        if (initialBoard?.[r]?.[c] !== 0 && initialBoard?.[r]?.[c] !== undefined) return;
        setSelected((prev) => (prev?.r === r && prev?.c === c ? null : { r, c }));
    };

    const handleNumberInput = useCallback((num) => {
        if (!selected || mainMode !== 'practice' || isSolved) return;
        const { r, c } = selected;
        if (initialBoard?.[r]?.[c] !== 0 && initialBoard?.[r]?.[c] !== undefined) return;

        const newBoard = localBoard.map(row => [...row]);
        if (num === 0) {
            newBoard[r][c] = 0;
            setLocalBoard(newBoard);
            return;
        }

        if (newBoard[r][c] === num) return;
        newBoard[r][c] = num;
        setLocalBoard(newBoard);

        if (solution && solution[r][c] === num) {
             if (newBoard.every((row, i) => row.every((val, j) => val === solution[i][j]))) {
                 setIsSolved(true);
                 audioEngine.playSuccess();
             }
        } else {
            setMistakes(m => m + 1);
        }
    }, [selected, mainMode, isSolved, initialBoard, localBoard, solution]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (mainMode !== 'practice' || !selected) return;
            if (e.key >= '1' && e.key <= '9') {
                const num = parseInt(e.key);
                if (num <= size) handleNumberInput(num);
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                handleNumberInput(0);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selected, mainMode, handleNumberInput, size]);

    const currentBoard = mainMode === 'simulation' ? displayBoard : localBoard;
    const emptyCount = useMemo(() => {
        if (!currentBoard) return 0;
        let count = 0;
        currentBoard.forEach(r => r.forEach(c => { if(c === 0) count++ }));
        return count;
    }, [currentBoard]);

    const getCellSize = () => {
        if (size <= 4) return "w-16 h-16 text-2xl"; 
        if (size <= 9) return "w-10 h-10 text-xl"; 
        return "w-8 h-8 text-xs"; 
    };

    const safeBoard = (currentBoard && currentBoard.length > 0) 
        ? currentBoard 
        : Array(size).fill().map(() => Array(size).fill(0));

    return (
        <div className={cn(
          "bg-slate-800/40 backdrop-blur-md border rounded-xl p-1.5 flex flex-col shadow-xl transition-all group overflow-hidden h-full",
          isSolved ? "border-amber-500/50 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.15)]" : "border-slate-700/50"
        )}>
           {/* Header Area */}
           <div className="flex justify-between items-center mb-1.5 min-h-[30px] px-1">
                <div className="flex items-center gap-2">
                    {(() => {
                        const config = {
                            backtrack: { label: 'Backtrack Solver', icon: RefreshCw, color: 'text-amber-400' },
                            naked: { label: 'Naked Single Lab', icon: Zap, color: 'text-purple-400' },
                            dynamic: { label: 'CSP Heuristic Lab', icon: BrainCircuit, color: 'text-amber-400' },
                            practice: { label: 'Practice Mode', icon: Edit3, color: 'text-sky-400' }
                        };
                        const activeKey = mainMode === 'simulation' ? algoId : 'practice';
                        const item = config[activeKey] || config.backtrack;
                        const Icon = item.icon;
                        
                        return (
                            <>
                                <Icon size={14} className={cn("opacity-70", item.color)} />
                                <h3 className={cn("text-[10px] font-bold uppercase tracking-widest", item.color, "opacity-70")}>
                                    {item.label}
                                </h3>
                            </>
                        );
                    })()}
                </div>

                <div className="flex items-center gap-1.5">
                    <button 
                        onClick={handleCardReset}
                        className="p-1.5 rounded-lg bg-slate-700/30 text-slate-500 hover:text-amber-400 border border-white/5 transition-all active:scale-95 mr-1"
                        title="Reset Current Board"
                    >
                        <RotateCcw size={13} />
                    </button>

                   {mainMode === 'simulation' && (
                     <>
                        <button 
                          onClick={onReset}
                          className="p-1.5 rounded-lg bg-slate-700/30 text-slate-500 hover:text-emerald-400 border border-white/5 transition-all active:scale-95 mr-1"
                          title="Generate Global New Puzzle"
                        >
                          <RefreshCw size={13} />
                        </button>

                        <div className="flex items-center">
                         {!isSimPlaying ? (
                            <button 
                              onClick={() => runSimulation()}
                              className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400/60 hover:bg-amber-400/20 border border-amber-500/10 transition-all active:scale-95"
                            >
                              <Play size={14} fill="currentColor" />
                            </button>
                         ) : (
                            <button 
                              onClick={stopSimulation}
                              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all active:scale-95 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                            >
                              <div className="w-3 h-3 bg-current rounded-sm shadow-inner" />
                            </button>
                         )}
                        </div>
                      </>
                    )}
                 </div>
           </div>

           {/* Premium Legend */}
           {mainMode === 'simulation' && (
               <div className="flex justify-between px-4 py-2.5 border-b border-slate-700/30 bg-slate-900/40 mb-2 rounded-t-lg">
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Forced</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Backtrack</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Success</span>
                   </div>
               </div>
           )}

            {/* Board Area Area */}
            <div className="flex flex-col items-center justify-center relative p-2 flex-1">
                 <div className="grid gap-1.5 bg-slate-900/40 p-1.5 rounded-xl border border-slate-700/50 shadow-inner" 
                      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                    {safeBoard.flatMap((row, r) => 
                        row.map((val, c) => {
                            const isInitial = initialBoard?.[r]?.[c] !== 0 && initialBoard?.[r]?.[c] !== undefined;
                            const isSelected = selected?.r === r && selected?.c === c;
                            const isActiveSim = mainMode === 'simulation' && activeCell?.r === r && activeCell?.c === c;
                            const isBacktracking = isActiveSim && activeCell?.type === 'backtrack';
                            const isNaked = isActiveSim && activeCell?.type === 'try' && activeCell?.method === 'naked';
                            const isTrying = isActiveSim && activeCell?.type === 'try' && !isNaked;

                            const isBoxRight = (c + 1) % boxSize === 0 && c !== size - 1;
                            const isBoxBottom = (r + 1) % boxSize === 0 && r !== size - 1;

                            return (
                                <div
                                    key={`cell-${r}-${c}`}
                                    onClick={() => handleCellClick(r, c)}
                                    className={cn(
                                        "flex items-center justify-center rounded-lg font-semibold transition-all relative overflow-hidden select-none cursor-pointer",
                                        getCellSize(),
                                        
                                        // Base Styling
                                        isInitial 
                                            ? "bg-slate-700/40 text-slate-300 border-2 border-slate-600/30 shadow-none" 
                                            : "bg-slate-800/80 text-emerald-300 border border-slate-700/50 shadow-inner",
                                        
                                        // Thick Borders for Sudoku Boxes
                                        isBoxRight && "mr-1",
                                        isBoxBottom && "mb-1",

                                        // Solver Highlighting (Active States)
                                        isNaked && "bg-purple-500/30 text-purple-200 ring-2 ring-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.5)] z-20 scale-110",
                                        isTrying && "bg-amber-500/30 text-amber-100 ring-2 ring-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)] z-20 scale-110",
                                        isBacktracking && "bg-rose-500/40 text-white ring-2 ring-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)] z-20 animate-pulse",
                                        
                                        // Success / Practice Styling
                                        isSolved && !isInitial && "bg-emerald-500/30 text-emerald-100 ring-1 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-100",
                                        isSelected && "ring-2 ring-amber-500 bg-amber-500/20 z-10 scale-105",
                                        mainMode === 'practice' && !isInitial && val !== 0 && solution?.[r]?.[c] !== val && "bg-rose-900/40 text-rose-400 ring-2 ring-rose-500 animate-bounce"
                                    )}
                                >
                                    {val !== 0 ? val : ''}
                                    {(isTrying || isNaked || isBacktracking) && (
                                        <div className={cn(
                                            "absolute inset-0 opacity-20 animate-pulse",
                                            isBacktracking ? "bg-rose-500" : (isNaked ? "bg-purple-400" : "bg-amber-400")
                                        )} />
                                    )}
                                </div>
                            );
                        })
                    )}
                 </div>
            </div>

            {/* Bottom Info & Stats Bar Area */}
            {mainMode === 'simulation' ? (
                <div className="flex flex-col mt-2">
                    <div className="h-10 flex items-center justify-center mb-2 px-4 bg-slate-900/80 rounded-xl border border-amber-500/20 shadow-inner group-hover:border-amber-500/40 transition-all">
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-center text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                            {dynamicDesc || "Ready for Simulation"}
                        </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 py-3 border-t border-slate-700/50 bg-slate-900/30 rounded-b-xl">
                        <div className="flex flex-col items-center">
                            <Activity size={14} className="text-rose-400 mb-1" />
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Steps</span>
                            <span className="text-xs font-mono text-slate-200">{simStats?.steps?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Trophy size={14} className="text-amber-500 mb-1" />
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Progress</span>
                            <span className="text-xs font-mono text-amber-200">{progressPercent}%</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Hash size={14} className="text-cyan-400 mb-1" />
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Solving</span>
                            <span className="text-xs font-mono text-slate-200">{emptyCount} Left</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Clock size={14} className="text-sky-400 mb-1" />
                            <span className="text-[9px] text-slate-500 font-bold uppercase">Time</span>
                            <span className="text-xs font-mono text-slate-200">{(simStats?.time / 1000)?.toFixed(2) || "0.00"}s</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mt-4 flex flex-col items-center gap-3 border-t border-slate-700/50 pt-4 px-2">
                     <div className="w-full flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <AlertCircle size={12} className="text-rose-400" />
                            <div className="text-rose-400 text-[10px] font-bold uppercase tracking-wider">Mistakes: {mistakes}</div>
                         </div>
                         {isSolved && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 rounded-full border border-amber-500/30">
                                <CheckCircle2 size={10} className="text-amber-400" />
                                <span className="text-amber-400 text-[10px] font-bold uppercase animate-pulse">Perfect!</span>
                            </div>
                         )}
                     </div>
                     <div className="grid grid-cols-6 gap-2 w-full pb-2">
                         <button 
                             onClick={() => setNoteMode(!noteMode)} 
                             className={cn(
                                 "col-span-1 rounded-lg flex items-center justify-center transition-all h-9 border", 
                                 noteMode ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-slate-700/30 border-white/5 text-slate-500 hover:text-slate-300"
                             )}
                         >
                             <Edit3 size={16} />
                         </button>
                         <button 
                            onClick={() => handleNumberInput(0)} 
                            className="col-span-1 bg-slate-700/30 border border-white/5 text-slate-500 rounded-lg flex items-center justify-center hover:bg-slate-700 hover:text-rose-400 h-9 transition-all"
                         >
                             <Eraser size={16} />
                         </button>
                         <div className="col-span-4 flex gap-1.5 overflow-x-auto no-scrollbar">
                             {Array.from({length: size > 9 ? 9 : size}, (_, i) => i + 1).map(n => (
                                <button 
                                    key={n} 
                                    onClick={() => handleNumberInput(n)} 
                                    className="bg-amber-600/20 border border-amber-500/30 text-amber-100 font-bold w-9 h-9 rounded-lg hover:bg-amber-600/40 hover:scale-105 active:scale-95 flex-shrink-0 transition-all shadow-lg"
                                >
                                    {n}
                                </button>
                             ))}
                         </div>
                     </div>
                </div>
            )}
        </div>
    );
};

export default SudokuCard;
