import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSudoku } from './logic';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RefreshCw, Eraser, LayoutGrid, AlertCircle, Edit3, HelpCircle } from 'lucide-react';

export default function SudokuBoard() {
  const [difficulty, setDifficulty] = useState('easy');
  const [game, setGame] = useState(() => {
    const { initial, solution } = generateSudoku('easy');
    return { initial, current: initial.map(row => [...row]), solution };
  });
  const [selected, setSelected] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [noteMode, setNoteMode] = useState(false);

  const startNewGame = useCallback(() => {
    const { initial, solution } = generateSudoku(difficulty);
    const current = initial.map(row => [...row]);
    setGame({ initial, current, solution });
    setMistakes(0);
    setIsSolved(false);
    setSelected(null);
  }, [difficulty]);

  // No longer need immediate call in useEffect for initial mount
  // But we still need to restart when difficulty changes
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
    }
    startNewGame();
  }, [startNewGame]);


  const handleCellClick = (r, c) => {
    if (game.initial[r][c] !== 0) return;
    setSelected({ r, c });
  };

  const handleNumberInput = useCallback((num) => {
    if (!selected || isSolved) return;
    const { r, c } = selected;

    setGame(prev => {
      if (prev.initial[r][c] !== 0) return prev;
      if (noteMode) return prev; // Notes handled elsewhere

      const newCurrent = prev.current.map(row => [...row]);
      newCurrent[r][c] = num;

      if (num !== 0 && num !== prev.solution[r][c]) {
        setMistakes(m => m + 1);
      }
      
      if (JSON.stringify(newCurrent) === JSON.stringify(prev.solution)) {
        setIsSolved(true);
      }

      return { ...prev, current: newCurrent };
    });
  }, [selected, isSolved, noteMode]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '1' && e.key <= '9') {
        handleNumberInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleNumberInput(0);
      } else if (e.key === 'n') {
          setNoteMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumberInput]);

  if (!game.current.length) return <div className="text-white">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Main Card */}
      <div className="bg-slate-800/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl backdrop-blur-sm">
        
        {/* Header with Small Actions */}
        <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
           {/* Left: Title & Icon */}
           <div className="flex items-center gap-3">
             <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
               <LayoutGrid size={24} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white">Sudoku</h2>
               <p className="text-slate-400 text-xs">Classic Puzzle</p>
             </div>
          </div>
          
           {/* Right: Difficulty & Small Actions */}
           <div className="flex items-center gap-2">
             <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/10">
               {['easy', 'medium', 'hard'].map(d => (
                   <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all",
                           difficulty === d 
                              ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20" 
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                   >
                       {d}
                   </button>
               ))}
             </div>
             {/* Small Info Button */}
             <button className="p-2 rounded-lg bg-slate-900/50 text-slate-400 hover:text-white border border-white/10 transition-colors">
                <HelpCircle size={18} />
             </button>
           </div>
        </div>

        {/* Game Area */}
        <div className="p-6 lg:p-10 flex flex-col lg:flex-row items-start justify-center gap-10 lg:gap-16">
          
          {/* Left: Sudoku Grid */}
          <div className="relative group">
             <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             
             <div className="relative bg-slate-900 p-3 rounded-xl border border-slate-700 shadow-2xl">
                <div className="grid grid-cols-9 gap-[1px] bg-slate-600 border border-slate-600">
                    {game.current.map((row, r) => 
                        row.map((val, c) => {
                            const isInitial = game.initial[r][c] !== 0;
                            const isSelected = selected?.r === r && selected?.c === c;
                            const isError = !isInitial && val !== 0 && val !== game.solution[r][c];
                            
                            return (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => handleCellClick(r, c)}
                                    className={cn(
                                        "w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-lg sm:text-xl cursor-pointer transition-colors select-none",
                                        "bg-slate-800 hover:bg-slate-700/90",
                                        isInitial ? "font-bold text-slate-200 bg-slate-800/60" : "text-amber-300 font-medium",
                                        isSelected ? "bg-amber-600/30 ring-2 ring-amber-500 inset-0 z-10" : "",
                                        isError ? "text-red-400 bg-red-900/20" : "",
                                        (selected && game.current[selected.r][selected.c] === val && val !== 0 && !isSelected) ? "bg-amber-900/40" : "",
                                         (c % 3 === 2 && c !== 8) && "border-r-2 border-r-slate-500/50",
                                         (r % 3 === 2 && r !== 8) && "border-b-2 border-b-slate-500/50"
                                    )}
                                    style={{
                                        borderRightWidth: (c % 3 === 2 && c !== 8) ? '2px' : '0px',
                                        borderBottomWidth: (r % 3 === 2 && r !== 8) ? '2px' : '0px',
                                        borderColor: 'rgba(100, 116, 139, 0.5)'
                                    }}
                                >
                                    {val !== 0 ? val : ''}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
          </div>

          {/* Right: Interaction Panel */}
          <div className="flex flex-col w-full max-w-xs gap-6">
               
               {/* Mistakes */}
               <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <AlertCircle size={16} /> Mistakes
                   </div>
                   <div className={cn("text-xl font-black", mistakes > 2 ? "text-red-400" : "text-white")}>
                       {mistakes}<span className="text-slate-600 text-sm">/3</span>
                   </div>
               </div>

               {/* Numpad */}
               <div className="grid grid-cols-3 gap-2">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                       <button
                           key={n}
                           onClick={() => handleNumberInput(n)}
                           className="h-12 sm:h-14 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-700 text-xl font-bold text-white transition-all active:scale-95 shadow-lg shadow-black/20"
                       >
                           {n}
                       </button>
                   ))}
               </div>
               
               {/* Small Action Buttons */}
               <div className="flex items-center gap-2">
                   <button 
                      onClick={() => handleNumberInput(0)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800/50 text-slate-400 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all text-xs font-bold uppercase"
                    >
                       <Eraser size={16} /> Erase
                   </button>
                   
                   <button 
                      onClick={() => setNoteMode(!noteMode)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all text-xs font-bold uppercase",
                        noteMode 
                            ? "bg-amber-600 text-white border-amber-500 shadow-lg shadow-amber-500/20" 
                            : "bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                       <Edit3 size={16} /> Notes
                   </button>

                   <button 
                      onClick={startNewGame}
                      className="p-3 rounded-xl bg-amber-600/10 text-amber-400 border border-amber-500/20 hover:bg-amber-600 hover:text-white transition-all"
                      title="New Game"
                    >
                       <RefreshCw size={18} />
                   </button>
               </div>
          </div>

        </div>

      </div>
       {isSolved && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 rounded-3xl"
          >
              <div className="bg-slate-900 p-8 rounded-2xl border-2 border-amber-500 text-center shadow-2xl">
                  <h3 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400 mb-4">
                      Solved!
                  </h3>
                  <button 
                    onClick={startNewGame}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-colors"
                  >
                      Play Again
                  </button>
              </div>
          </motion.div>
      )}
    </div>
  );
}
