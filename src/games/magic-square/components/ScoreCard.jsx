import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from "../../../utils/cn";
import { useMagicSquareGame } from '../useMagicSquareGame';

export const ScoreCard = ({ algoId, size, triggerRun, triggerReset, speed, steps, onComplete }) => {
    const [finalStats, setFinalStats] = useState({ attempts: 0, time: 0 });
    const [isDone, setIsDone] = useState(false);

    const labels = {
      dynamic: { name: 'Heuristic CSP', desc: 'Constraint satisfaction algorithm', color: 'text-emerald-400/80', bg: 'bg-emerald-400/60' },
      heuristic: { name: 'Smart Backtrack', desc: 'Forced-assignment backtracking', color: 'text-teal-400/80', bg: 'bg-teal-400/60' },
      metric: { name: 'Metric Backtrack', desc: 'Distance-based pruning', color: 'text-lime-400/80', bg: 'bg-lime-400/60' },
      backtrack: { name: 'Recursive Backtrack', desc: 'Classic recursive search', color: 'text-rose-400', bg: 'bg-rose-500' },
      brute: { name: 'Pure Brute Force', desc: 'Exhaustive permutation search', color: 'text-slate-400', bg: 'bg-slate-500' },
      formula: { name: 'Direct Formula', desc: 'Static magic square construction', color: 'text-emerald-400', bg: 'bg-emerald-500' },
      swing: { name: 'Formula Swing', desc: '4x4 Rotation algorithm', color: 'text-sky-400', bg: 'bg-sky-500' }
    };

    const l = labels[algoId] || { name: algoId, desc: '', color: 'text-white', bg: 'bg-white' };

    const { stats: currentStats, isPlaying } = useMagicSquareGame({ 
        size, 
        mainMode: 'simulation', 
        algoMode: algoId, 
        steps: steps, 
        speed, 
        triggerRun, 
        triggerReset,
        onComplete: (s) => {
            setFinalStats(s);
            setIsDone(true);
            if (onComplete) onComplete(s);
        }
    });

    useEffect(() => {
        if (triggerReset > 0) {
            setFinalStats({ attempts: 0, time: 0 });
            setIsDone(false);
        }
    }, [triggerReset]);

    const displayStats = isDone ? finalStats : currentStats;

    return (
        <div className={cn(
            "p-5 rounded-2xl border transition-all duration-500",
            isPlaying ? "bg-slate-700/30 border-indigo-500/30 scale-105 shadow-lg shadow-indigo-500/10" : "bg-slate-900/40 border-white/5"
        )}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h5 className={cn("text-xs font-black uppercase tracking-widest mb-1", l.color)}>{l.name}</h5>
                    <p className="text-[9px] text-slate-500 font-bold">{l.desc}</p>
                </div>
                {isDone && <Check size={14} className="text-emerald-500" />}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Total Steps</span>
                    <span className="text-xl font-mono text-white flex items-baseline gap-1">
                        {displayStats.attempts.toLocaleString()}
                        <span className="text-[10px] text-slate-500 font-bold tracking-normal">steps</span>
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Elapsed Time</span>
                    <span className="text-xl font-mono text-white flex items-baseline gap-1">
                        {(displayStats.time / 1000).toFixed(3)}
                        <span className="text-[10px] text-slate-500 font-bold tracking-normal">sec</span>
                    </span>
                </div>
            </div>

            <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    style={{ width: isPlaying ? '100%' : (isDone ? '100%' : '0%') }}
                    className={cn("h-full transition-all duration-1000 ease-out", l.bg, isPlaying ? "animate-pulse" : "")}
                />
            </div>
        </div>
    );
}
