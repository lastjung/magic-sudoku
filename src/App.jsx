import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Dashboard } from './components/Dashboard';
import MagicSquareBoard from './games/magic-square/Board';
import SudokuBoard from './games/sudoku/Board';
import { generateRandomArray } from './utils/data';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('magic'); // 'sorting', 'magic', 'sudoku'
  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(800);
  const [data, setData] = useState(() => generateRandomArray(50));

  const randomize = useCallback(() => {
    setData(generateRandomArray(arraySize));
  }, [arraySize]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30 pb-20 font-sans">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(67,56,202,0.1),transparent)] pointer-events-none" />
      
      <ControlPanel 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        arraySize={arraySize}
        setArraySize={setArraySize}
        speed={speed}
        setSpeed={setSpeed}
        onRandomize={randomize}
      />

      <main className="relative container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'sorting' && (
            <motion.div
              key="sorting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard 
                data={data} 
                speed={speed} 
                setSpeed={setSpeed}
                arraySize={arraySize}
                setArraySize={setArraySize}
                onRandomize={randomize} 
              />
            </motion.div>
          )}

          {activeTab === 'magic' && (
            <motion.div
              key="magic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <MagicSquareBoard speed={speed} />
            </motion.div>
          )}

          {activeTab === 'sudoku' && (
            <motion.div
              key="sudoku"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <SudokuBoard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="mt-12 py-12 border-t border-white/5 text-center relative z-10">
        <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">
          Logic & Algorithms Platform • Magic Sudoku Pro
        </p>
      </footer>
    </div>
  );
}

export default App;
