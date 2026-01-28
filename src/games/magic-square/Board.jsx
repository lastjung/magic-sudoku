import React, { useState, useMemo, useEffect } from 'react';
import { MagicSquareCard } from './MagicSquareCard';
import { generateMagicSquareSteps } from './logic';
import { Info, BookOpen, RotateCcw, LayoutGrid, Zap, Sliders, Play, Check, BrainCircuit, Square, GraduationCap } from 'lucide-react';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { useMagicSquareGame } from './useMagicSquareGame';
import { MagicMobileControlBar } from './MagicMobileControlBar';
import { MagicScoreboard } from './MagicScoreboard';
import { MagicAlgoTable } from './MagicAlgoTable';
import { MagicControlCard } from './components/MagicControlCard';
import { ScoreCard } from './components/ScoreCard';

const ALL_SIZES = [3, 4, 5, 6, 7, 8, 9, 10];

const SIMULATION_ALGOS = [
  { id: 'formula', label: 'Formula', icon: BookOpen },
  { id: 'swing', label: 'Swing', icon: RotateCcw },
  { id: 'dynamic', label: 'CSP Solver', icon: BrainCircuit },
  { id: 'heuristic', label: 'Smart BT', icon: LayoutGrid },
  { id: 'metric', label: 'Metric BT', icon: Zap },
  { id: 'backtrack', label: 'Recursive', icon: RotateCcw },
  { id: 'brute', label: 'Brute Force', icon: Sliders },
];

