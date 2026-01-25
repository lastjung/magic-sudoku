// Sudoku Generator and Solver Logic

const BLANK = 0;
const N = 9;

/**
 * Generates a new Sudoku puzzle.
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @returns {{ initial: number[][], solution: number[][] }}
 */
export function generateSudoku(difficulty = 'easy') {
  const board = Array.from({ length: N }, () => Array(N).fill(BLANK));

  // 1. Fill diagonal 3x3 matrices (they are independent)
  fillDiagonal(board);

  // 2. Fill remaining blocks
  solveSudoku(board);
  const solution = board.map(row => [...row]); // Deep copy solution

  // 3. Remove digits to make puzzle
  const attempts = {
    easy: 30,
    medium: 45,
    hard: 55,
  }[difficulty] || 30;

  removeDigits(board, attempts);

  return { initial: board, solution };
}

function fillDiagonal(board) {
  for (let i = 0; i < N; i = i + 3) {
    fillBox(board, i, i);
  }
}

function fillBox(board, row, col) {
  let num;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      do {
        num = Math.floor(Math.random() * N) + 1;
      } while (!isSafeInBox(board, row, col, num));
      board[row + i][col + j] = num;
    }
  }
}

function isSafeInBox(board, rowStart, colStart, num) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[rowStart + i][colStart + j] === num) return false;
    }
  }
  return true;
}

function isSafe(board, row, col, num) {
  // Check row
  for (let x = 0; x < N; x++) {
    if (board[row][x] === num) return false;
  }
  // Check col
  for (let x = 0; x < N; x++) {
    if (board[x][col] === num) return false;
  }
  // Check 3x3 box
  const startRow = row - (row % 3);
  const startCol = col - (col % 3);
  return isSafeInBox(board, startRow, startCol, num);
}

function solveSudoku(board) {
  let row = -1;
  let col = -1;
  let isEmpty = false;

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (board[i][j] === BLANK) {
        row = i;
        col = j;
        isEmpty = true;
        break;
      }
    }
    if (isEmpty) break;
  }

  // No empty space left
  if (!isEmpty) return true;

  for (let num = 1; num <= N; num++) {
    if (isSafe(board, row, col, num)) {
      board[row][col] = num;
      if (solveSudoku(board)) return true;
      board[row][col] = BLANK;
    }
  }
  return false;
}

function removeDigits(board, count) {
  while (count > 0) {
    let cellId = Math.floor(Math.random() * (N * N));
    let i = Math.floor(cellId / N);
    let j = cellId % N;
    if (board[i][j] !== BLANK) {
      board[i][j] = BLANK;
      count--;
    }
  }
}
