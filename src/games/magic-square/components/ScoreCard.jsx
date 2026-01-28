import React from 'react';
import { Check, Clock, Activity } from 'lucide-react';
import { cn } from "../../../utils/cn";

export const ScoreCard = ({ algoId, size, stats, isRunning, isDone }) => {
    const labels = {
      dynamic: { name: 'Heuristic CSP', desc: 'Constraint satisfaction algorithm', color: 'text-emerald-400', bg: 'bg-emerald-400' },
      heuristic: { name: 'Smart Backtrack', desc: 'Forced-assignment backtracking', color: 'text-teal-400', bg: 'bg-teal-400' },
      metric: { name: 'Metric Backtrack', desc: 'Distance-based pruning', color: 'text-lime-400', bg: 'bg-lime-400' },
      backtrack: { name: 'Recursive Backtrack', desc: 'Classic recursive search', color: 'text-rose-400', bg: 'bg-rose-500' },
      brute: { name: 'Pure Brute Force', desc: 'Exhaustive permutation search', color: 'text-slate-400', bg: 'bg-slate-500' },
      formula: { name: 'Direct Formula', desc: 'Static magic square construction', color: 'text-yellow-400', bg: 'bg-yellow-500' },
      swing: { name: 'Formula Swing', desc: '4x4 Rotation algorithm', color: 'text-sky-400', bg: 'bg-sky-500' }
    };

    const l = labels[algoId] || { name: algoId, desc: '', color: 'text-white', bg: 'bg-white' };

    // Use stats passed from parent, default to 0
    const displayAttempts = stats?.attempts || 0;
    const displayTime = stats?.time || 0;

    return (
        <div className={cn(
            "p-5 rounded-2xl border transition-all duration-500 relative overflow-hidden",
            isRunning 
                ? "bg-slate-800/80 border-indigo-500/30 shadow-lg shadow-indigo-500/10" 
                : "bg-slate-900/40 border-white/5",
            isDone && "bg-slate-800/40 border-emerald-500/20"
        )}>
             {/* Background Pulse for Running State */}
             {isRunning && (
                 <div className="absolute inset-0 bg-indigo-500/5 animate-pulse pointer-events-none" />
             )}

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h5 className={cn("text-xs font-black uppercase tracking-widest mb-1", l.color)}>{l.name}</h5>
                    <p className="text-[9px] text-slate-500 font-bold">{l.desc}</p>
                </div>
                {isDone && <Check size={16} className="text-emerald-500" />}
                {isRunning && <Activity size={16} className="text-indigo-400 animate-spin-slow" />}
            </div>
            
            <div className="grid grid-cols-2 gap-4 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1 flex items-center gap-1">
                        Total Steps
                    </span>
                    <span className="text-xl font-mono text-white flex items-baseline gap-1">
                        {displayAttempts.toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-bold tracking-normal">steps</span>
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1 flex items-center gap-1">
                        Elapsed Time
                    </span>
                    <span className={cn("text-xl font-mono flex items-baseline gap-1", isDone ? "text-emerald-300" : "text-white")}>
                        {(displayTime / 1000).toFixed(3)}
                        <span className="text-[10px] text-slate-500 font-bold tracking-normal">sec</span>
                    </span>
                </div>
            </div>

            {/* Progress Bar Visual */}
            <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden relative z-10">
                <div 
                    style={{ width: isDone ? '100%' : (isRunning ? '100%' : '0%') }}
                    className={cn(
                        "h-full transition-all duration-1000 ease-out", 
                        l.bg, 
                        isRunning ? "animate-progress-indeterminate opacity-50" : "opacity-100"
                    )}
                />
            </div>
        </div>
    );
}