export default function MagicSquareBoard({ speed }) {
  const [selectedSize, setSelectedSize] = useState(8);
  const [selectedAlgos, setSelectedAlgos] = useState(new Set(['swing']));
  const [mainMode, setMainMode] = useState('simulation');
  const [triggerRun, setTriggerRun] = useState(0);
  const [triggerReset, setTriggerReset] = useState(0);
  const [runningAlgos, setRunningAlgos] = useState(new Set());
  
  // Custom Live Stats to sync ScoreCards
  const [liveStats, setLiveStats] = useState({});

  // Scoreboard state
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [scoreboardResults, setScoreboardResults] = useState([]);
  const resultsRef = React.useRef({});
  const runningSetRef = React.useRef(new Set());

  // Table state
  const [showAlgoTable, setShowAlgoTable] = useState(false);

  const toggleAlgo = (id) => {
    setSelectedAlgos(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllAlgos = () => {
    const allIds = SIMULATION_ALGOS.map(a => a.id);
    if (selectedAlgos.size === allIds.length) {
        setSelectedAlgos(new Set());
    } else {
        setSelectedAlgos(new Set(allIds));
    }
  };

  const stepsData = useMemo(() => {
    return {
      dynamic: generateMagicSquareSteps(selectedSize, 'dynamic'),
      heuristic: generateMagicSquareSteps(selectedSize, 'heuristic'),
      metric: generateMagicSquareSteps(selectedSize, 'metric'),
      backtrack: generateMagicSquareSteps(selectedSize, 'backtrack'),
      brute: generateMagicSquareSteps(selectedSize, 'brute'),
      formula: generateMagicSquareSteps(selectedSize, 'formula'),
      swing: generateMagicSquareSteps(selectedSize, 'swing')
    };
  }, [selectedSize]);

  const handleRunAll = () => {
    resultsRef.current = {};
    runningSetRef.current = new Set(selectedAlgos);
    setRunningAlgos(new Set(selectedAlgos));
    setLiveStats({}); // Reset live stats on run
    setShowScoreboard(false);
    setTriggerRun(prev => prev + 1);
  };

  const handleResetAll = () => {
    runningSetRef.current = new Set();
    setRunningAlgos(new Set());
    setLiveStats({}); // Reset live stats on reset
    setShowScoreboard(false);
    setTriggerReset(prev => prev + 1);
  };

  // Callback to receive live updates from child components
  const handleStatsUpdate = (algoId, { stats, isRunning, isDone }) => {
    setLiveStats(prev => ({
        ...prev,
        [algoId]: { stats, isRunning, isDone }
    }));

    if (isDone) {
        handleAlgoComplete(algoId, stats);
    }
  };

  const handleAlgoComplete = (algoId, stats) => {
    if (mainMode !== 'simulation') return;
    
    const labels = {
      dynamic: { name: 'Heuristic CSP' },
      heuristic: { name: 'Smart Backtrack' },
      metric: { name: 'Metric Backtrack' },
      backtrack: { name: 'Recursive Backtrack' },
      brute: { name: 'Pure Brute Force' },
      formula: { name: 'Direct Formula' },
      swing: { name: 'Formula Swing' }
    };

    if (runningSetRef.current.has(algoId)) {
        resultsRef.current[algoId] = {
            id: algoId,
            name: labels[algoId]?.name || algoId,
            attempts: stats.attempts,
            time: stats.time,
            complexity: labels[algoId]?.complexity
        };
        runningSetRef.current.delete(algoId);
        
        setRunningAlgos(prev => {
            const next = new Set(prev);
            next.delete(algoId);
            return next;
        });

        if (runningSetRef.current.size === 0 && Object.keys(resultsRef.current).length > 0) {
            setScoreboardResults(Object.values(resultsRef.current));
            // setShowScoreboard(true); // Temporarily disabled by user request
        }
    }
  };

   const ALGO_ORDER = ['formula', 'dynamic', 'heuristic', 'metric', 'backtrack', 'brute', 'swing'];
   const activeAlgos = [...selectedAlgos].sort((a, b) => ALGO_ORDER.indexOf(a) - ALGO_ORDER.indexOf(b));
   
   const renderItems = [];
   if (mainMode === 'simulation') {
     activeAlgos.forEach((algoId) => {
       renderItems.push({ type: 'board', algoId });
     });
  } else {
    renderItems.push({ type: 'board', algoId: 'formula' });
  }

  const insertIdx = Math.min(2, renderItems.length);
  renderItems.splice(insertIdx, 0, { type: 'control' });

  return (
    <div className="max-w-7xl mx-auto px-6 pt-0 pb-28 lg:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderItems.map((item, index) => (
            item.type === 'control' ? (
                <div key="control-wrapper" className="hidden lg:block">
                  <MagicControlCard 
                      selectedSize={selectedSize}
                      setSelectedSize={setSelectedSize}
                      selectedAlgos={selectedAlgos}
                      toggleAlgo={toggleAlgo}
                      toggleAllAlgos={toggleAllAlgos}
                      mainMode={mainMode}
                      setMainMode={setMainMode}
                      onRunAll={handleRunAll}
                      onResetAll={handleResetAll}
                      isRunningAny={runningAlgos.size > 0}
                      showAlgoTable={showAlgoTable}
                      setShowAlgoTable={setShowAlgoTable}
                      simulationAlgos={SIMULATION_ALGOS}
                      ALL_SIZES={ALL_SIZES}
                  />
                </div>
            ) : (
                <MagicSquareCard 
                    key={`${selectedSize}-${item.algoId}-${triggerReset}-${index}`}
                    size={selectedSize}
                    mainMode={mainMode}
                    algoMode={item.algoId}
                    steps={stepsData[item.algoId] || []}
                    speed={speed}
                    triggerRun={triggerRun}
                    triggerReset={triggerReset}
                    onStatsUpdate={(update) => handleStatsUpdate(item.algoId, update)}
                />
            )
        ))}
      </div>

      {/* Comparison Scoreboard - Syncs directly with MagicSquareCard state via liveStats */}
      {mainMode === 'simulation' && activeAlgos.length > 0 && (
          <div className="hidden md:block mt-8 overflow-hidden bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl">
              <div className="bg-slate-900/50 px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                          <Sliders size={20} />
                      </div>
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">Real-time Performance Analysis</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE RANKING
                  </div>
              </div>
              <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeAlgos.map((algoId) => {
                           const currentStats = liveStats[algoId] || { stats: { attempts: 0, time: 0 }, isRunning: false, isDone: false };
                           return (
                                <ScoreCard 
                                 key={`score-${algoId}`} 
                                 algoId={algoId} 
                                 size={selectedSize}
                                 stats={currentStats.stats}
                                 isRunning={currentStats.isRunning}
                                 isDone={currentStats.isDone}
                               />
                           );
                      })}
                  </div>
              </div>
          </div>
      )}

      {mainMode !== 'simulation' && (
          <div className="mt-12 flex flex-col gap-6">
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
                  <div className="p-5 bg-emerald-500/20 rounded-2xl text-emerald-300 shadow-xl shadow-emerald-500/10">
                      <GraduationCap size={40} />
                  </div>
                  <div className="text-center md:text-left flex-1">
                      <h4 className="text-emerald-300 font-black text-xl mb-2 uppercase tracking-widest">Algorithm Comparison Lab</h4>
                      <p className="text-emerald-100/60 text-sm leading-relaxed max-w-2xl font-semibold">
                          In LAB mode, observe how various logic engines operate within the same <span className="text-emerald-400">{selectedSize}x{selectedSize}</span> environment.
                          <br className="hidden md:block" />
                          Compare the efficiency of each algorithm in real-time, from the intuitive Direct Formula to complex Backtracking.
                      </p>
                  </div>
              </div>
          </div>
      )}

      <AnimatePresence>
        {showAlgoTable && (
          <MagicAlgoTable onClose={() => setShowAlgoTable(false)} />
        )}
      </AnimatePresence>

      <MagicMobileControlBar 
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          selectedAlgos={selectedAlgos}
          toggleAlgo={toggleAlgo}
          toggleAllAlgos={toggleAllAlgos}
          onRunAll={handleRunAll}
          onResetAll={handleResetAll}
          isRunningAny={runningAlgos.size > 0}
          mainMode={mainMode}
          setMainMode={setMainMode}
          showAlgoTable={showAlgoTable}
          setShowAlgoTable={setShowAlgoTable}
      />

      {showScoreboard && (
          <MagicScoreboard 
            results={scoreboardResults}
            onClose={() => setShowScoreboard(false)}
          />
      )}
    </div>
  );
}
