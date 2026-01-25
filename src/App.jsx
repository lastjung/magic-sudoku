import React, { useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import MagicSquareBoard from './games/magic-square/Board';
import SudokuBoard from './games/sudoku/Board';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeTab, setActiveTab] = useState('magic'); // 'magic', 'sudoku'

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30 pb-20 font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(67,56,202,0.1),transparent)] pointer-events-none" />
      
      <ControlPanel 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="relative container mx-auto px-4 py-8 mt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'magic' && (
            <motion.div
              key="magic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <MagicSquareBoard />
            </motion.div>
          )}

          {activeTab === 'sudoku' && (
            <motion.div
              key="sudoku"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <SudokuBoard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="mt-12 py-12 border-t border-white/5 text-center relative z-10">
        <p className="text-slate-500 text-xs font-medium tracking-widest uppercase">
          Magic Sudoku • Logic & Visualization Platform
        </p>
      </footer>
    </div>
  );
}

export default App;
