import React from 'react';
import { Settings, Play, RotateCcw, X, GraduationCap, Zap, ChevronUp, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export const SudokuMobileControlBar = ({ 
    selectedSize, 
    setSelectedSize,
    selectedAlgos,
    toggleAlgo,
    onRunAll, // SudokuBoard uses triggerRun so this might be wrapped
    onResetAll,
    mainMode,
    setMainMode,
    isRunningAny,
    difficulty,
    setDifficulty
}) => {
    const [isOpen, setIsOpen] = React.useState(false);

    // Adapting for generic handler naming just in case
    const handleRun = onRunAll;
    const handleReset = onResetAll;

    const SIZES = [4, 9];
    const ALGOS = [
        { id: 'backtrack', label: 'Backtrack' },
        { id: 'naked', label: 'Naked Single' },
        { id: 'dynamic', label: 'CSP (Dynamic)' },
    ];
    const DIFFICULTIES = ['easy', 'medium', 'hard'];

    return (
        <>
            {/* FAB / Trigger (Bottom Right) inside safe area, usually hidden if bar is visible */}
            <div className="lg:hidden fixed bottom-6 right-6 z-40">
                <button 
                  onClick={() => setIsOpen(true)}
                  className="bg-amber-500 text-white p-3 rounded-full shadow-xl shadow-amber-500/30 border border-white/20 active:scale-95 transition-all"
                >
                    <Settings size={24} />
                </button>
            </div>

            {/* Bottom Sheet */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-3xl z-50 p-6 lg:hidden max-h-[85vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Zap className="text-amber-400" size={18} />
                                    Sudoku Controls
                                </h3>
                                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400">
                                    <ChevronUp size={20} className="rotate-180" />
                                </button>
                            </div>

                            {/* Mode Switch */}
                            <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-800 rounded-xl">
                                {[
                                    { id: 'simulation', label: 'Auto Solve', icon: Zap },
                                    { id: 'practice', label: 'Practice', icon: GraduationCap }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMainMode(m.id)}
                                        className={cn(
                                            "py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all",
                                            mainMode === m.id ? "bg-amber-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300" 
                                        )}
                                    >
                                        <m.icon size={16} /> {m.label}
                                    </button>
                                ))}
                            </div>

                            {/* Size Selector */}
                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Board Size</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {SIZES.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            className={cn(
                                                "py-3 rounded-xl border font-bold text-sm transition-all",
                                                selectedSize === s 
                                                    ? "bg-amber-500/20 border-amber-500 text-amber-300" 
                                                    : "bg-slate-800 border-slate-700 text-slate-400"
                                            )}
                                        >
                                            {s}x{s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Settings based on mode */}
                            {mainMode === 'simulation' ? (
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Algorithms</label>
                                    <div className="space-y-2">
                                        {ALGOS.map(algo => (
                                            <button
                                                key={algo.id}
                                                onClick={() => toggleAlgo(algo.id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                                                    selectedAlgos.has(algo.id) 
                                                        ? "bg-amber-500/10 border-amber-500/50 text-amber-100" 
                                                        : "bg-slate-800 border-slate-700 text-slate-500"
                                                )}
                                            >
                                                <span className="font-bold text-sm">{algo.label}</span>
                                                {selectedAlgos.has(algo.id) && <Check size={16} className="text-amber-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="mb-6">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">Difficulty</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {DIFFICULTIES.map(diff => (
                                            <button
                                                key={diff}
                                                onClick={() => setDifficulty(diff)}
                                                className={cn(
                                                    "py-2 rounded-lg border text-xs font-bold uppercase transition-all",
                                                    difficulty === diff
                                                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                                                        : "bg-slate-800 border-slate-700 text-slate-500" 
                                                )}
                                            >
                                                {diff}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 mt-8">
                                <button 
                                    onClick={() => { handleReset(); setIsOpen(false); }}
                                    className="flex-1 py-4 rounded-xl bg-slate-800 text-slate-300 font-bold border border-slate-700 flex items-center justify-center gap-2"
                                >
                                    <RotateCcw size={18} /> Reset
                                </button>
                                {mainMode === 'simulation' && (
                                    <button 
                                        onClick={() => { handleRun(); setIsOpen(false); }}
                                        disabled={isRunningAny}
                                        className={cn(
                                            "flex-[2] py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-xl",
                                            isRunningAny ? "bg-slate-700 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30"
                                        )}
                                    >
                                        <Play size={18} fill="currentColor" />
                                        {isRunningAny ? "Running..." : "Run Solver"}
                                    </button>
                                )}
                            </div>

                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
