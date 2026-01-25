import React, { useState } from 'react';
import { LayoutGrid, Grid3x3, Info } from 'lucide-react';
import { cn } from '../utils/cn';

export const ControlPanel = ({ 
  activeTab, 
  onTabChange
}) => {
  const tabs = [
    { id: 'magic', label: 'Magic', icon: Grid3x3 },
    { id: 'sudoku', label: 'Sudoku', icon: LayoutGrid },
  ];

  return (
    <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Logo & Tabs */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg shadow-lg transition-colors duration-500",
              activeTab === 'magic' ? "bg-emerald-600 shadow-emerald-500/20" :
              "bg-rose-600 shadow-rose-500/20"
            )}>
              <LayoutGrid className="text-white" size={20} />
            </div>
            <span className="hidden sm:block font-bold text-lg bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent whitespace-nowrap">
              Magic Sudoku
            </span>
          </div>

          {/* Segmented Control Tabs */}
          <div className="flex p-1 bg-slate-800 rounded-lg border border-white/5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              // Dynamic color classes based on tab ID
              const activeClass = 
                tab.id === 'magic' ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" :
                "bg-rose-600 text-white shadow-md shadow-rose-500/20";

              const hoverClass = 
                tab.id === 'magic' ? "hover:text-emerald-200" :
                "hover:text-rose-200";

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
                    isActive ? activeClass : `text-slate-400 hover:bg-white/5 ${hoverClass}`
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Utility Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="flex items-center gap-2">
                {/* Info / About */}
                <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-white/5 transition-colors">
                   <Info size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
