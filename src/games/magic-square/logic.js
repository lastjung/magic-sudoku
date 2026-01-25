/**
 * Generates magic square steps for odd, doubly even, and singly even orders.
 * Supports 3-10.
 */
export function generateMagicSquareSteps(n) {
  const board = Array.from({ length: n }, () => Array(n).fill(null));
  const steps = [];

  const addStep = (val, r, c, desc, type) => {
    board[r][c] = val;
    steps.push({
      board: JSON.parse(JSON.stringify(board)),
      val,
      highlight: { r, c },
      desc,
      type
    });
  };

  // --- 1. Odd Orders (3, 5, 7, 9) : Siamese Method ---
  if (n % 2 !== 0) {
    let row = 0;
    let col = Math.floor(n / 2);
    addStep(1, row, col, "Top Center (Siamese)", "place_start");

    for (let num = 2; num <= n * n; num++) {
      let nextRow = (row - 1 + n) % n;
      let nextCol = (col + 1) % n;

      if (board[nextRow][nextCol] !== null) {
        row = (row + 1) % n;
        addStep(num, row, col, "Blocked -> Down", "move_collision");
      } else {
        row = nextRow;
        col = nextCol;
        addStep(num, row, col, "↗ Diagonal", "move_normal");
      }
    }
  } 
  // --- 2. Doubly Even Orders (4, 8) : Inversion Method ---
  else if (n % 4 === 0) {
    // Fill normally first
    let count = 1;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        let isDiagonal = false;
        // Determine if (r,c) is in a 4x4 sub-grid diagonal
        if ((r % 4 === c % 4) || (r % 4 + c % 4 === 3)) isDiagonal = true;
        
        let val = isDiagonal ? (n * n + 1 - count) : count;
        addStep(val, r, c, isDiagonal ? "Inversion Gap" : "Natural Fill", "place");
        count++;
      }
    }
  } 
  // --- 3. Singly Even Orders (6, 10) : Strachey Method ---
  else {
    const half = n / 2;
    const subSteps = generateMagicSquareSteps(half);
    const subBoard = subSteps[subSteps.length - 2].board; // Get final board of sub-square
    const offset = half * half;

    // A B
    // C D  (A=subBoard, B=subBoard+2*offset, C=subBoard+3*offset, D=subBoard+offset)
    // Fill quadrants
    for (let r = 0; r < half; r++) {
      for (let c = 0; c < half; c++) {
        addStep(subBoard[r][c], r, c, "Q-A (Siamese)", "place");
        addStep(subBoard[r][c] + offset, r + half, c + half, "Q-D (Offset)", "place");
        addStep(subBoard[r][c] + 2 * offset, r, c + half, "Q-B (Offset)", "place");
        addStep(subBoard[r][c] + 3 * offset, r + half, c, "Q-C (Offset)", "place");
      }
    }

    // Swapping to satisfy Magic Constant
    const k = (n - 2) / 4;
    for (let r = 0; r < half; r++) {
      for (let c = 0; c < half; c++) {
        let shouldSwap = false;
        if (c < k) {
            if (r !== Math.floor(half/2)) shouldSwap = true;
        }
        if (c === k && r === Math.floor(half/2)) shouldSwap = true;
        if (c > half - k + 1) shouldSwap = true; // For larger n, not strictly needed for 6

        if (shouldSwap) {
            [board[r][c], board[r + half][c]] = [board[r + half][c], board[r][c]];
            steps.push({
                board: JSON.parse(JSON.stringify(board)),
                desc: "Final Adjustment Swaps",
                type: "swap"
            });
        }
      }
    }
  }

  steps.push({
    board: JSON.parse(JSON.stringify(board)),
    type: 'complete',
    desc: 'Magic Square Balanced!'
  });

  return steps;
}

export function generateMagicSquare(n) {
    const steps = generateMagicSquareSteps(n);
    return steps[steps.length - 1].board;
}

export function isValidMagicSquare(board) {
  const n = board.length;
  if (!n) return false;
  const magicConstant = (n * (n * n + 1)) / 2;
  for (let r = 0; r < n; r++) if (board[r].reduce((a, b) => a + (b||0), 0) !== magicConstant) return false;
  for (let c = 0; c < n; c++) {
    let colSum = 0;
    for (let r = 0; r < n; r++) colSum += (board[r][c]||0);
    if (colSum !== magicConstant) return false;
  }
  let d1 = 0, d2 = 0;
  for (let i = 0; i < n; i++) { d1 += (board[i][i]||0); d2 += (board[i][n - 1 - i]||0); }
  return d1 === magicConstant && d2 === magicConstant;
}

