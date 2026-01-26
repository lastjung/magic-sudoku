import React from 'react';
import { Info, Cpu, Zap, BrainCircuit, LayoutGrid, Sliders, RefreshCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

export const MagicAlgoTable = () => {
  const algoData = [
    {
      id: 'dynamic',
      name: 'Heuristic CSP',
      icon: <BrainCircuit size={16} />,
      strategy: 'Constraint Satisfaction',
      complexity: 'O(Exp)',
      suitability: 'Universal Solver',
      desc: 'Avoids conflicts by predicting constraint violations. High success rate across varied grid sizes.'
    },
    {
      id: 'heuristic',
      name: 'Smart Backtrack',
      icon: <LayoutGrid size={16} />,
      strategy: 'Cell Priority DFS',
      complexity: 'O(Exp)',
      suitability: 'Densely Constrained Boards',
      desc: 'Uses "forced-cell" logic to populate squares with restricted options first, reducing branching factor.'
    },
    {
      id: 'metric',
      name: 'Metric Backtrack',
      icon: <Sliders size={16} />,
      strategy: 'Distance-Weighted DFS',
      complexity: 'O(Exp)',
      suitability: 'Optimized Search',
      desc: 'Prunes the search space by evaluating global sum distance at each step.'
    },
    {
      id: 'backtrack',
      name: 'Recursive Backtrack',
      icon: <RefreshCcw size={16} />,
      strategy: 'Depth-First Search',
      complexity: 'O(N!)',
      suitability: '3x3 Visualisation',
      desc: 'Standard exhaustive search. Reliable but suffers from extreme state-space explosion.'
    },
    {
      id: 'brute',
      name: 'Pure Brute Force',
      icon: <Cpu size={16} />,
      strategy: 'Naive Iteration',
      complexity: 'O(N^N)',
      suitability: 'Small Data Only',
      desc: 'Tries every possible permutation without pruning. Primarily for educational performance comparison.'
    },
    {
      id: 'formula',
      name: 'Direct Formula',
      icon: <Zap size={16} />,
      strategy: 'Mathematical Construction',
      complexity: 'O(N²)',
      suitability: 'Instant Execution',
      desc: 'Uses Siamese or Strachey methods to generate valid squares instantly via fixed patterns.'
    }
  ];

  return (
    <div className="w-full mt-8 overflow-hidden bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-emerald-500/10 px-6 py-5 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <Info size={20} />
              </div>
              <h4 className="text-sm font-black text-emerald-300 uppercase tracking-widest">Global Algorithm Performance Matrix (English)</h4>
          </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 bg-white/5">
              <th className="py-5 px-6">Algorithm Engine</th>
              <th className="py-5 px-6">Strategy</th>
              <th className="py-5 px-6">Time Complexity</th>
              <th className="py-5 px-6">Best Suitability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {algoData.map((algo) => (
              <tr key={algo.id} className="group hover:bg-emerald-500/10 transition-colors">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-800 rounded-xl text-emerald-400 border border-white/5 group-hover:border-emerald-500/30 transition-all">
                      {algo.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-white uppercase tracking-tight text-sm">{algo.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{algo.desc}</span>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-6 font-semibold text-slate-300">{algo.strategy}</td>
                <td className="py-5 px-6 font-mono text-emerald-400 font-bold">{algo.complexity}</td>
                <td className="py-5 px-6">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-[10px] uppercase tracking-wider border border-emerald-500/30">
                    {algo.suitability}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
