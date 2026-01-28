import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from "../../../utils/cn";

export const ScoreCard = ({ algoId, size, triggerRun, triggerReset, speed, steps, onComplete }) => {
    // 작동 중지: 자체 시뮬레이션 로직 제거
    const [stats, setStats] = useState({ attempts: 0, time: 0 });
    const [isDone, setIsDone] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    // 부모로부터 완료 신호나 데이터를 받을 수 있도록 대비만 해둠 (현재는 작동 안 함)
    // "나중에 업데이트"를 위해 일단 UI 뼈대만 유지하고 내부 엔진은 껐습니다.

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

    return (
        <div className={cn(
            "p-5 rounded-2xl border transition-all duration-500",
            isRunning ? "bg-slate-700/30 border-indigo-500/30 scale-105" : "bg-slate-900/40 border-white/5"
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
                        {isDone ? stats.attempts.toLocaleString() : "0"}
                        <span className="text-[10px] text-slate-500 font-bold tracking-normal">steps</span>
                    </span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Elapsed Time</span>
                    <span className="text-xl font-mono text-white flex items-baseline gap-1">
                        {isDone ? (stats.time / 1000).toFixed(3) : "0.000"}
                        <span className="text-[10px] text-slate-500 font-bold tracking-normal">sec</span>
                    </span>
                </div>
            </div>

            <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    style={{ width: isDone ? '100%' : '0%' }}
                    className={cn("h-full transition-all duration-1000 ease-out", l.bg)}
                />
            </div>
        </div>
    );
}
