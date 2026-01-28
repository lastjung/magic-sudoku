export function solveBacktrackStep(solver, size, algoMode) {
    if (!solver.board) {
        solver.board = Array(size * size).fill(null);
        solver.used = Array(size * size + 1).fill(false);
        solver.currentNum = 1;
        solver.stack = [];
    }
    
    const { board, used, stack } = solver;
    const magicConst = (size * (size * size + 1)) / 2;

    if (solver.currentNum > size * size) {
        return { board: reconstructBoard(board, size), isComplete: true, desc: "Solution found!" };
    }

    let stackFrame = stack[solver.currentNum];
    if (!stackFrame) {
        let candidates = [];
        // Available positions (empty cells)
        for (let i = 0; i < size * size; i++) {
            if (board[i] === null) candidates.push(i);
        }

        if (algoMode === 'metric') {
            const center = (size - 1) / 2;
            candidates.sort((a, b) => {
                const r1 = Math.floor(a/size), c1 = a%size;
                const r2 = Math.floor(b/size), c2 = b%size;
                const d1 = Math.pow(r1-center, 2) + Math.pow(c1-center, 2);
                const d2 = Math.pow(r2-center, 2) + Math.pow(c2-center, 2);
                return d1 - d2;
            });
        } else if (algoMode === 'backtrack') {
            for (let i = candidates.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
            }
        }
        
        stackFrame = { candidates, triedIndex: -1 };
        stack[solver.currentNum] = stackFrame;
    }

    // Clear previous position for this number if we are moving to next candidate
    const oldPos = board.indexOf(solver.currentNum);
    if (oldPos !== -1) board[oldPos] = null;
    used[solver.currentNum] = false;

    stackFrame.triedIndex++;
    if (stackFrame.triedIndex >= stackFrame.candidates.length) {
        // Backtrack to previous number
        stack[solver.currentNum] = null;
        solver.currentNum--;
        
        if (solver.currentNum < 1) {
            solver.currentNum = 1;
            return { board: reconstructBoard(board, size), isComplete: true, desc: "No solution." };
        }

        // Return mid-backtrack state
        return {
            board: reconstructBoard(board, size),
            highlight: null,
            desc: `Backtracking: No positions left for ${solver.currentNum + 1}`
        };
    }

    const pos = stackFrame.candidates[stackFrame.triedIndex];
    const r = Math.floor(pos / size);
    const c = pos % size;
    
    // Attempt placing
    board[pos] = solver.currentNum;
    used[solver.currentNum] = true;

    let isValid = true;
    if (algoMode !== 'brute') {
        const checks = [
            Array.from({length: size}, (_, i) => r * size + i),
            Array.from({length: size}, (_, i) => i * size + c)
        ];
        if (r === c) checks.push(Array.from({length: size}, (_, i) => i * size + i));
        if (r + c === size - 1) checks.push(Array.from({length: size}, (_, i) => i * size + (size - 1 - i)));

        for (let line of checks) {
            const vals = line.map(i => board[i]).filter(v => v !== null);
            const s = vals.reduce((a, b) => a + b, 0);
            if (s > magicConst || (vals.length === size && s !== magicConst)) { 
                isValid = false; 
                break; 
            }
        }
    }

    if (isValid) {
        const placedNum = solver.currentNum;
        solver.currentNum++;
        return {
            board: reconstructBoard(board, size),
            val: placedNum,
            highlight: { r, c, type: 'active' },
            desc: `Placing ${placedNum} at (${r}, ${c})...`
        };
    } else {
        // Conflict - clear it and wait for next step
        board[pos] = null;
        used[solver.currentNum] = false;
        return {
            board: reconstructBoard(board, size),
            highlight: { r, c, type: 'backtrack' },
            desc: `Conflict at (${r}, ${c})! ${solver.currentNum} violates magic sum.`
        };
    }
}

function reconstructBoard(flatBoard, size) {
    const board = [];
    for (let i = 0; i < size; i++) {
        board.push(flatBoard.slice(i * size, (i + 1) * size));
    }
    return board;
}
