export function solveDynamicStep(solver, size) {
    const { flatBoard, used, stack } = solver;
    const magicConst = (size * (size * size + 1)) / 2;

    if (solver.filledCount >= size * size) {
        return { board: reconstructBoard(flatBoard, size), isComplete: true, desc: "Solution found!" };
    }

    // Initialize first number (1) positions for faster search if not already set
    if (solver.firstNumberPositions.length === 0) {
        if (size === 3) solver.firstNumberPositions = [0, 1, 4];
        else if (size === 4) solver.firstNumberPositions = [0, 1, 5];
        else {
            for (let i = 0; i < size * size; i++) solver.firstNumberPositions.push(i);
        }
        solver.firstPosIdx = 0;
    }

    if (solver.filledCount === 0) {
        const pos1 = solver.firstNumberPositions[solver.firstPosIdx];
        flatBoard[pos1] = 1;
        used[1] = true;
        solver.filledCount = 1;
        return { 
            board: reconstructBoard(flatBoard, size), 
            val: 1, 
            highlight: { r: Math.floor(pos1/size), c: pos1%size, type: 'active' },
            desc: `Optimizing start: Placing 1 at cell ${pos1}.`
        };
    }

    let currentFrame = stack[solver.filledCount];
    if (!currentFrame) {
        const emptyIndices = flatBoard.map((v, i) => v === null ? i : -1).filter(idx => idx !== -1);
        if (emptyIndices.length === 0) return null;

        const candidates = emptyIndices.map(idx => {
            let totalFilled = 0;
            const r_idx = Math.floor(idx / size), c_idx = idx % size;
            const lines = [
                Array.from({length: size}, (_, i) => r_idx * size + i),
                Array.from({length: size}, (_, i) => i * size + c_idx)
            ];
            if (r_idx === c_idx) lines.push(Array.from({length: size}, (_, i) => i * size + i));
            if (r_idx + c_idx === size - 1) lines.push(Array.from({length: size}, (_, i) => i * size + (size - 1 - i)));
            
            lines.forEach(line => {
                totalFilled += line.reduce((acc, i) => acc + (flatBoard[i] !== null ? 1 : 0), 0);
            });
            return { idx, score: totalFilled };
        }).sort((a,b) => b.score - a.score);

        const cellIdx = candidates[0].idx;
        let forcedVal = null;
        const r_idx = Math.floor(cellIdx/size), c_idx = cellIdx % size;
        const lines_c = [
            Array.from({length: size}, (_, i) => r_idx * size + i),
            Array.from({length: size}, (_, i) => i * size + c_idx)
        ];
        if (r_idx === c_idx) lines_c.push(Array.from({length: size}, (_, i) => i * size + i));
        if (r_idx + c_idx === size - 1) lines_c.push(Array.from({length: size}, (_, i) => i * size + (size - 1 - i)));

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
            return tryPlaceEffect(numToTry, currentFrame, solver, size, true);
        }
    } else {
        numToTry = (currentFrame.triedNum === 0 ? 2 : currentFrame.triedNum + 1);
        while (numToTry <= size * size && used[numToTry]) numToTry++;
        currentFrame.triedNum = numToTry;
        if (numToTry <= size * size) {
            return tryPlaceEffect(numToTry, currentFrame, solver, size, false);
        }
    }

    // Backtrack if no number worked
    stack[solver.filledCount] = null;
    solver.filledCount--;
    if (solver.filledCount > 0) {
        const prevFrame = stack[solver.filledCount];
        const prevVal = flatBoard[prevFrame.cellIdx];
        used[prevVal] = false;
        flatBoard[prevFrame.cellIdx] = null;
        return {
            board: reconstructBoard(flatBoard, size),
            highlight: { r: Math.floor(prevFrame.cellIdx/size), c: prevFrame.cellIdx%size, type: 'backtrack' },
            desc: `Backtracking: Removing ${prevVal} and searching alternatives...`
        };
    } else {
        // Root backtrack: Move to next 1 position
        const prev1 = solver.firstNumberPositions[solver.firstPosIdx];
        flatBoard[prev1] = null;
        used[1] = false;
        solver.firstPosIdx++;
        if (solver.firstPosIdx >= solver.firstNumberPositions.length) {
            return { board: reconstructBoard(flatBoard, size), isComplete: true, desc: "No more options." };
        }
        solver.filledCount = 0;
        return solveDynamicStep(solver, size);
    }
}

function tryPlaceEffect(numToTry, currentFrame, solver, size, isForced) {
    const { flatBoard, used } = solver;
    const magicConst = (size * (size * size + 1)) / 2;
    const r = Math.floor(currentFrame.cellIdx/size), c = currentFrame.cellIdx % size;

    if (numToTry >= 1 && numToTry <= size * size && !used[numToTry]) {
        flatBoard[currentFrame.cellIdx] = numToTry;
        used[numToTry] = true;

        let isValid = true;
        const lines_v = [
            Array.from({length: size}, (_, i) => r * size + i),
            Array.from({length: size}, (_, i) => i * size + c)
        ];
        if (r === c) lines_v.push(Array.from({length: size}, (_, i) => i * size + i));
        if (r + c === size - 1) lines_v.push(Array.from({length: size}, (_, i) => i * size + (size - 1 - i)));

        for (let line of lines_v) {
            const vals = line.map(i => flatBoard[i]).filter(v => v !== null);
            const s = vals.reduce((a,b) => a+b, 0);
            if (s > magicConst || (vals.length === size && s !== magicConst)) { isValid = false; break; }
        }

        if (isValid) {
            solver.filledCount++;
            return {
                board: reconstructBoard(flatBoard, size),
                val: numToTry,
                highlight: { r, c, type: isForced ? 'forced' : 'active' },
                desc: isForced ? `Logical inference: Only ${numToTry} is valid here.` : `Trying ${numToTry} at optimal cell (${r}, ${c})...`
            };
        } else {
            flatBoard[currentFrame.cellIdx] = null;
            used[numToTry] = false;
            return {
                board: reconstructBoard(flatBoard, size),
                highlight: { r, c, type: 'backtrack' },
                desc: `Constraint violation: Conflict detected at (${r}, ${c})!`
            };
        }
    }
    return null;
}

function reconstructBoard(flatBoard, size) {
    const board = [];
    for (let i = 0; i < size; i++) board.push(flatBoard.slice(i * size, (i + 1) * size));
    return board;
}
