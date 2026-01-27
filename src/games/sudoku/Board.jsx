import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { generateSudoku } from './logic';
import { cn } from '../../utils/cn';
import { SudokuControlCard } from './SudokuControlCard';
import SudokuCard from './SudokuCard';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function SudokuBoard() {
  const [selectedSize, setSelectedSize] = useState(9);
  const [difficulty, setDifficulty] = useState('hard');
  const [mainMode, setMainMode] = useState('simulation'); // 'simulation', 'practice'
  
  // Simulation State
  const [selectedAlgos, setSelectedAlgos] = useState(new Set(['backtrack', 'naked', 'dynamic']));
  
  // Triggers for child components
  const [triggerRun, setTriggerRun] = useState(0);
  const [triggerReset, setTriggerReset] = useState(0);

  // Central Game State (The Puzzle)
  const [game, setGame] = useState(() => {
    return generateSudoku('hard', 9);
  });

  const startNewGame = useCallback(() => {
    const newGame = generateSudoku(difficulty, selectedSize);
    setGame(newGame);
    setTriggerReset(prev => prev + 1);
  }, [difficulty, selectedSize]);

  // Restart when config changes (size/difficulty)
  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const toggleAlgo = (id) => {
    setSelectedAlgos(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const toggleAllAlgos = () => {
    const allIds = ['backtrack', 'naked', 'dynamic'];
    if (selectedAlgos.size === allIds.length) {
        setSelectedAlgos(new Set());
    } else {
        setSelectedAlgos(new Set(allIds));
    }
  };

  const handleRunSimulation = () => {
      setTriggerRun(prev => prev + 1);
  };

  const handleResetSimulation = () => {
    setTriggerReset(prev => prev + 1);
};

  // Prepare Render Items
  const ALGO_ORDER = ['dynamic', 'naked', 'backtrack'];
  
  const activeAlgos = useMemo(() => {
    return Array.from(selectedAlgos).sort((a, b) => ALGO_ORDER.indexOf(a) - ALGO_ORDER.indexOf(b));
  }, [selectedAlgos]);

  const renderItems = useMemo(() => {
    const items = [];
    if (mainMode === 'simulation') {
      const algosToShow = activeAlgos.length > 0 ? activeAlgos : ['backtrack'];
      algosToShow.forEach(algoId => {
        items.push({ type: 'board', algoId });
      });
    } else {
      items.push({ type: 'board', algoId: 'practice' });
    }
    
    // Insert control card at index 2 (optimal for 3x3) or at the end
    const insertIdx = Math.min(2, items.length);
    items.splice(insertIdx, 0, { type: 'control' });
    return items;
  }, [mainMode, activeAlgos]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {renderItems.map((item, idx) => {
          if (item.type === 'board') {
            const isPractice = item.algoId === 'practice';
            return (
              <ErrorBoundary key={`board-${item.algoId}-${idx}`} onReset={startNewGame}>
                <SudokuCard 
                  size={selectedSize}
                  mainMode={mainMode}
                  initialBoard={game.initial}
                  solution={game.solution}
                  algoId={isPractice ? 'backtrack' : item.algoId}
                  speed={100}
                  triggerRun={triggerRun}
                  triggerReset={triggerReset}
                  onReset={startNewGame}
                  onComplete={() => {}}
                />
              </ErrorBoundary>
            );
          }

          if (item.type === 'control') {
            return (
              <div key="lab-control-panel" className="h-full">
                <SudokuControlCard 
                  selectedSize={selectedSize}
                  setSelectedSize={setSelectedSize}
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                  mainMode={mainMode}
                  setMainMode={setMainMode}
                  selectedAlgos={selectedAlgos}
                  toggleAlgo={toggleAlgo}
                  toggleAllAlgos={toggleAllAlgos}
                  onRun={handleRunSimulation} 
                  onReset={handleResetSimulation} 
                  onNewGame={startNewGame}
                  isRunning={false} 
                />
                
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}


