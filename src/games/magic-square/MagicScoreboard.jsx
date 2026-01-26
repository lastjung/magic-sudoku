import React from 'react';
import { X, Trophy, Clock, Activity, BrainCircuit } from 'lucide-react';
import { cn } from '../../utils/cn';

export const MagicScoreboard = ({ results, onClose }) => {
  if (!results || results.length === 0) return null;

  // Sort by time for ranking
  const sortedByTime = [...results].sort((a, b) => a.time - b.time);
  const maxTime = Math.max(...results.map(r => r.time), 1);
  
  const getMedalColor = (rank) => {
    if (rank === 1) return 'text-emerald-400';
    if (rank === 2) return 'text-teal-400';
    if (rank === 3) return 'text-lime-400';
    return 'text-slate-500';
  };

  const getBarColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (rank === 2) return 'bg-gradient-to-r from-teal-500 to-teal-400';
    if (rank === 3) return 'bg-gradient-to-r from-lime-500 to-lime-400';
    return 'bg-gradient-to-r from-slate-600 to-slate-500';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Trophy className="text-emerald-400" size={28} />
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Lab Scoreboard</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Time Chart */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-emerald-400" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Time Comparison (Seconds)</span>
          </div>
          <div className="space-y-3">
            {sortedByTime.map((result, idx) => {
              const fastestTime = sortedByTime[0]?.time || 1;
              const percentage = Math.round((result.time / fastestTime) * 100);
              return (
                <div key={result.id} className="flex items-center gap-4">
                  <span className={cn("w-6 text-center font-black text-sm", getMedalColor(idx + 1))}>
                    {idx + 1}
                  </span>
                  <div className="w-32 flex flex-col">
                    <span className={cn("text-xs font-black truncate uppercase tracking-tighter", getMedalColor(idx + 1))}>
                        {result.name}
                    </span>
                  </div>
                  <div className="flex-1 h-8 bg-slate-800/50 rounded-xl overflow-hidden relative border border-white/5">
                    <div 
                      className={cn(
                        "h-full rounded-xl transition-all duration-1000 ease-out",
                        getBarColor(idx + 1)
                      )}
                      style={{ width: `${(result.time / maxTime) * 100}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center gap-2 text-[11px] font-black text-white drop-shadow-md uppercase tracking-tight">
                      {(result.time / 1000).toFixed(3)}s
                      <span className={cn(
                        "font-black opacity-80",
                        idx === 0 ? "text-white" : "text-white/60"
                      )}>
                        ({percentage}%)
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Table */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-emerald-400" />
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Detailed Statistics</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-3 px-2">Rank / Engine</th>
                  <th className="pb-3 text-center">Steps</th>
                  <th className="pb-3 text-center">Time</th>
                  <th className="pb-3 text-center">% (Speed)</th>
                  <th className="pb-3 text-center">Complexity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sortedByTime.map((result, idx) => {
                  const fastestTime = sortedByTime[0]?.time || 1;
                  const percentage = Math.round((result.time / fastestTime) * 100);
                  return (
                    <tr key={result.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                            <span className={cn("font-black text-sm w-4", getMedalColor(idx + 1))}>{idx + 1}.</span>
                            <div className="flex flex-col">
                                <span className={cn("text-xs font-black uppercase tracking-tight", getMedalColor(idx + 1))}>{result.name}</span>
                                <span className="text-[9px] text-slate-500 font-bold uppercase">{result.desc?.split(' ')[0]}</span>
                            </div>
                        </div>
                      </td>
                      <td className="py-4 text-center font-mono text-xs text-white/80">{result.attempts.toLocaleString()}</td>
                      <td className="py-4 text-center font-mono text-xs text-emerald-400">{(result.time / 1000).toFixed(3)}s</td>
                      <td className={cn("py-4 text-center text-[10px] font-black tracking-widest", idx === 0 ? "text-emerald-400" : "text-slate-500")}>
                        {percentage}%
                      </td>
                      <td className="py-4 text-center font-mono text-[10px] text-slate-500">{result.complexity || 'O(Exp)'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 flex justify-center bg-slate-900/50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="w-full max-w-xs py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            Close Results
          </button>
        </div>
      </div>
    </div>
  );
};
