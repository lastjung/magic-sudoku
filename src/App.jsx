import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { ControlPanel } from './components/ControlPanel';
import { generateRandomArray } from './utils/data';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = React.lazy(() => import('./components/Dashboard'));
const MagicSquareBoard = React.lazy(() => import('./games/magic-square/Board'));
const SudokuBoard = React.lazy(() => import('./games/sudoku/Board'));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center p-20">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
    />
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('magic'); // 'sorting', 'magic', 'sudoku'
  const location = useLocation();
  const navigate = useNavigate();

  // Sync tab with URL on mount and location changes
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (['sorting', 'magic', 'sudoku'].includes(path)) {
      setActiveTab(path);
    } else if (location.pathname === '/' || location.pathname === '') {
      navigate('/magic', { replace: true });
    }
  }, [location, navigate]);

  const handleTabChange = useCallback((tabId) => {
    navigate(`/${tabId}`);
  }, [navigate]);

  const [arraySize, setArraySize] = useState(50);
  const [speed, setSpeed] = useState(800);
  const [data, setData] = useState(() => generateRandomArray(50));

  const randomize = useCallback(() => {
    setData(generateRandomArray(arraySize));
  }, [arraySize]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500/30 pb-20 font-sans overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(67,56,202,0.1),transparent)] pointer-events-none" />
      
      <ControlPanel 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        arraySize={arraySize}
        setArraySize={setArraySize}
        speed={speed}
        setSpeed={setSpeed}
        onRandomize={randomize}
      />

      <main className="relative max-w-7xl mx-auto px-6 pt-6 pb-8">
        <React.Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/sorting" element={
                <motion.div
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
              } />

              <Route path="/magic" element={
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <MagicSquareBoard speed={speed} />
                </motion.div>
              } />

              <Route path="/sudoku" element={
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="w-full"
                >
                  <SudokuBoard />
                </motion.div>
              } />

              <Route path="/" element={<Navigate to="/magic" replace />} />
            </Routes>
          </AnimatePresence>
        </React.Suspense>
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
