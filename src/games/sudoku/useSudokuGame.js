import { useState, useRef, useCallback, useEffect } from 'react';
import { generateSudokuSteps } from './logic';
import { audioEngine } from '../../utils/audio';

export const useSudokuGame = ({ 
    initialBoard, 
    size, 
    speed = 200,
    selectedAlgos,
    onComplete,
    triggerRun = 0,
    triggerReset = 0
}) => {
    const [board, setBoard] = useState(initialBoard);
    const [isPlaying, setIsPlaying] = useState(false);
    const [stats, setStats] = useState({ steps: 0, time: 0 });
    const [activeCell, setActiveCell] = useState(null);
    const [dynamicDesc, setDynamicDesc] = useState("Ready...");

    const generatorRef = useRef(null);
    const timerRef = useRef(null);
    const startTimeRef = useRef(0);
    
    // Refs for stable logic
    const boardRef = useRef(board);
    const sizeRef = useRef(size);
    const algosRef = useRef(selectedAlgos);
    const lastRunTrigger = useRef(0);
    const lastResetTrigger = useRef(0);

    useEffect(() => { boardRef.current = board; }, [board]);
    useEffect(() => { sizeRef.current = size; }, [size]);
    useEffect(() => { algosRef.current = selectedAlgos; }, [selectedAlgos]);

    const stop = useCallback(() => {
        setIsPlaying(false);
        setActiveCell(null);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Simulation Loop
    const runSimulation = useCallback(() => {
        if (isPlaying || (generatorRef.current && !timerRef.current)) {
            return;
        }

        if (!generatorRef.current) {
            generatorRef.current = generateSudokuSteps(boardRef.current, sizeRef.current, algosRef.current);
            startTimeRef.current = performance.now();
            audioEngine.init();
        }

        setIsPlaying(true);

        timerRef.current = setInterval(() => {
            const result = generatorRef.current.next();

            if (result.done) {
                // Keep the final board state, just stop the timer and playback state
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
                setIsPlaying(false);
                setActiveCell(null);
                setDynamicDesc("Puzzle Completed!");
                audioEngine.playSuccess();
                generatorRef.current = null; 
                if (onComplete) onComplete(true);
                return;
            }

            const step = result.value;
            setBoard(step.board);
            setStats(prev => ({
                steps: prev.steps + 1,
                time: performance.now() - startTimeRef.current
            }));
            
            setActiveCell({
                r: step.r,
                c: step.c,
                val: step.val,
                type: step.type,
                method: step.method
            });

            if (step.type === 'backtrack') {
                setDynamicDesc(`Backtracking at (${step.r}, ${step.c})...`);
            } else if (step.method === 'naked') {
                setDynamicDesc(`Inference: Found Naked Single ${step.val}`);
                audioEngine.playNote(step.val + 10); 
            } else {
                setDynamicDesc(`Trying ${step.val} at (${step.r}, ${step.c})`);
                audioEngine.playNote(step.val);
            }
        }, speed);

    }, [speed, isPlaying, onComplete]);

    // Initial Board Sync - Only trigger when a NEW puzzle is loaded
    useEffect(() => {
        if (Array.isArray(initialBoard)) {
            setBoard(initialBoard.map(row => Array.isArray(row) ? [...row] : []));
        }
        setStats({ steps: 0, time: 0 });
        setDynamicDesc("Ready...");
        generatorRef.current = null;
        stop();
    }, [initialBoard, stop]);

    // Trigger Handling
    useEffect(() => {
        if (triggerRun > 0 && triggerRun !== lastRunTrigger.current) {
            lastRunTrigger.current = triggerRun;
            runSimulation();
        }
    }, [triggerRun, runSimulation]);

    useEffect(() => {
        if (triggerReset > 0 && triggerReset !== lastResetTrigger.current) {
            lastResetTrigger.current = triggerReset;
            stop();
            setBoard(initialBoard.map(row => [...row]));
            setStats({ steps: 0, time: 0 });
            setActiveCell(null);
            setDynamicDesc("Ready...");
            generatorRef.current = null;
        }
    }, [triggerReset, stop, initialBoard]);

    const reset = useCallback(() => {
        stop();
        if (Array.isArray(initialBoard)) {
            setBoard(initialBoard.map(row => Array.isArray(row) ? [...row] : []));
        }
        setStats({ steps: 0, time: 0 });
        setActiveCell(null);
        setDynamicDesc("Ready...");
        generatorRef.current = null;
    }, [stop, initialBoard]);

    return {
        board,
        isPlaying,
        stats,
        activeCell,
        dynamicDesc,
        runSimulation,
        stop,
        reset
    };
};
