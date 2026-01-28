export function solveBacktrackStep(solver, size, algoMode) {
    const { board, stack } = solver;
    const magicConst = (size * (size * size + 1)) / 2;

    if (solver.currentNum > size * size) {
        return { board: reconstructBoard(board, size), isComplete: true, desc: "Solution found!" };
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

    stackFrame.triedIndex++;
    if (stackFrame.triedIndex >= stackFrame.candidates.length) {
        stack[solver.currentNum] = null;
        const posToClear = board.lastIndexOf(solver.currentNum);
        if (posToClear !== -1) {
            board[posToClear] = null;
            solver.currentNum--;
            return {
                board: reconstructBoard(board, size),
                highlight: { r: Math.floor(posToClear/size), c: posToClear%size, type: 'backtrack' },
                desc: `Backtracking: Searching alternative for value ${solver.currentNum + 1}...`
            };
        }
        solver.currentNum--;
        if (solver.currentNum < 1) return { board: reconstructBoard(board, size), isComplete: true, desc: "No solution." };
        return solveBacktrackStep(solver, size, algoMode);
    }

    const existingPos = board.indexOf(solver.currentNum);
    if (existingPos !== -1) board[existingPos] = null;

    const pos = stackFrame.candidates[stackFrame.triedIndex];
    board[pos] = solver.currentNum;
    const r = Math.floor(pos / size);
    const c = pos % size;

    let isValid = true;
    if (algoMode !== 'brute') {
        const row = Array.from({length: size}, (_, i) => r * size + i);
        const col = Array.from({length: size}, (_, i) => i * size + c);
        const checks = [row, col];
        if (r === c) checks.push(Array.from({length: size}, (_, i) => i * size + i));
        if (r + c === size - 1) checks.push(Array.from({length: size}, (_, i) => i * size + (size - 1 - i)));

        for (let line of checks) {
            const vals = line.map(i => board[i]).filter(v => v !== null);
            const s = vals.reduce((a, b) => a + b, 0);
            if (s > magicConst || (vals.length === size && s !== magicConst)) { isValid = false; break; }
        }
    }

    if (isValid) {
        solver.currentNum++;
        return {
            board: reconstructBoard(board, size),
            val: solver.currentNum - 1,
            highlight: { r, c, type: 'active' },
            desc: `Placing ${solver.currentNum - 1} at (${r}, ${c})...`
        };
    } else {
        board[pos] = null;
        return {
            board: reconstructBoard(board, size),
            highlight: { r, c, type: 'backtrack' },
            desc: `Conflict at (${r}, ${c})! Trying next position...`
        };
    }
}

function reconstructBoard(flatBoard, size) {
    const board = [];
    for (let i = 0; i < size; i++) board.push(flatBoard.slice(i * size, (i + 1) * size));
    return board;
}
