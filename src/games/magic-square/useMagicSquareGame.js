import { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audio';

export const useMagicSquareGame = ({ size, mode, steps, speed }) => {
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

  // Initialize
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    resetPractice();
  }, [size, steps, mode]);

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

  // Playback & Logic Loop
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (mode === 'brute') {
        if (!solverRef.current || stats.attempts === 0) {
            startTimeRef.current = performance.now();
            
            // Number-based Backtracking initialization
            // We want to place numbers 1, 2, 3... sequentially.
            // But wait, the user said "Start screen same as learn" where 1 is at Top-Center.
            // Should we respect that?
            // "1번 어디에 놓을 꺼야?" -> "Random". User said "내가 한다는 게 아냐".
            // So for Brute mode, we should probably start from scratch or start with 1 fixed?
            // Let's assume we start from scratch (1 is not fixed) to show full brute force,
            // OR fix 1 at Top-Center to reduce search space (make it look smarter).
            // Let's fix 1 at Top-Center to match the "Start Screen" visual.
            // No, user said "좋은 사각형에 놓는데" (System picks good spot).
            // So we let system pick 1's spot too.
            // But visually, the board starts with 1 at Top-Center.
            // We'll clear the board first thing in the loop.

            solverRef.current = {
                board: Array(size * size).fill(null), 
                currentNum: 1, // Start with placing 1
                stack: [], // Stores { availablePositions: [], triedIndex: -1 } for each number
                backtracking: false
            };
        }
    }

    if (mode === 'learn') {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < steps.length - 1) {
            const next = prev + 1;
            if (steps[next]?.val && isSoundEnabled) audioEngine.playNote(steps[next].val);
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
            setIsPlaying(false);
            setTargetNum(size * size + 999);
            if (isSoundEnabled) audioEngine.playSuccess();
            return;
        }

        // Prepare context for currentNum if needed
        let stackFrame = stack[solver.currentNum];
        if (!stackFrame) {
            // Find all empty cells
            const emptyCells = [];
            for (let i = 0; i < size * size; i++) {
                if (board[i] === null) emptyCells.push(i);
            }
            
            // If "Good square", maybe we can heuristic sort?
            // "너가 좋은 사각형에 놓는데" implies some smarts or randomness.
            // Let's Shuffle for randomness.
            for (let i = emptyCells.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [emptyCells[i], emptyCells[j]] = [emptyCells[j], emptyCells[i]];
            }
            
            stackFrame = { candidates: emptyCells, triedIndex: -1 };
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
  }, [isPlaying, mode, steps, playbackDelay, size, isSoundEnabled]);

  const toggleSound = () => {
    const newState = !isSoundEnabled;
    setIsSoundEnabled(newState);
    audioEngine.setEnabled(newState);
    if (newState) audioEngine.init();
  };

  const handlePracticeClick = (r, c, onSuccess, onError) => {
    if (mode !== 'practice' || practiceBoard[r][c] !== null || targetNum > size * size) return;
    
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
