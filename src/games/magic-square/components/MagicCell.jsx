import React from 'react';
import { cn } from "../../../utils/cn";

export const MagicCell = ({
  v, r, c, size,
  algoMode, mainMode,
  isComplete, isPlaying,
  currentStep, highlight,
  dynamicHighlight,
  onClick,
  cellClasses,
  getFormulaColor
}) => {
  const isDynHighlight = isPlaying && algoMode === 'dynamic' && dynamicHighlight?.r === r && dynamicHighlight?.c === c;
  const isFormulaHighlight = isPlaying && (algoMode === 'formula' || algoMode === 'swing') && highlight?.r === r && highlight?.c === c;
  const highlightType = algoMode === 'dynamic' ? dynamicHighlight?.type : null;
  const isFormula = algoMode === 'formula' || algoMode === 'swing';

  let cellStyle = {};
  if (v && algoMode === 'formula') {
    const bg = getFormulaColor(v, r, c, isComplete);
    cellStyle = {
      backgroundColor: bg,
      borderColor: `hsla(${140 - (Math.pow((r + c) / ((size - 1) * 2), 0.6) * 120)}, 95%, 65%, 0.75)`,
      color: '#fff',
      textShadow: '0 1px 4px rgba(0,0,0,0.6)',
      boxShadow: isFormulaHighlight ? `0 0 30px ${bg}` : 'inset 0 0 10px rgba(0,0,0,0.2)'
    };
  }

  let swingStyle = {};
  const isSwingTarget4 = algoMode === 'swing' && size === 4 && (c === 1 || c === 2);
  const isSwingTarget8 = algoMode === 'swing' && size === 8 && (c === 1 || c === 2 || c === 5 || c === 6);
  
  if (isSwingTarget4 && (currentStep?.type === 'highlight_targets' || currentStep?.type === 'swing_rotating' || isComplete)) {
    const w = 56;
    const g = 8;
    const stride = w + g;
    const offsetX = (1.5 - c) * stride;
    const offsetY = (1.5 - r) * stride;
    const originX = ((w / 2 + offsetX) / w) * 100;
    const originY = ((w / 2 + offsetY) / w) * 100;

    swingStyle = {
      backgroundColor: 'rgba(245, 158, 11, 0.6)',
      borderColor: 'rgb(245, 158, 11)',
      boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)',
      color: '#fff',
      zIndex: 40,
      ...(currentStep?.type === 'swing_rotating' ? {
        transformOrigin: `${originX}% ${originY}%`,
        transform: 'rotate(180deg)',
        transition: 'transform 3.6s cubic-bezier(0.4, 0, 0.2, 1)',
      } : {
        transform: 'none',
        transition: isComplete ? 'none' : 'background-color 1s ease-in-out, border-color 1s ease-in-out, box-shadow 1s ease-in-out'
      })
    };
  }

  if (isSwingTarget8 && (currentStep?.type === 'highlight_targets' || currentStep?.type === 'swing_rotating' || isComplete)) {
    const w = 38;
    const g = 4;
    const stride = w + g;
    const offsetX = (3.5 - c) * stride;
    const offsetY = (3.5 - r) * stride;
    const originX = ((w / 2 + offsetX) / w) * 100;
    const originY = ((w / 2 + offsetY) / w) * 100;

    swingStyle = {
      backgroundColor: 'rgba(245, 158, 11, 0.6)',
      borderColor: 'rgb(245, 158, 11)',
      boxShadow: '0 0 40px rgba(245, 158, 11, 0.4)',
      color: '#fff',
      zIndex: 40,
      ...(currentStep?.type === 'swing_rotating' ? {
        transformOrigin: `${originX}% ${originY}%`,
        transform: 'rotate(180deg)',
        transition: 'transform 3.6s cubic-bezier(0.4, 0, 0.2, 1)',
      } : {
        transform: 'none',
        transition: isComplete ? 'none' : 'background-color 1s ease-in-out, border-color 1s ease-in-out, box-shadow 1s ease-in-out'
      })
    };
  }

  let successColor = "";
  let successBorder = "";
  if (isComplete && algoMode !== 'formula') {
    const isCorner = (r===0 || r===size-1) && (c===0 || c===size-1);
    const isCenter = r === Math.floor(size/2) && c === Math.floor(size/2);
    if (isCorner || isCenter) {
      successBorder = "border-2 border-amber-400/80";
      successColor = "text-white";
    } else if (c === Math.floor(size/2)) {
      successColor = "text-pink-300 bg-pink-900/20";
      successBorder = "border border-pink-500/30";
    } else {
      successColor = "text-sky-300 bg-sky-900/40";
      successBorder = "border border-sky-500/30";
    }
  }

  return (
    <div
      onClick={onClick}
      style={{ ...cellStyle, ...swingStyle }}
      className={cn(
        "flex items-center justify-center rounded-md font-black transition-all relative overflow-hidden",
        cellClasses,
        v ? (+v > 0 ? (isComplete ? "" : "text-emerald-50") : "text-transparent") : "text-transparent",
        isFormula ? "border-2" : (
          !isComplete && v ? "bg-emerald-900/40 border border-emerald-500/20" : (!isComplete && "bg-slate-800/50 border border-slate-700/30")
        ),
        isFormula && !v && !isComplete && "bg-slate-900/60 border-emerald-500/10 border-dashed",
        isComplete && !isFormula && successColor,
        isComplete && !isFormula ? (successBorder || "border border-transparent") : "",
        isFormulaHighlight && mainMode === 'simulation' && "ring-2 ring-white z-20 shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-in zoom-in duration-200",
        
        // Phase 2: Scan (Diagonals vs Others)
        isFormula && currentStep?.type === 'scan' && (
           ((r % 4 === c % 4) || (r % 4 + c % 4 === 3)) 
             ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200"
             : "bg-slate-700/50 border-slate-600/50 text-slate-400"
        ),

        // Phase 3 & 4: Strict Group Pop & Flip
        isFormula && (currentStep?.type === 'pop_prepare' || currentStep?.type === 'mass_invert') && 
        highlight?.targets?.some(t => t.r === r && t.c === c) && (
            cn(
                "z-30 transition-all duration-700 ease-in-out",
                currentStep?.type === 'pop_prepare' ? (
                    cn(
                        "scale-110 shadow-2xl",
                        (highlight?.group === 'top_bottom' ? r === 0 : c === 0) 
                            ? "bg-rose-500/40 border-rose-400 text-rose-100 shadow-rose-500/30" 
                            : "bg-blue-500/40 border-blue-400 text-blue-100 shadow-blue-500/30"
                    )
                ) : "", 
                currentStep?.type === 'mass_invert' ? "scale-100 rotate-y-180 bg-purple-500/50 border-purple-400 text-white shadow-purple-500/40 ring-1 ring-purple-300" : ""  
            )
        ),
        
        // --- Swing Mode Specific Visuals ---
        algoMode === 'swing' && (currentStep?.type === 'swing_prepare' || currentStep?.type === 'swing_done') &&
        highlight?.targets?.some(t => t.r === r && t.c === c) && (
            cn(
                "z-40 transition-all duration-1000 ease-in-out",
                currentStep?.type === 'swing_prepare' ? (
                    "scale-110 shadow-[0_0_30px_rgba(56,189,248,0.6)] border-sky-400 bg-sky-500/40 text-white"
                ) : "",
                currentStep?.type === 'swing_done' ? (
                    "scale-100 rotate-y-180 bg-indigo-500/70 border-indigo-300 text-white shadow-[0_0_40px_rgba(99,102,241,0.7)] ring-2 ring-indigo-400/50"
                ) : ""
            )
        ),
        
        algoMode === 'swing' && currentStep?.type === 'scan_swing' && (
             highlight?.targets?.some(t => t.r === r && t.c === c)
               ? "ring-2 ring-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.3)] bg-sky-900/60 text-sky-100 z-10"
               : "opacity-30 grayscale-[0.8]"
        ),
        algoMode === 'swing' && currentStep?.type === 'highlight_targets' &&
        highlight?.targets?.some(t => t.r === r && t.c === c) && (
            "bg-blue-600 text-white z-10"
        ),

        // 6x6 Highlight Quadrant
        algoMode === 'swing' && size === 6 && currentStep?.type === 'highlight_quadrant' &&
        highlight?.targets?.some(t => t.r === r && t.c === c) && (
            "bg-blue-500/20 border-blue-400/50 ring-1 ring-blue-400/30 z-10"
        ),
        
        isFormula && currentStep?.type === 'invert' && isFormulaHighlight && "bg-purple-500/40 border-purple-400 ring-1 ring-purple-400 animate-pulse text-white",
        
        // --- Swap Visualization (Two Colors Swapping) ---
        // 1. Prepare: Source = Amber, Target = Cyan
        (currentStep?.type === 'swap_highlight') && (
            (highlight?.r === r && highlight?.c === c) ? 
                "bg-amber-600 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-110 z-50 ring-2 ring-white" :
            (highlight?.targets?.[0]?.r === r && highlight?.targets?.[0]?.c === c) ?
                "bg-cyan-600 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-110 z-50 ring-2 ring-white" : ""
        ),

        // 2. Done: Source becomes Cyan, Target becomes Amber (Simulating value/color move)
        (currentStep?.type === 'swap') && (
            (highlight?.r === r && highlight?.c === c) ? 
                "bg-cyan-600 border-cyan-400 text-white scale-100 z-50 transition-colors duration-700" :
            (highlight?.targets?.[0]?.r === r && highlight?.targets?.[0]?.c === c) ?
                "bg-amber-600 border-amber-400 text-white scale-100 z-50 transition-colors duration-700" : ""
        ),
        // ------------------------------------------------

        isDynHighlight && highlightType === 'active' && "ring-2 ring-amber-400 bg-amber-900/40 z-10 scale-105",
        isDynHighlight && highlightType === 'forced' && "ring-2 ring-purple-400 bg-purple-900/60 z-10 scale-110 shadow-lg shadow-purple-500/40",
        isDynHighlight && highlightType === 'backtrack' && "ring-2 ring-rose-500 bg-rose-500/30 z-10 animate-pulse"
      )}
    >
      {v}
      {isDynHighlight && highlightType === 'forced' && (
        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" />
      )}
      {isDynHighlight && highlightType === 'backtrack' && (
        <div className="absolute inset-0 bg-rose-500/20 animate-pulse" />
      )}
    </div>
  );
};
