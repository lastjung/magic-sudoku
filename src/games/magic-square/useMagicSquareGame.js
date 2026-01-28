import { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audio';

export const useMagicSquareGame = ({ size, mainMode, algoMode, steps, speed, triggerRun = 0, triggerReset = 0, onComplete }) => {
  const mode = mainMode === 'simulation' 
    ? (algoMode === 'formula' || algoMode === 'swing' ? 'learn' : (algoMode === 'dynamic' ? 'dynamic' : 'brute')) 
    : 'practice';
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [practiceBoard, setPracticeBoard] = useState([]);
  const [targetNum, setTargetNum] = useState(1);
  const [lastCorrectPos, setLastCorrectPos] = useState({ r: 0, c: 0 });
  const [feedback, setFeedback] = useState(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(audioEngine.enabled);
  
  const timerRef = useRef(null);
  const baseDelay = Math.max(50, 1050 - speed);
  const playbackDelay = baseDelay;

  const [stats, setStats] = useState({ attempts: 0, time: 0 });
  const [dynamicDesc, setDynamicDesc] = useState("");
  const [dynamicHighlight, setDynamicHighlight] = useState(null); // { r, c, type: 'active' | 'forced' | 'backtrack' }
  const startTimeRef = useRef(0);
  
  const solverRef = useRef(null);

  const resetPractice = () => {
    let initialBoard = Array.from({ length: size }, () => Array(size).fill(null));
    
    // Formula Swing: Instant 1-16 fill for 4x4 (ZigZag)
    if (algoMode === 'swing' && size === 4) {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (r % 2 === 0) {
            initialBoard[r][c] = (r * 4) + c + 1;
          } else {
            initialBoard[r][c] = (r * 4) + (4 - 1 - c) + 1;
          }
        }
      }
      setTargetNum(17);
    } else {
      setTargetNum(1);
    }

    setPracticeBoard(initialBoard);
    setLastCorrectPos({ r: 0, c: 0 });
    setFeedback(null);
    setStats({ attempts: 0, time: 0 });
    setDynamicDesc("");
    setDynamicHighlight(null);
    solverRef.current = null;
    setCurrentStepIndex(0);
  };

  useEffect(() => {
    setIsPlaying(false);
    resetPractice();
  }, [size, steps, mainMode, algoMode]);

  const lastTriggerRun = useRef(0);
  useEffect(() => {
    if (triggerRun > lastTriggerRun.current) {
        lastTriggerRun.current = triggerRun;
        setIsPlaying(true);
        // Resume audio context on user action
        audioEngine.init();
    }
  }, [triggerRun]);

  const lastTriggerReset = useRef(0);
  useEffect(() => {
    if (triggerReset > lastTriggerReset.current) {
        lastTriggerReset.current = triggerReset;
        setIsPlaying(false);
        resetPractice();
    }
  }, [triggerReset]);

  const getMagicConstant = (n) => (n * (n * n + 1)) / 2;

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (!solverRef.current || stats.attempts === 0) {
        startTimeRef.current = performance.now();
        if (algoMode === 'heuristic') {
            solverRef.current = {
                flatBoard: Array(size * size).fill(null),
                used: Array(size * size + 1).fill(false),
                stack: [],
                filledCount: 0,
                firstNumberPositions: [],
                firstPosIdx: -1
            };
        } else if (mode === 'brute' || algoMode === 'backtrack' || algoMode === 'metric') {
            solverRef.current = {
                board: Array(size * size).fill(null), 
                currentNum: 1, stack: [], backtracking: false
            };
        } else if (mode === 'dynamic') {
            solverRef.current = {
                flatBoard: Array(size * size).fill(null),
                used: Array(size * size + 1).fill(false),
                stack: [],
                filledCount: 0,
                firstNumberPositions: [],
                firstPosIdx: -1
            };
        } else {
            solverRef.current = { type: 'learn' };
        }
    }

    if (mode === 'learn' && isPlaying) {
      const runLearnLoop = async () => {
        let currentIndex = currentStepIndex;
        
        while (isPlaying && currentIndex < steps.length - 1) {
          const now = performance.now();
          const elapsed = Math.floor(now - startTimeRef.current);
          setStats(prev => ({ ...prev, time: elapsed }));

          // Dynamic Delay based on Step Type
          let delay = playbackDelay;
          if (steps[currentIndex]?.type === 'swing_rotating') delay = 4000;
          if (steps[currentIndex]?.type === 'highlight_targets') delay = 1000;
          
          await new Promise(resolve => {
            timerRef.current = setTimeout(resolve, delay);
          });

          if (!isPlaying) break;

          currentIndex++;
          const nextStep = steps[currentIndex];
          setCurrentStepIndex(currentIndex);
          
          if (nextStep?.val && isSoundEnabled) audioEngine.playNote(nextStep.val);
          if (nextStep?.board) setPracticeBoard(nextStep.board);
          setStats(s => ({ ...s, attempts: currentIndex }));
        }

        if (currentIndex >= steps.length - 1) {
          setIsPlaying(false);
          setTargetNum(size * size + 1); // Mark as complete to keep the board showing
          const totalTime = Math.floor(performance.now() - startTimeRef.current);
          if (onComplete) onComplete({ time: totalTime, attempts: steps.length });
        }
      };

      runLearnLoop();
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    } else if (mode === 'brute') {
      const magicConst = getMagicConstant(size);
      timerRef.current = setInterval(() => {
        const now = performance.now();
        const elapsed = Math.floor(now - startTimeRef.current);
        setStats(prev => ({ ...prev, time: elapsed }));

        const solver = solverRef.current;
        if (!solver) return;

        // --- 3. Smart Backtrack (heuristic) Mode ---
        if (algoMode === 'heuristic') {
            const { flatBoard, used, stack } = solver;

            if (solver.filledCount === size * size) {
                setIsPlaying(false);
                setTargetNum(size * size + 999);
                if (isSoundEnabled) audioEngine.playSuccess();
                setDynamicHighlight(null);
                setDynamicDesc(`🎉 Solution found! All rows, cols, and diagonals sum to ${magicConst}.`);
                if (onComplete) onComplete({ time: elapsed, attempts: solver.filledCount });
                return;
            }

            // Optimize Start: Fix number 1 at positions 1, 2, or 5 (Indices 0, 1, 4 for 3x3)
            if (solver.filledCount === 0) {
                if (solver.firstPosIdx === -1) {
                    let validStarts = [];
                    if (size === 3) validStarts = [0, 1, 4];
                    else if (size === 4) validStarts = [0, 1, 5];
                    else { for (let i = 0; i < size * size; i++) validStarts.push(i); }
                    solver.firstNumberPositions = validStarts;
                    solver.firstPosIdx = 0;
                } else {
                    flatBoard[solver.firstNumberPositions[solver.firstPosIdx]] = null;
                    used[1] = false;
                    solver.firstPosIdx++;
                }

                if (solver.firstPosIdx >= solver.firstNumberPositions.length) {
                    setIsPlaying(false);
                    setDynamicDesc("No solution found.");
                    return;
                }

                const pos1 = solver.firstNumberPositions[solver.firstPosIdx];
                flatBoard[pos1] = 1;
                used[1] = true;
                solver.filledCount = 1;
                setDynamicHighlight({ r: Math.floor(pos1/size), c: pos1%size, type: 'active' });
                setDynamicDesc(`Optimizing start: Placing 1 at cell ${pos1}`);
                
                const newB = [];
                for (let rr = 0; rr < size; rr++) newB.push(flatBoard.slice(rr * size, (rr + 1) * size));
                setPracticeBoard(newB);
                return;
            }

            let currentFrame = stack[solver.filledCount];
            if (!currentFrame) {
                // Fixed order (0, 1, 2...) for Smart Backtrack, but with Forced Logic
                const cellIdx = flatBoard.findIndex(v => v === null);
                let forcedVal = null;
                const r_idx = Math.floor(cellIdx/size), c_idx = cellIdx % size;
                
                // Lines to check for forced values
                const lines = [
                    Array.from({length: size}, (_, i) => r_idx * size + i), // Row
                    Array.from({length: size}, (_, i) => i * size + c_idx)  // Col
                ];
                if (r_idx === c_idx) lines.push(Array.from({length: size}, (_, i) => i * size + i));
                if (r_idx + c_idx === size - 1) lines.push(Array.from({length: size}, (_, i) => i * size + (size - 1 - i)));

                for (let line of lines) {
                    const filled = line.filter(i => flatBoard[i] !== null);
                    if (filled.length === size - 1) {
                        forcedVal = magicConst - filled.reduce((a, b) => a + flatBoard[b], 0);
                        break;
                    }
                }
                currentFrame = { cellIdx, triedNum: 0, forcedVal };
                stack[solver.filledCount] = currentFrame;
            }

            const r = Math.floor(currentFrame.cellIdx/size), c = currentFrame.cellIdx % size;
            let numToTry = null;

            if (currentFrame.forcedVal !== null) {
                if (currentFrame.triedNum === 0) {
                    numToTry = currentFrame.forcedVal;
                    currentFrame.triedNum = 999; // Only try once
                    setDynamicDesc(`Logical constraint: This cell must be ${numToTry}.`);
                }
            } else {
                numToTry = (currentFrame.triedNum === 0 ? 2 : currentFrame.triedNum + 1);
                while (numToTry <= size * size && used[numToTry]) numToTry++;
                currentFrame.triedNum = numToTry;
                setDynamicDesc(`Trying ${numToTry} at cell ${currentFrame.cellIdx}...`);
            }

            if (numToTry !== null && numToTry >= 2 && numToTry <= size * size && !used[numToTry]) {
                flatBoard[currentFrame.cellIdx] = numToTry;
                used[numToTry] = true;
                setDynamicHighlight({ r, c, type: currentFrame.forcedVal ? 'forced' : 'active' });

                let isValid = true;
                const lines_v = [
                    Array.from({length: size}, (_, i) => r * size + i),
                    Array.from({length: size}, (_, i) => i * size + c)
                ];
                if (r === c) lines_v.push(Array.from({length: size}, (_, i) => i * size + i));
                if (r + c === size - 1) lines_v.push(Array.from({length: size}, (_, i) => i * size + (size - 1 - i)));

                for (let line of lines_v) {
                    const vals = line.map(i => flatBoard[i]).filter(v => v !== null);
                    const s = vals.reduce((a, b) => a + b, 0);
                    if (s > magicConst || (vals.length === size && s !== magicConst)) { isValid = false; break; }
                }

                if (isValid) {
                    if (isSoundEnabled) audioEngine.playNote(numToTry);
                    solver.filledCount++;
                    setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
                } else {
                    setDynamicHighlight({ r, c, type: 'backtrack' });
                    setDynamicDesc(`❌ Conflict! ${numToTry} violates magic square rules. Backtracking...`);
                    flatBoard[currentFrame.cellIdx] = null;
                    used[numToTry] = false;
                    setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
                }
            } else {
                // Backtrack
                stack[solver.filledCount] = null;
                solver.filledCount--;
                if (solver.filledCount > 0) {
                    const prevFrame = stack[solver.filledCount];
                    const prevVal = flatBoard[prevFrame.cellIdx];
                    used[prevVal] = false;
                    setDynamicHighlight({ r: Math.floor(prevFrame.cellIdx/size), c: prevFrame.cellIdx%size, type: 'backtrack' });
                    setDynamicDesc(`🔙 Backtracking: ${prevVal} didn't work. Returning...`);
                    flatBoard[prevFrame.cellIdx] = null;
                }
            }

            const newBoard2D = [];
            for (let qr = 0; qr < size; qr++) newBoard2D.push(flatBoard.slice(qr * size, (qr + 1) * size));
            setPracticeBoard(newBoard2D);
        } 
        // --- End Smart Backtrack ---
        else {
            const { board, stack } = solver;

            if (solver.currentNum > size * size) {
                setIsPlaying(false);
                setTargetNum(size * size + 999);
                if (isSoundEnabled) audioEngine.playSuccess();
                setDynamicHighlight(null);
                setDynamicDesc(`🎉 Solution found! All rows, cols, and diagonals sum to ${magicConst}.`);
                if (onComplete) onComplete({ time: elapsed, attempts: size * size });
                return;
            }

            let stackFrame = stack[solver.currentNum];
            if (!stackFrame) {
                let candidates = [];
                if (solver.currentNum === 1) {
                    if (size === 3) candidates = [0, 1, 4];
                    else if (size === 4) candidates = [0, 1, 5];
                    else { for (let i = 0; i < size * size; i++) candidates.push(i); }
                } else {
                    for (let i = 0; i < size * size; i++) if (board[i] === null) candidates.push(i);
                }

                if (algoMode === 'metric') {
                    // Score by distance to center
                    const center = (size - 1) / 2;
                    candidates.sort((a, b) => {
                        const r1 = Math.floor(a/size), c1 = a%size;
                        const r2 = Math.floor(b/size), c2 = b%size;
                        const d1 = Math.pow(r1-center, 2) + Math.pow(c1-center, 2);
                        const d2 = Math.pow(r2-center, 2) + Math.pow(c2-center, 2);
                        return d1 - d2; // Center-first
                    });
                } else if (algoMode === 'backtrack') {
                    for (let i = candidates.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
                    }
                }
                // Brute stays in order (0, 1, 2...)
                
                stackFrame = { candidates, triedIndex: -1 };
                stack[solver.currentNum] = stackFrame;
            }

            stackFrame.triedIndex++;
            if (stackFrame.triedIndex >= stackFrame.candidates.length) {
                stack[solver.currentNum] = null;
                const posToClear = board.lastIndexOf(solver.currentNum);
                if (posToClear !== -1) {
                    setDynamicHighlight({ r: Math.floor(posToClear/size), c: posToClear%size, type: 'backtrack' });
                    setDynamicDesc(`Backtracking: Searching alternative for value ${solver.currentNum}...`);
                    board[posToClear] = null;
                }
                solver.currentNum--;
                if (solver.currentNum < 1) { setIsPlaying(false); return; }
                setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
            } else {
                const existingPos = board.indexOf(solver.currentNum);
                if (existingPos !== -1) board[existingPos] = null;

                const pos = stackFrame.candidates[stackFrame.triedIndex];
                board[pos] = solver.currentNum;
                const r = Math.floor(pos / size);
                const c = pos % size;
                setDynamicHighlight({ r, c, type: 'active' });
                setDynamicDesc(`Placing ${solver.currentNum} at (${r}, ${c})...`);

                let isValid = true;
                if (algoMode !== 'brute') {
                    let checks = [
                        Array.from({length: size}, (_, i) => r * size + i),
                        Array.from({length: size}, (_, i) => i * size + c)
                    ];
                    if (r === c) checks.push(Array.from({length: size}, (_, i) => i * size + i));
                    if (r + c === size - 1) checks.push(Array.from({length: size}, (_, i) => i * size + (size - 1 - i)));
                    
                    for (let line of checks) {
                        const vals = line.map(i => board[i]).filter(v => v !== null);
                        const s = vals.reduce((a, b) => a + b, 0);
                        if (s > magicConst || (vals.length === size && s !== magicConst)) { isValid = false; break; }
                    }
                } else {
                    // Pure Brute only checks at the very end (simulated here by checking only when all numbers are in)
                    if (solver.currentNum === size * size) {
                        // Check all lines
                        const allIndices = [];
                        for(let i=0; i<size; i++) {
                            const row = []; for(let j=0; j<size; j++) row.push(i*size+j); allIndices.push(row);
                            const col = []; for(let j=0; j<size; j++) col.push(j*size+i); allIndices.push(col);
                        }
                        const d1=[]; for(let i=0; i<size; i++) d1.push(i*size+i); allIndices.push(d1);
                        const d2=[]; for(let i=0; i<size; i++) d2.push(i*size+size-1-i); allIndices.push(d2);

                        for(let line of allIndices) {
                            const s = line.reduce((acc, idx) => acc + board[idx], 0);
                            if (s !== magicConst) { isValid = false; break; }
                        }
                    }
                }

                if (isValid) {
                    if (isSoundEnabled) audioEngine.playNote(solver.currentNum);
                    solver.currentNum++;
                    if (algoMode === 'brute' && solver.currentNum <= size * size) {
                         setDynamicDesc(`Value ${solver.currentNum} placed (Skipping validation)`);
                    }
                } else {
                    setDynamicHighlight({ r, c, type: 'backtrack' });
                    setDynamicDesc(algoMode === 'brute' ? `Final sum mismatch: Restarting search...` : `Sum conflict: Value ${solver.currentNum} at (${r}, ${c}) failed!`);
                    board[pos] = null;
                    setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
                }
            }
            const newBoard2D = [];
            for (let r_row = 0; r_row < size; r_row++) newBoard2D.push(board.slice(r_row * size, (r_row + 1) * size));
            setPracticeBoard(newBoard2D);
        }
      }, playbackDelay);
    } else if (mode === 'dynamic') {
        const magicConst = getMagicConstant(size);
        timerRef.current = setInterval(() => {
            const now = performance.now();
            const elapsed = Math.floor(now - startTimeRef.current);
            setStats(prev => ({ ...prev, time: elapsed }));

            const solver = solverRef.current;
            if (!solver) return;
            const { flatBoard, used, stack } = solver;

            if (solver.filledCount === size * size) {
                setIsPlaying(false);
                setDynamicDesc(`🎉 Solution found! All rows, cols, and diagonals sum to ${magicConst}.`);
                setDynamicHighlight(null);
                setTargetNum(size * size + 999);
                if (isSoundEnabled) audioEngine.playSuccess();
                if (onComplete) onComplete({ time: elapsed, attempts: solver.filledCount });
                return;
            }

            if (solver.filledCount === 0) {
                if (solver.firstPosIdx === -1) {
                    let validStarts = [];
                    if (size === 3) validStarts = [0, 1, 4];
                    else if (size === 4) validStarts = [0, 1, 5];
                    else if (size === 5) validStarts = [0, 1, 2, 6, 7, 12];
                    else { for (let i = 0; i < size * size; i++) validStarts.push(i); }
                    for (let i = validStarts.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [validStarts[i], validStarts[j]] = [validStarts[j], validStarts[i]];
                    }
                    solver.firstNumberPositions = validStarts;
                    solver.firstPosIdx = 0;
                } else {
                    const prev1 = solver.firstNumberPositions[solver.firstPosIdx];
                    flatBoard[prev1] = null;
                    used[1] = false;
                    solver.firstPosIdx++;
                }

                if (solver.firstPosIdx >= solver.firstNumberPositions.length) {
                    setIsPlaying(false);
                    return;
                }

                const pos1 = solver.firstNumberPositions[solver.firstPosIdx];
                flatBoard[pos1] = 1;
                used[1] = true;
                solver.filledCount = 1;
                setDynamicHighlight({ r: Math.floor(pos1/size), c: pos1%size, type: 'active' });
                setDynamicDesc(`Optimizing start: Placing 1 at cell ${pos1}.`);
                
                const newB = [];
                for (let rr = 0; rr < size; rr++) newB.push(flatBoard.slice(rr * size, (rr + 1) * size));
                setPracticeBoard(newB);
                return;
            }

            let currentFrame = stack[solver.filledCount];
            if (!currentFrame) {
                const emptyIndices = flatBoard.map((v, i) => v === null ? i : -1).filter(idx => idx !== -1);
                const candidates = emptyIndices.map(idx => {
                    let totalFilled = 0;
                    const r_idx = Math.floor(idx / size), c_idx = idx % size;
                    const lines = [];
                    const row = []; for(let i=0; i<size; i++) row.push(r_idx*size+i); lines.push(row);
                    const col = []; for(let i=0; i<size; i++) col.push(i*size+c_idx); lines.push(col);
                    if (r_idx === c_idx) { const d1=[]; for(let i=0; i<size; i++) d1.push(i*size+i); lines.push(d1); }
                    if (r_idx + c_idx === size - 1) { const d2=[]; for(let i=0; i<size; i++) d2.push(i*size+size-1-i); lines.push(d2); }
                    lines.forEach(line => {
                        totalFilled += line.reduce((acc, i) => acc + (flatBoard[i] !== null ? 1 : 0), 0);
                    });
                    return { idx, score: totalFilled };
                }).sort((a,b) => b.score - a.score);

                const cellIdx = candidates[0].idx;
                let forcedVal = null;
                const r_idx = Math.floor(cellIdx/size), c_idx = cellIdx % size;
                const lines_c = [];
                const row_c = []; for(let i=0; i<size; i++) row_c.push(r_idx*size+i); lines_c.push(row_c);
                const col_c = []; for(let i=0; i<size; i++) col_c.push(i*size+c_idx); lines_c.push(col_c);
                if (r_idx === c_idx) { const d1=[]; for(let i=0; i<size; i++) d1.push(i*size+i); lines_c.push(d1); }
                if (r_idx + c_idx === size - 1) { const d2=[]; for(let i=0; i<size; i++) d2.push(i*size+size-1-i); lines_c.push(d2); }
                for (let line of lines_c) {
                    const filled = line.filter(i => flatBoard[i] !== null);
                    if (filled.length === size - 1) {
                        forcedVal = magicConst - filled.reduce((a,b) => a + flatBoard[b], 0);
                        break;
                    }
                }

                currentFrame = { cellIdx, triedNum: 0, forcedVal };
                stack[solver.filledCount] = currentFrame;
            }

            const r = Math.floor(currentFrame.cellIdx/size), c = currentFrame.cellIdx % size;
            let numToTry = null;

            if (currentFrame.forcedVal !== null) {
                if (currentFrame.triedNum === 0) {
                    numToTry = currentFrame.forcedVal;
                    currentFrame.triedNum = 999;
                    setDynamicDesc(`Logical inference: Only ${numToTry} is valid here.`);
                }
            } else {
                numToTry = (currentFrame.triedNum === 0 ? 2 : currentFrame.triedNum + 1);
                while (numToTry <= size * size && used[numToTry]) numToTry++;
                currentFrame.triedNum = numToTry;
                setDynamicDesc(`Trying ${numToTry} at optimal cell (${r}, ${c})...`);
            }

            if (numToTry !== null && numToTry >= 2 && numToTry <= size * size && !used[numToTry]) {
                flatBoard[currentFrame.cellIdx] = numToTry;
                used[numToTry] = true;
                setDynamicHighlight({ r, c, type: currentFrame.forcedVal ? 'forced' : 'active' });

                let isValid = true;
                const lines_v = [];
                const row_v = []; for(let i=0; i<size; i++) row_v.push(r*size+i); lines_v.push(row_v);
                const col_v = []; for(let i=0; i<size; i++) col_v.push(i*size+c); lines_v.push(col_v);
                if (r === c) { const d1=[]; for(let i=0; i<size; i++) d1.push(i*size+i); lines_v.push(d1); }
                if (r + c === size - 1) { const d2=[]; for(let i=0; i<size; i++) d2.push(i*size+size-1-i); lines_v.push(d2); }
                for (let line of lines_v) {
                    const vals = line.map(i => flatBoard[i]).filter(v => v !== null);
                    const s = vals.reduce((a,b) => a+b, 0);
                    if (s > magicConst || (vals.length === size && s !== magicConst)) { isValid = false; break; }
                }

                if (isValid) {
                    if (isSoundEnabled) audioEngine.playNote(numToTry);
                    solver.filledCount++;
                    setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
                } else {
                    setDynamicHighlight({ r, c, type: 'backtrack' });
                    setDynamicDesc(`Constraint violation: Conflict detected at (${r}, ${c})!`);
                    flatBoard[currentFrame.cellIdx] = null;
                    used[numToTry] = false;
                    setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
                }
            } else {
                // Backtrack
                stack[solver.filledCount] = null;
                solver.filledCount--;
                if (solver.filledCount > 0) {
                    const prevFrame = stack[solver.filledCount];
                    const prevVal = flatBoard[prevFrame.cellIdx];
                    used[prevVal] = false;
                    setDynamicHighlight({ r: Math.floor(prevFrame.cellIdx/size), c: prevFrame.cellIdx%size, type: 'backtrack' });
                    setDynamicDesc(`Backtracking: Removing ${prevVal} and searching alternatives...`);
                    flatBoard[prevFrame.cellIdx] = null;
                }
            }

            const newBoard2D = [];
            for (let qr = 0; qr < size; qr++) newBoard2D.push(flatBoard.slice(qr * size, (qr + 1) * size));
            setPracticeBoard(newBoard2D);
        // Unified Speed: Using playbackDelay directly without dividers
        }, playbackDelay);
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
    } else { if (onError) onError(); }
  };

  return {
    currentStepIndex, setCurrentStepIndex,
    isPlaying, setIsPlaying,
    practiceBoard, targetNum,
    feedback, setFeedback,
    isSoundEnabled, toggleSound,
    resetPractice, handlePracticeClick,
    lastCorrectPos, stats,
    dynamicDesc, dynamicHighlight
  };
};
