import React from 'react';
import { Info, Cpu, Zap, BrainCircuit, LayoutGrid, Sliders, RefreshCcw, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

export const MagicAlgoTable = ({ onClose }) => {
  const algoData = [
    {
      id: 'dynamic',
      name: 'Heuristic CSP',
      icon: <BrainCircuit size={16} />,
      strategy: 'Constraint Satisfaction',
      complexity: 'O(Exp)',
      suitability: 'Universal Solver',
      desc: 'Avoids conflicts by predicting constraint violations.'
    },
    {
      id: 'heuristic',
      name: 'Smart Backtrack',
      icon: <LayoutGrid size={16} />,
      strategy: 'Cell Priority DFS',
      complexity: 'O(Exp)',
      suitability: 'Densely Constrained',
      desc: 'Uses "forced-cell" logic to populate squares first.'
    },
    {
      id: 'metric',
      name: 'Metric Backtrack',
      icon: <Sliders size={16} />,
      strategy: 'Distance-Weighted DFS',
      complexity: 'O(Exp)',
      suitability: 'Optimized Search',
      desc: 'Prunes via global sum distance evaluation.'
    },
    {
      id: 'backtrack',
      name: 'Recursive Backtrack',
      icon: <RefreshCcw size={16} />,
      strategy: 'Depth-First Search',
      complexity: 'O(N!)',
      suitability: '3x3 Visualisation',
      desc: 'Standard exhaustive search. State-space heavy.'
    },
    {
      id: 'brute',
      name: 'Pure Brute Force',
      icon: <Cpu size={16} />,
      strategy: 'Naive Iteration',
      complexity: 'O(N^N)',
      suitability: 'Small Data Only',
      desc: 'Naive permutation without pruning.'
    },
    {
      id: 'formula',
      name: 'Direct Formula',
      icon: <Zap size={16} />,
      strategy: 'Mathematical Construction',
      complexity: 'O(N²)',
      suitability: 'Instant Execution',
      desc: 'Fixed patterns like Siamese or Strachey methods.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-emerald-500/10 px-6 py-5 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Info size={20} />
            </div>
            <h4 className="text-sm font-black text-emerald-300 uppercase tracking-widest">Global Algorithm Performance Matrix</h4>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-auto flex-1 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 bg-white/5">
                  <th className="py-5 px-6">Algorithm Engine</th>
                  <th className="py-5 px-6">Strategy</th>

                  <th className="py-5 px-6">Suitability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {algoData.map((algo) => (
                  <tr key={algo.id} className="group hover:bg-emerald-500/10 transition-colors">
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-800 rounded-xl text-emerald-400 border border-white/5 group-hover:border-emerald-500/30 transition-all shrink-0">
                          {algo.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-white uppercase tracking-tight text-sm leading-none">{algo.name}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase mt-1.5 leading-tight">{algo.desc}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6 font-semibold text-slate-300 leading-tight">{algo.strategy}</td>

                    <td className="py-5 px-6 whitespace-nowrap">
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
      </motion.div>
    </div>
  );
};

