export function solveBacktrackStep(solver, size, algoMode) {
    if (!solver.board) {
        solver.board = Array(size * size).fill(null);
        solver.used = Array(size * size + 1).fill(false);
        solver.currentNum = 1;
        solver.stack = [];
    }
    
    const { board, used, stack } = solver;
    const magicConst = (size * (size * size + 1)) / 2;

    // --- Final Validation Check ---
    if (solver.currentNum > size * size) {
        if (isActuallyMagic(board, size, magicConst)) {
            return { board: reconstructBoard(board, size), isComplete: true, desc: "Solution found!" };
        } else {
            // If brute force filled it wrong, backtrack from the last number
            return handleFailureAndBacktrack(solver, size, "Invalid arrangement. Backtracking...");
        }
    }

    let stackFrame = stack[solver.currentNum];
    if (!stackFrame) {
        let candidates = [];
        for (let i = 0; i < size * size; i++) {
            if (board[i] === null) candidates.push(i);
        }

        if (algoMode === 'metric') {
            const center = (size - 1) / 2;
            candidates.sort((a, b) => {
                const r1 = Math.floor(a/size), c1 = a%size;
                const r2 = Math.floor(b/size), c2 = b%size;
                return (Math.pow(r1-center, 2) + Math.pow(c1-center, 2)) - (Math.pow(r2-center, 2) + Math.pow(c2-center, 2));
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

    // Try next candidate
    const oldPos = board.indexOf(solver.currentNum);
    if (oldPos !== -1) board[oldPos] = null;
    used[solver.currentNum] = false;

    stackFrame.triedIndex++;
    if (stackFrame.triedIndex >= stackFrame.candidates.length) {
        return handleFailureAndBacktrack(solver, size, `Backtracking: No positions left for ${solver.currentNum}`);
    }

    const pos = stackFrame.candidates[stackFrame.triedIndex];
    const r = Math.floor(pos / size), c = pos % size;
    board[pos] = solver.currentNum;
    used[solver.currentNum] = true;

    // Pruning (Skip for 'brute')
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
                isValid = false; break; 
            }
        }
    }

    if (isValid) {
        const placedVal = solver.currentNum;
        solver.currentNum++;
        return {
            board: reconstructBoard(board, size),
            val: placedVal,
            highlight: { r, c, type: 'active' },
            desc: `Placing ${placedVal} at (${r}, ${c})...`
        };
    } else {
        board[pos] = null;
        used[solver.currentNum] = false;
        return {
            board: reconstructBoard(board, size),
            highlight: { r, c, type: 'backtrack' },
            desc: `Conflict! ${solver.currentNum} at (${r}, ${c}) invalidates sum.`
        };
    }
}

function handleFailureAndBacktrack(solver, size, desc) {
    const { board, used, stack } = solver;
    stack[solver.currentNum] = null;
    solver.currentNum--;
    
    if (solver.currentNum < 1) {
        solver.currentNum = 1;
        return { board: reconstructBoard(board, size), isComplete: true, desc: "Search exhausted." };
    }

    const lastNumPos = board.indexOf(solver.currentNum);
    return {
        board: reconstructBoard(board, size),
        highlight: lastNumPos !== -1 ? { r: Math.floor(lastNumPos/size), c: lastNumPos%size, type: 'backtrack' } : null,
        desc: desc
    };
}

function isActuallyMagic(board, size, magicConst) {
    // Check Rows
    for (let r = 0; r < size; r++) {
        let sum = 0;
        for (let c = 0; c < size; c++) sum += board[r * size + c];
        if (sum !== magicConst) return false;
    }
    // Check Cols
    for (let c = 0; c < size; c++) {
        let sum = 0;
        for (let r = 0; r < size; r++) sum += board[r * size + c];
        if (sum !== magicConst) return false;
    }
    // Diagonals
    let d1 = 0, d2 = 0;
    for (let i = 0; i < size; i++) {
        d1 += board[i * size + i];
        d2 += board[i * size + (size - 1 - i)];
    }
    return d1 === magicConst && d2 === magicConst;
}

function reconstructBoard(flatBoard, size) {
    const b = [];
    for (let i = 0; i < size; i++) b.push(flatBoard.slice(i * size, (i + 1) * size));
    return b;
}
