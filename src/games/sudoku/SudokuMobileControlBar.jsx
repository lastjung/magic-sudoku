import React from 'react';
import { Play, RotateCcw, Settings2, Square, ChevronDown, Volume2, VolumeX, Grid3X3, Check, BrainCircuit, LayoutGrid, Zap, Sliders, RefreshCw } from 'lucide-react';
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
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [soundEnabled, setSoundEnabled] = React.useState(audioEngine.enabled);

    const toggleSound = () => {
        const next = !soundEnabled;
        setSoundEnabled(next);
        audioEngine.setEnabled(next);
    };

    const SIZES = [4, 9];
    const simulationAlgos = [
        { id: 'backtrack', label: 'Backtrack', icon: RotateCcw },
        { id: 'naked', label: 'Naked Single', icon: Zap },
        { id: 'dynamic', label: 'CSP Solver', icon: BrainCircuit },
    ];

    const allSelected = selectedAlgos.size === simulationAlgos.length;
    const noneSelected = selectedAlgos.size === 0;

    return (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 z-[60] px-6 pointer-events-none">
            <div className="max-w-7xl mx-auto flex flex-col gap-2 pointer-events-auto">
                
                {/* Expanded Menu */}
                {isMenuOpen && (
                    <div className="bg-slate-800/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl mb-2 animate-in slide-in-from-bottom-5 duration-300">
                        {/* Header: Modes & Sound */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                            <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5">
                                <button 
                                    onClick={() => setMainMode('practice')}
                                    className={cn(
                                        "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                                        mainMode === 'practice' ? "bg-amber-400/20 border border-amber-400/30 text-amber-300" : "text-slate-500"
                                    )}
                                >
                                    Practice
                                </button>
                                <button 
                                    onClick={() => setMainMode('simulation')}
                                    className={cn(
                                        "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all",
                                        mainMode === 'simulation' ? "bg-amber-400/20 border border-amber-400/30 text-amber-300" : "text-slate-500"
                                    )}
                                >
                                    Simulation
                                </button>
                            </div>
                            <button 
                                onClick={toggleSound}
                                className={cn(
                                    "p-2 rounded-lg transition-all border",
                                    soundEnabled ? "bg-amber-400/20 border-amber-400/30 text-amber-300" : "bg-slate-700/50 border-white/5 text-slate-500"
                                )}
                            >
                                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            </button>
                        </div>

                        {/* Size Selector */}
                        <div className="mb-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Board Size</span>
                            <div className="flex gap-2">
                                {SIZES.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={cn(
                                            "flex-1 h-10 rounded-lg border text-xs font-bold transition-all",
                                            selectedSize === size ? "bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-500/20" : "bg-slate-900/50 border-white/5 text-slate-500"
                                        )}
                                    >
                                        {size}x{size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty Selector (Always visible or practice only as needed) */}
                        <div className="mb-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Difficulty</span>
                            <div className="grid grid-cols-3 gap-2">
                                {['easy', 'medium', 'hard'].map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => setDifficulty(diff)}
                                        className={cn(
                                            "py-2 rounded-lg border text-[10px] font-bold uppercase transition-all",
                                            difficulty === diff ? "bg-amber-500 border-amber-400 text-white" : "bg-slate-900/50 border-white/5 text-slate-500"
                                        )}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Algorithm Selection */}
                        {mainMode === 'simulation' && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Algorithms</span>
                                    <button 
                                        onClick={() => {
                                            const allIds = simulationAlgos.map(a => a.id);
                                            if (selectedAlgos.size === allIds.length) {
                                                allIds.forEach(id => toggleAlgo(id)); // This might need a bulk toggle if available
                                            } else {
                                                allIds.forEach(id => { if(!selectedAlgos.has(id)) toggleAlgo(id); });
                                            }
                                        }}
                                        className="text-[9px] font-bold text-amber-400 uppercase tracking-tighter"
                                    >
                                        {allSelected ? "Deselect All" : "Select All"}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {simulationAlgos.map(algo => (
                                        <button
                                            key={algo.id}
                                            onClick={() => toggleAlgo(algo.id)}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-xl border transition-all text-left",
                                                selectedAlgos.has(algo.id) 
                                                    ? "bg-amber-600/20 border-amber-500/50 text-white" 
                                                    : "bg-slate-900/40 border-white/5 text-slate-500"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 rounded flex items-center justify-center border transition-all",
                                                selectedAlgos.has(algo.id) ? "bg-amber-500 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" : "border-slate-700 bg-slate-800"
                                            )}>
                                                {selectedAlgos.has(algo.id) && <Check size={10} className="text-white" />}
                                            </div>
                                            <span className="text-[10px] font-bold truncate uppercase">{algo.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Main Bar */}
                <div className="h-16 bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center justify-between p-2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                    
                    <div className="flex items-center gap-1.5 z-10">
                        {/* Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={cn(
                                "w-12 h-12 flex items-center justify-center rounded-xl transition-all active:scale-95",
                                isMenuOpen ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-slate-700/50 text-slate-400"
                            )}
                        >
                            {isMenuOpen ? <ChevronDown size={20} /> : <Settings2 size={20} />}
                        </button>

                        {/* Reset Button */}
                        <button
                            onClick={onResetAll}
                            className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-700/30 text-slate-400 hover:text-white active:scale-95 transition-all"
                            title="Reset All"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>

                    {/* Main Action Button */}
                    <div className="flex-1 pl-3 z-10">
                        {isRunningAny ? (
                            <button
                                onClick={onResetAll}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-slate-700/50 text-slate-300 border border-white/10 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all"
                            >
                                <div className="w-2.5 h-2.5 bg-slate-400 rounded-sm" /> HOLD ALL
                            </button>
                        ) : (
                            <button
                                onClick={onRunAll}
                                className="w-full h-12 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-amber-500/40 active:scale-95 transition-all"
                            >
                                <Play size={16} fill="currentColor" /> RUN {mainMode === 'simulation' ? 'LAB' : 'PRACTICE'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
