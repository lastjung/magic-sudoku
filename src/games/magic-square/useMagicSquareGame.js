import React, { useState, useEffect, useRef, useCallback } from 'react';
import { audioEngine } from '../../utils/audio';
import { solveDynamicStep } from './logic/dynamic';
import { solveHeuristicStep } from './logic/heuristic';
import { solveBacktrackStep } from './logic/backtrack';

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
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  
  const timerRef = useRef(null);
  const baseDelay = Math.max(50, 1050 - speed);
  const playbackDelay = baseDelay;

  const [stats, setStats] = useState({ attempts: 0, time: 0 });
  const [dynamicDesc, setDynamicDesc] = useState("");
  const [dynamicHighlight, setDynamicHighlight] = useState(null); // { r, c, type: 'active' | 'forced' | 'backtrack' }
  const startTimeRef = useRef(0);
  
  const solverRef = useRef(null);

  const resetPractice = useCallback(() => {
    let initialBoard = Array.from({ length: size }, () => Array(size).fill(null));
    
    if (algoMode === 'swing' && (size === 4 || size === 8)) {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              if (r % 2 === 0) initialBoard[r][c] = (r * size) + c + 1;
              else initialBoard[r][c] = (r * size) + (size - 1 - c) + 1;
            }
        }
        setTargetNum(size * size + 1);
    } else {
      setTargetNum(1);
    }

    setPracticeBoard(initialBoard);
    setStats({ attempts: 0, time: 0 });
    setCurrentStepIndex(0);
    setDynamicDesc("");
    setDynamicHighlight(null);
    solverRef.current = null;
    startTimeRef.current = 0;
  }, [size, algoMode]);

  useEffect(() => {
    setIsPlaying(false);
    resetPractice();
  }, [size, mainMode, algoMode, resetPractice]);

  const lastTriggerRun = useRef(0);
  useEffect(() => {
    if (triggerRun > lastTriggerRun.current) {
        lastTriggerRun.current = triggerRun;
        setIsPlaying(true);
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
  }, [triggerReset, resetPractice]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (startTimeRef.current > 0) {
          const elapsed = Math.floor(performance.now() - startTimeRef.current);
          setStats(prev => ({ ...prev, time: elapsed }));
        }
      }, 100); 
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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
        if (startTimeRef.current === 0) startTimeRef.current = performance.now();
        let currentIndex = currentStepIndex;
        
        while (currentIndex < steps.length - 1 && isPlaying) {
          const step = steps[currentIndex];
          let delay = playbackDelay;
          if (size === 8 && step.type === 'setup') delay = Math.max(30, playbackDelay / 4);
          if (step.type === 'highlight_targets') delay = 1000;
          if (step.type === 'swing_rotating') delay = 3600;
          
          await new Promise(resolve => {
            timerRef.current = setTimeout(resolve, delay);
          });
          
          if (!isPlaying) break;
          
          currentIndex++;
          setCurrentStepIndex(currentIndex);
          setStats(prev => ({ ...prev, attempts: currentIndex }));
          
          if (isSoundEnabled) {
              const currentStepData = steps[currentIndex];
              if (currentStepData?.val) {
                  audioEngine.playNote(currentStepData.val);
              } else if (currentStepData?.type === 'highlight_targets' || currentStepData?.type === 'swing_rotating') {
                  audioEngine.playNote(size * size);
              } else if (currentStepData?.type === 'complete') {
                  audioEngine.playSuccess();
              }
          }

          if (currentIndex === steps.length - 1 || steps[currentIndex].type === 'complete') {
            setIsPlaying(false);
            if (onComplete) {
              const totalTime = performance.now() - startTimeRef.current;
              onComplete({ attempts: currentIndex, time: totalTime });
            }
            break;
          }
        }
      };
      runLearnLoop();
    } else {
        const solveStep = () => {
            if (!isPlaying) return;

            let result;
            if (algoMode === 'heuristic') {
                result = solveHeuristicStep(solverRef.current, size);
            } else if (mode === 'brute' || algoMode === 'backtrack' || algoMode === 'metric') {
                result = solveBacktrackStep(solverRef.current, size, algoMode);
            } else if (mode === 'dynamic') {
                result = solveDynamicStep(solverRef.current, size);
            }

            if (result) {
                setPracticeBoard(result.board);
                setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
                setDynamicDesc(result.desc || "");
                setDynamicHighlight(result.highlight || null);
                
                if (isSoundEnabled && result.val) {
                    audioEngine.playNote(result.val);
                }

                if (result.isComplete) {
                    setIsPlaying(false);
                    const totalTime = performance.now() - startTimeRef.current;
                    setStats(prev => ({ ...prev, time: totalTime }));
                    if (isSoundEnabled) audioEngine.playSuccess();
                    if (onComplete) onComplete({ attempts: stats.attempts + 1, time: totalTime });
                } else {
                    timerRef.current = setTimeout(solveStep, playbackDelay);
                }
            }
        };
        timerRef.current = setTimeout(solveStep, playbackDelay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, steps, playbackDelay, mode, algoMode, size, onComplete, isSoundEnabled]);

  const handlePracticeClick = (r, c, onSuccess, onError) => {
    if (practiceBoard[r][c] !== null) return;
    const correctStep = steps.find(s => s.highlight && s.highlight.r === r && s.highlight.c === c && s.val === targetNum);
    
    if (correctStep) {
      const newBoard = [...practiceBoard];
      newBoard[r] = [...newBoard[r]];
      newBoard[r][c] = targetNum;
      setPracticeBoard(newBoard);
      setTargetNum(prev => prev + 1);
      setLastCorrectPos({ r, c });
      if (isSoundEnabled) audioEngine.playNote(targetNum);
      onSuccess(correctStep);
      
      if (targetNum === size * size) {
        const totalTime = performance.now() - startTimeRef.current;
        setStats(prev => ({ ...prev, time: totalTime }));
        if (isSoundEnabled) audioEngine.playSuccess();
        if (onComplete) onComplete({ attempts: stats.attempts, time: totalTime });
      }
    } else {
      setStats(prev => ({ ...prev, attempts: prev.attempts + 1 }));
      onError();
    }
  };

  return {
    practiceBoard,
    targetNum,
    lastCorrectPos,
    feedback,
    setFeedback,
    isSoundEnabled,
    setIsSoundEnabled,
    stats,
    currentStepIndex,
    isPlaying,
    setIsPlaying,
    resetPractice,
    handlePracticeClick,
    dynamicDesc,
    dynamicHighlight
  };
};
