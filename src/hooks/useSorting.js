import { useState, useRef, useCallback, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { audioEngine } from '../utils/audio';

export const useSorting = (initialArray, sortingAlgorithm, speed, triggerRun, triggerStop, onEnd) => {
  const [array, setArray] = useState([...initialArray]);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [sorted, setSorted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0, time: 0 });
  
  const speedRef = useRef(speed);
  const sessionIdRef = useRef(0);
  const maxValRef = useRef(1);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    maxValRef.current = Math.max(...initialArray, 1);
    
    // Sync array with new initialArray when not running
    if (!isRunning) {
      setArray([...initialArray]);
      setSorted(false);
      setComparing([]);
      setSwapping([]);
      setStats({ comparisons: 0, swaps: 0, time: 0 });
    }
  }, [initialArray, isRunning]); // added isRunning to deps to be explicit, though it's used inside


  const dynamicSleep = useCallback(() => new Promise(resolve => setTimeout(resolve, 1001 - speedRef.current)), []);

  const stop = useCallback(() => {
    sessionIdRef.current++;
    setIsRunning(false);
    // Keep comparing/swapping states for visual persistence during pause
  }, []);

  const reset = useCallback((newArray) => {
    stop();
    setArray([...newArray]);
    setSorted(false);
    setComparing([]);
    setSwapping([]);
    setStats({ comparisons: 0, swaps: 0, time: 0 });
  }, [stop]);

  const runSort = async () => {
    if (isRunning) return;
    
    let arrayToSort;
    let baseTime = 0;
    let localComparisons = 0;
    let localSwaps = 0;
    
    if (sorted) {
      // Completed → restart with fresh initialArray
      arrayToSort = [...initialArray];
      // Force synchronous render so user sees the reset
      flushSync(() => {
        setArray([...initialArray]);
        setSorted(false);
        setComparing([]);
        setSwapping([]);
        setStats({ comparisons: 0, swaps: 0, time: 0 });
      });
    } else {
      // Stopped mid-way → resume from current array
      arrayToSort = [...array];
      baseTime = stats.time;
      localComparisons = stats.comparisons;
      localSwaps = stats.swaps;
    }
    
    setIsRunning(true);
    const mySessionId = ++sessionIdRef.current;
    const startTime = performance.now();
    
    const onStep = async (newArray, indices, type) => {
      if (mySessionId !== sessionIdRef.current) {
        // This is an old session, stop it silently
        throw new Error('STOP'); 
      }
      
      const currentTime = performance.now();
      const elapsed = baseTime + Math.round(currentTime - startTime);

      setArray([...newArray]);
      if (indices.length > 0) {
        audioEngine.playNote(newArray[indices[0]], maxValRef.current);
      }
      
      if (type === 'compare') {
        localComparisons++;
        setComparing(indices);
        setSwapping([]);
        setStats({ comparisons: localComparisons, swaps: localSwaps, time: elapsed });
      } else if (type === 'swap') {
        localSwaps++;
        setSwapping(indices);
        setComparing([]);
        setStats({ comparisons: localComparisons, swaps: localSwaps, time: elapsed });
      } else {
        // Progress update only
        setStats({ comparisons: localComparisons, swaps: localSwaps, time: elapsed });
      }
      
      await dynamicSleep();
    };

    try {
      await sortingAlgorithm(arrayToSort, onStep);
      
      // Final check for session consistency
      if (mySessionId === sessionIdRef.current) {
        const endTime = performance.now();
        const finalTime = baseTime + Math.round(endTime - startTime);
        const finalStats = { comparisons: localComparisons, swaps: localSwaps, time: finalTime };
        setStats(finalStats);
        setSorted(true);
        setComparing([]);
        setSwapping([]);
        // Pass stats on successful completion
        if (onEnd) onEnd(finalStats);
      }
    } catch (err) {
      if (err.message !== 'STOP') {
        console.error('Sort error:', err);
      }
      // Don't pass stats on stop/error
      if (onEnd) onEnd(null);
    } finally {
      if (mySessionId === sessionIdRef.current) {
        setIsRunning(false);
      }
    }
  };

  const lastTriggerRef = useRef(0);
  const runSortRef = useRef(runSort);
  const stopRef = useRef(stop);
  runSortRef.current = runSort;
  stopRef.current = stop;
  
  // Toggle function: if running stop, else run
  const toggle = useCallback(() => {
    if (isRunning) {
      stopRef.current();
    } else {
      runSortRef.current();
    }
  }, [isRunning]);
  
  useEffect(() => {
    if (triggerRun > lastTriggerRef.current) {
      lastTriggerRef.current = triggerRun;
      toggle();
    }
  }, [triggerRun, toggle]);

  // Stop trigger - always stops
  const lastStopRef = useRef(0);
  useEffect(() => {
    if (triggerStop > lastStopRef.current) {
      lastStopRef.current = triggerStop;
      stopRef.current();
    }
  }, [triggerStop]);

  return { array, comparing, swapping, sorted, isRunning, stats, runSort, stop, reset, toggle };
};
