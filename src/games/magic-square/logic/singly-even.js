import { MagicSquareOdd } from './odd';

export function generateSinglyEvenSteps(n) {
    const half = n / 2;
    const offset = half * half;
    
    // 1. Get steps for the quarter square (odd order)
    const subSteps = MagicSquareOdd.generateSteps(half);
    const subBoard = subSteps[subSteps.length - 1].board; // Final state of sub-square
    
    const board = Array.from({ length: n }, () => Array(n).fill(null));
    const steps = [];
    
    const addStep = (val, r, c, desc, type, highlight) => {
        board[r][c] = val;
        steps.push({
            board: JSON.parse(JSON.stringify(board)),
            val,
            highlight: highlight || { r, c },
            desc,
            type
        });
    };

    // LUX Method / Strachey Method Visualization
    // Quadrants:
    // A (Top-Left)   = Base
    // B (Top-Right)  = Base + 2*Offset
    // C (Bot-Left)   = Base + 3*Offset
    // D (Bot-Right)  = Base + Offset
    
    // Fill all quadrants simultaneously or sequentially? Let's do sequentially for clarity.
    
    // Fill Quadrant A
    for(let r=0; r<half; r++) {
        for(let c=0; c<half; c++) {
            const val = subBoard[r][c];
            addStep(val, r, c, "Quadrant A: Base Magic Square", "place_q1");
        }
    }
    
    // Fill Quadrant B
    for(let r=0; r<half; r++) {
        for(let c=0; c<half; c++) {
            const val = subBoard[r][c] + 2 * offset;
            addStep(val, r, c + half, "Quadrant B: Base + 2*Offset", "place_q2");
        }
    }
    
    // Fill Quadrant C
    for(let r=0; r<half; r++) {
        for(let c=0; c<half; c++) {
            const val = subBoard[r][c] + 3 * offset;
            addStep(val, r + half, c, "Quadrant C: Base + 3*Offset", "place_q3");
        }
    }

    // Fill Quadrant D
    for(let r=0; r<half; r++) {
        for(let c=0; c<half; c++) {
            const val = subBoard[r][c] + offset;
            addStep(val, r + half, c + half, "Quadrant D: Base + Offset", "place_q4");
        }
    }
    
    // Swap adjustments (Strachey Method)
    const k = Math.floor((n - 2) / 4);
    
    const swap = (r1, c1, r2, c2, desc) => {
        const temp = board[r1][c1];
        board[r1][c1] = board[r2][c2];
        board[r2][c2] = temp;
        steps.push({
            board: JSON.parse(JSON.stringify(board)),
            desc: desc || `Swap Left Side (${r1},${c1})`,
            type: "swap",
            highlight: { r: r1, c: c1 }
        });
    };

    // 1. Left Side Swaps (Quadrant A <-> C)
    for (let r = 0; r < half; r++) {
        for (let c = 0; c < k; c++) {
             // Swap A and C at (r,c)
             swap(r, c, r + half, c, "Swapping Left Columns (A <-> C)");
        }
    }
    
    // 2. Middle Row Adjustment for Left Side
    // The cell at (middle_row, 0) needs to be un-swapped? No, actually:
    // Strachey says Swap A and C in first k columns EXCEPT middle row.
    // Instead, in middle row, swap column k?
    // Let's implement the standard specific swap:
    
    // We already swapped cols [0, k-1] for all rows.
    // Now we need to FIX the middle row.
    const mid = Math.floor(half / 2);
    // Swap back (mid, 0) and swap (mid, k) instead?
    // Actually simpler logic:
    // Swap cols 0 to k-1 for all rows EXCEPT mid.
    // For mid row, swap cols 1 to k.
    
    // But since we already swapped 0 to k-1... let's undo/redo.
    // Undo swap at (mid, 0)
    swap(mid, 0, mid + half, 0, "Adjusting Middle Row Left");
    // Do swap at (mid, k)
    swap(mid, k, mid + half, k, "Adjusting Middle Row Center");

    // 3. Right Side Swaps (Quadrant B <-> D)
    // Swap columns from n-k+1 to n
    if (n > 6) {
        // For n=6, k=1. Right columns condition: c > 3 - 1 + 1 (c > 3). No columns (since max c=2 in half).
        // Standard formula: last k-1 columns.
        // For n=6, k=1 -> k-1 = 0 columns. None.
        // For n=10, k=2 -> k-1 = 1 column. Last column.
        
        const rightSwaps = k - 1;
        for (let r = 0; r < half; r++) {
            for (let i = 0; i < rightSwaps; i++) {
                const c = half - 1 - i;
                swap(r, c + half, r + half, c + half, "Swapping Right Columns (B <-> D)");
            }
        }
    }

    steps.push({
        board: JSON.parse(JSON.stringify(board)),
        type: 'complete',
        desc: 'Singly Even Magic Square Complete!'
    });

    return steps;
}
