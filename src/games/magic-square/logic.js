/**
 * Generates an odd-order magic square using the Siamese method.
 * Returns steps for visualization (Optimized Rhythm: 1 Step per Number).
 * @param {number} n - The order of the magic square (must be an odd number).
 * @returns {Array<{board: number[][], current: {r: number, c: number}, val: number, desc: string, type: string}>}
 */
export function generateMagicSquareSteps(n) {
  if (n % 2 === 0) {
    throw new Error("Only odd-order magic squares are supported for now.");
  }

  const steps = [];
  const board = Array.from({ length: n }, () => Array(n).fill(null));
  
  let num = 1;
  let row = 0;
  let col = Math.floor(n / 2);

  // 1. Initial Position (Num 1)
  board[row][col] = num;
  steps.push({
    board: JSON.parse(JSON.stringify(board)),
    val: 1,
    desc: "Top Center",
    ruleId: "1",
    highlight: { r: row, c: col },
    type: 'place_start'
  });

  while (num < n * n) {
    const currRow = row;
    const currCol = col;
    
    num++; // Next number

    // Calculate Siamese target (Up-Right)
    let nextRow = (row - 1 + n) % n;
    let nextCol = (col + 1) % n;
    let desc = "";
    let type = "";

    // Determine Logic & Next Position
    if (board[nextRow][nextCol] !== null) {
        // CASE: Blocked -> Move Down
        row = (row + 1) % n;
        desc = "↓ (bcs blocked)";
        type = "move_collision";
    } else {
        // CASE: Normal Move
        if (currRow === 0 && currCol === n - 1) {
            // Corner Case (Top Right)
            desc = "↓ (bcs blocked)";
            type = "move_corner";
            row = (row + 1) % n;
        } else if (currRow === 0) {
            // Hit Top Wall -> Bottom
            desc = "Bottom → (bcs wall)";
            type = "move_top_wrap";
            row = nextRow;
            col = nextCol;
        } else if (currCol === n - 1) {
            // Hit Right Wall -> Left
            desc = "LeftEdge ↑ (bcs wall)";
            type = "move_right_wrap";
            row = nextRow;
            col = nextCol;
        } else {
            // Normal Diagonal
            desc = "↗";
            type = "move_normal";
            row = nextRow;
            col = nextCol;
        }
    }

    // UPDATE BOARD
    board[row][col] = num;

    steps.push({
        board: JSON.parse(JSON.stringify(board)),
        val: num,
        desc: desc,
        ruleId: num.toString(),
        highlight: { r: row, c: col },
        type: type
    });
  }
  
  // Final Success Step
  steps.push({
    board: JSON.parse(JSON.stringify(board)),
    val: null,
    desc: "Complete!",
    highlight: null,
    type: 'complete'
  });

  return steps;
}

export function generateMagicSquare(n) {
    const steps = generateMagicSquareSteps(n);
    return steps[steps.length - 1].board;
}

export function isValidMagicSquare(board) {
  const n = board.length;
  const magicConstant = (n * (n * n + 1)) / 2;
  for (let r = 0; r < n; r++) if (board[r].reduce((a, b) => a + b, 0) !== magicConstant) return false;
  for (let c = 0; c < n; c++) {
    let colSum = 0;
    for (let r = 0; r < n; r++) colSum += board[r][c];
    if (colSum !== magicConstant) return false;
  }
  let d1 = 0, d2 = 0;
  for (let i = 0; i < n; i++) { d1 += board[i][i]; d2 += board[i][n - 1 - i]; }
  return d1 === magicConstant && d2 === magicConstant;
}
