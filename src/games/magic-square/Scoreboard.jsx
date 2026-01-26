import React, { useMemo } from 'react';
import { Trophy, Clock, Activity, X, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Scoreboard = ({ results, onClose, isOpen }) => {
  if (!isOpen) return null;

  const sortedResults = useMemo(() => {
    return Object.entries(results)
      .map(([id, stats]) => ({ id, ...stats }))
      .sort((a, b) => a.time - b.time);
  }, [results]);

  const minTime = sortedResults[0]?.time || 1;

  const getAlgoLabel = (id) => {
    const labels = {
      formula: 'Direct Formula',
      dynamic: 'CSP Solver',
      heuristic: 'Smart Backtrack',
      metric: 'Metric Backtrack',
      backtrack: 'Recursive Backtrack',
      brute: 'Pure Brute Force'
    };
    return labels[id] || id;
  };

  const getComplexity = (id) => {
    const complexities = {
      formula: 'O(n²)',
      dynamic: 'O(CSP)',
      heuristic: 'O(Smart)',
      metric: 'O(Metric)',
      backtrack: 'O(n!)',
      brute: 'O(n!)'
    };
    return complexities[id] || 'O(exp)';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Trophy className="text-amber-400" size={24} />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Simulation Scoreboard</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Time Bars Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock size={16} className="text-sky-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Time Comparison (Seconds)</h3>
            </div>
            <div className="space-y-3">
              {sortedResults.map((res, idx) => {
                const ratio = idx === 0 ? 100 : (res.time / minTime) * 100;
                const timeSec = (res.time / 1000).toFixed(2);
                const colorClass = idx === 0 ? "bg-emerald-500 shadow-emerald-500/20" : 
                                  idx === 1 ? "bg-amber-500 shadow-amber-500/20" : 
                                  "bg-slate-600 shadow-slate-600/20";

                return (
                  <div key={res.id} className="group">
                    <div className="flex justify-between items-end mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight flex items-center gap-1.5">
                        <span className={cn(
                          "w-4 h-4 flex items-center justify-center rounded text-[8px]",
                          idx === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                        )}>{idx + 1}</span>
                        {getAlgoLabel(res.id)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{timeSec}s ({Math.round(idx === 0 ? 100 : (minTime/res.time)*100)}%)</span>
                    </div>
                    <div className="h-6 w-full bg-slate-950 rounded-full border border-slate-800/50 overflow-hidden p-0.5">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-3", colorClass)}
                        style={{ width: `${Math.max(10, Math.min(100, (minTime / res.time) * 100))}%` }}
                      >
                         <span className="text-[8px] font-black text-white/80">{timeSec}s</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Statistics Table Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-rose-400" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Efficiency Metrics</h3>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800">
                    <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-widest text-[9px]">Algorithm</th>
                    <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-widest text-[9px]">Steps</th>
                    <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-widest text-[9px]">Time</th>
                    <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-widest text-[9px]">%</th>
                    <th className="px-4 py-3 text-slate-500 font-bold uppercase tracking-widest text-[9px]">Complexity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {sortedResults.map((res, idx) => (
                    <tr key={res.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold", idx === 0 ? "text-emerald-400" : "text-slate-300")}>
                            {idx + 1}. {getAlgoLabel(res.id).split(' ')[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400">{res.attempts.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-sky-400 font-bold">{(res.time / 1000).toFixed(2)}s</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-black",
                          idx === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                        )}>
                          ({Math.round((minTime / res.time) * 100)}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-500 italic">{getComplexity(res.id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 text-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all active:scale-95"
          >
            Close Results
          </button>
        </div>
      </div>
    </div>
  );
};
