import { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audio';

export const useMagicSquareGame = ({ size, mainMode, algoMode, steps, speed }) => {
  // Map our new mode structure to internal simplified logic if needed
  const mode = mainMode === 'simulation' ? (algoMode === 'formula' ? 'learn' : 'brute') : 'practice';
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceBoard, setPracticeBoard] = useState([]);
  const [targetNum, setTargetNum] = useState(2);
  const [lastCorrectPos, setLastCorrectPos] = useState({ r: 0, c: Math.floor(size/2) });
  const [feedback, setFeedback] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(audioEngine.enabled);
  
  const timerRef = useRef(null);
  const playbackDelay = Math.max(50, 1050 - speed);

  const [stats, setStats] = useState({ attempts: 0, time: 0 });
  const startTimeRef = useRef(0);
  
  // Backtracking Solver State
  const solverRef = useRef(null);

  const resetPractice = () => {
    const initialBoard = Array.from({ length: size }, () => Array(size).fill(null));
    const startRow = 0;
    const startCol = Math.floor(size / 2);
    initialBoard[startRow][startCol] = 1;

    setPracticeBoard(initialBoard);
    setTargetNum(2);
    setLastCorrectPos({ r: startRow, c: startCol });
    setFeedback(null);
    setStats({ attempts: 0, time: 0 });
    solverRef.current = null;
  };

  // Initialize
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    resetPractice();
  }, [size, steps, mainMode, algoMode]);

  // Playback & Logic Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (!solverRef.current || stats.attempts === 0) {
        startTimeRef.current = performance.now();
        if (mode === 'brute') {
            solverRef.current = {
                board: Array(size * size).fill(null), 
                currentNum: 1, 
                stack: [], 
                backtracking: false
            };
        } else {
            solverRef.current = { type: 'learn' };
        }
    }

    if (mode === 'learn') {
      timerRef.current = setInterval(() => {
        const now = performance.now();
        const elapsed = Math.floor(now - startTimeRef.current);
        setStats(prev => ({ ...prev, time: elapsed }));

        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            const next = prev + 1;
            const nextStep = steps[next];
            if (nextStep?.val && isSoundEnabled) audioEngine.playNote(nextStep.val);
            
            // Update practiceBoard to sync with steps board
            if (nextStep?.board) setPracticeBoard(nextStep.board);
            setStats(s => ({ ...s, attempts: next }));
            
            return next;
          }
          setIsPlaying(false);
          return prev;
        });
      }, playbackDelay);
    } else if (mode === 'brute') {
      const magicConst = (size * (size * size + 1)) / 2;

      timerRef.current = setInterval(() => {
        const now = performance.now();
        const elapsed = Math.floor(now - startTimeRef.current);
        setStats(prev => ({ ...prev, time: elapsed }));

        const solver = solverRef.current;
        if (!solver) return;

        const { board, stack } = solver;

        // If we successfully placed up to N^2:
        if (solver.currentNum > size * size) {
            // Brute Force needs a final check since it doesn't prune
            let isFinalValid = true;
            if (algoMode === 'brute') {
                // Check all sums
                for (let i = 0; i < size; i++) {
                    let rS = 0, cS = 0;
                    for (let j = 0; j < size; j++) {
                        rS += board[i * size + j];
                        cS += board[j * size + i];
                    }
                    if (rS !== magicConst || cS !== magicConst) isFinalValid = false;
                }
                let d1 = 0, d2 = 0;
                for (let i = 0; i < size; i++) {
                    d1 += board[i * size + i];
                    d2 += board[i * size + (size - 1 - i)];
                }
                if (d1 !== magicConst || d2 !== magicConst) isFinalValid = false;
            }

            if (isFinalValid) {
                setIsPlaying(false);
                setTargetNum(size * size + 999);
                if (isSoundEnabled) audioEngine.playSuccess();
                return;
            } else {
                // Brute force failed, backtrack from the end
                solver.currentNum = size * size;
                // fall through to backtracking logic
            }
        }

        // Prepare context for currentNum if needed
        let stackFrame = stack[solver.currentNum];
        if (!stackFrame) {
            let candidates = [];
            
            // Special Rule: For number '1', restrict positions to [1, 2, 5] as requested
            if (solver.currentNum === 1) {
                // Indices 1, 2, 5 (0-based)
                // 1=(0,1), 2=(0,2), 5=(1,2)
                const startCandidates = [1, 2, 5];
                // Filter out any that might be occupied (though for 1, board is empty)
                candidates = startCandidates.filter(idx => idx < size * size && board[idx] === null);
            } else {
                // For other numbers, try all empty cells
                for (let i = 0; i < size * size; i++) {
                    if (board[i] === null) candidates.push(i);
                }
            }
            
            // Randomize candidates
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
            }
            
            stackFrame = { candidates, triedIndex: -1 };
            stack[solver.currentNum] = stackFrame;
        }

        stackFrame.triedIndex++; // Try next candidate position

        // If no more positions to try for this number, Backtrack
        if (stackFrame.triedIndex >= stackFrame.candidates.length) {
            stack[solver.currentNum] = null; // Clear frame
            solver.currentNum--; // Go back to prev number
            
            if (solver.currentNum < 1) {
                // Impossible (shouldn't happen for 3x3 if we start blank)
                setIsPlaying(false);
                return;
            }
            
            // Remove prev number from board
            // Find where prev number was
            // Actually we don't store pos in stack explicitly but we can find it
            // Or we should have stored it. 
            // In number-based backtracking, we need to know where we put currentNum to clear it.
            // Let's assume board has it.
            const prevIndex = board.indexOf(solver.currentNum);
            if (prevIndex !== -1) board[prevIndex] = null;
            
            if (isSoundEnabled && Math.random() > 0.8) audioEngine.playNote(solver.currentNum); 
            setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));

        } else {
            // Try placing currentNum at candidate position
            const pos = stackFrame.candidates[stackFrame.triedIndex];
            board[pos] = solver.currentNum;

            // --- Validation / Pruning ---
            const r = Math.floor(pos / size);
            const c = pos % size;
            let isValid = true;
            
            // Check Row
            let rowSum = 0, rowFilled = 0;
            for (let cc = 0; cc < size; cc++) {
                const val = board[r * size + cc];
                if (val !== null) { rowSum += val; rowFilled++; }
            }
            if (rowSum > magicConst) isValid = false;
            // Strict check only if row is FULL
            if (isValid && rowFilled === size && rowSum !== magicConst) isValid = false;

            // Check Col
            if (isValid) {
                let colSum = 0, colFilled = 0;
                for (let rr = 0; rr < size; rr++) {
                    const val = board[rr * size + c];
                    if (val !== null) { colSum += val; colFilled++; }
                }
                if (colSum > magicConst) isValid = false;
                if (isValid && colFilled === size && colSum !== magicConst) isValid = false;
            }

            // Check Diagonals (Smart BT and Heuristic only)
            if (isValid && (algoMode === 'smart' || algoMode === 'heuristic')) {
                // Main Diagonal
                if (r === c) {
                    let d1Sum = 0, d1Filled = 0;
                    for (let i = 0; i < size; i++) {
                        const val = board[i * size + i];
                        if (val !== null) { d1Sum += val; d1Filled++; }
                    }
                    if (d1Sum > magicConst) isValid = false;
                    if (isValid && d1Filled === size && d1Sum !== magicConst) isValid = false;
                }
                // Anti Diagonal
                if (isValid && (r + c === size - 1)) {
                    let d2Sum = 0, d2Filled = 0;
                    for (let i = 0; i < size; i++) {
                        const val = board[i * size + (size - 1 - i)];
                        if (val !== null) { d2Sum += val; d2Filled++; }
                    }
                    if (d2Sum > magicConst) isValid = false;
                    if (isValid && d2Filled === size && d2Sum !== magicConst) isValid = false;
                }
            }

            // Pure Brute Force: NO PRUNING (except for total constant at the very end)
            if (algoMode === 'brute') {
                isValid = true; // Always try to place
                if (solver.currentNum === size * size) {
                   // Only check validity at the very last step
                   // (Actually checking all rows/cols/diags)
                   // We'll trust the success check above (currentNum > size*size) 
                   // but we need to ensure it's a valid magic square.
                   // So for pure brute force, we just let it fill and check at 103.
                }
            }

            if (isValid) {
                // Success! Move to next number
                // Silent on every step to avoid noise, only play rarely
                if (isSoundEnabled && Math.random() > 0.99) audioEngine.playNote(solver.currentNum);
                solver.currentNum++;
            } else {
                // Invalid placement
                board[pos] = null;
                setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
            }
        }

        // Update UI
        const newBoard2D = [];
        for (let r = 0; r < size; r++) newBoard2D.push(board.slice(r * size, (r + 1) * size));
        setPracticeBoard(newBoard2D);

      }, Math.max(5, playbackDelay / 10)); 
    }

    return () => clearInterval(timerRef.current);
  }, [isPlaying, mainMode, algoMode, mode, steps, playbackDelay, size, isSoundEnabled]);

  const toggleSound = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    audioEngine.setEnabled(newState);
    if (newState) audioEngine.init();
  };

  const handlePracticeClick = (r, c, onSuccess, onError) => {
    if (mainMode !== 'practice' || practiceBoard[r][c] !== null || targetNum > size * size) return;
    
    const correctStep = steps.find(s => s.val === targetNum);
    const correctPos = correctStep?.highlight;

    if (correctPos && correctPos.r === r && correctPos.c === c) {
      const newBoard = practiceBoard.map(row => [...row]);
      newBoard[r][c] = targetNum;
      setPracticeBoard(newBoard);
      setLastCorrectPos({ r, c });
      setTargetNum(prev => prev + 1);
      if (isSoundEnabled) audioEngine.playNote(targetNum);
      if (onSuccess) onSuccess(correctStep);
    } else {
      if (onError) onError();
    }
  };

  return {
    currentStepIndex,
    setCurrentStepIndex,
    isPlaying,
    setIsPlaying,
    practiceBoard,
    targetNum,
    feedback,
    setFeedback,
    isSoundEnabled,
    toggleSound,
    resetPractice,
    handlePracticeClick,
    lastCorrectPos,
    stats
  };
};
