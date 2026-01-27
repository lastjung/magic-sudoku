// Sudoku Generator and Solver Logic

const BLANK = 0;

/**
 * Generates a new Sudoku puzzle.
 * @param {string} difficulty - 'easy', 'medium', 'hard'
 * @param {number} size - 4 or 9
 * @returns {{ initial: number[][], solution: number[][], size: number }}
 */
export function generateSudoku(difficulty = 'easy', size = 9) {
  const boxSize = Math.sqrt(size);
  let board;
  let success = false;
  let attempts_gen = 0;

  // Retry logic for robust generation
  while (!success && attempts_gen < 10) {
    board = Array.from({ length: size }, () => Array(size).fill(BLANK));
    fillDiagonal(board, size, boxSize);
    if (solveSudoku(board, size, boxSize)) {
      success = true;
    }
    attempts_gen++;
  }

  // Fallback board if something went wrong
  if (!success) {
    board = Array.from({ length: size }, () => Array.from({ length: size }, (_, i) => ((i % size) + 1)));
  }

  const solution = board.map(row => [...row]);

  let removeCount;
  if (size === 9) {
    removeCount = { easy: 30, medium: 45, hard: 55 }[difficulty] || 30;
  } else {
    removeCount = { easy: 4, medium: 8, hard: 10 }[difficulty] || 4;
  }

  removeDigits(board, removeCount, size);

  return { initial: board, solution, size };
}

function fillDiagonal(board, size, boxSize) {
  for (let i = 0; i < size; i = i + boxSize) {
    fillBox(board, i, i, size, boxSize);
  }
}

function fillBox(board, row, col, size, boxSize) {
  let num;
  for (let i = 0; i < boxSize; i++) {
    for (let j = 0; j < boxSize; j++) {
      do {
        num = Math.floor(Math.random() * size) + 1;
      } while (!isSafeInBox(board, row, col, num, boxSize));
      board[row + i][col + j] = num;
    }
  }
}

function isSafeInBox(board, rowStart, colStart, num, boxSize) {
  for (let i = 0; i < boxSize; i++) {
    for (let j = 0; j < boxSize; j++) {
      if (board[rowStart + i][colStart + j] === num) return false;
    }
  }
  return true;
}

function isSafe(board, row, col, num, size, boxSize) {
  // Check row
  for (let x = 0; x < size; x++) {
    if (board[row][x] === num) return false;
  }
  // Check col
  for (let x = 0; x < size; x++) {
    if (board[x][col] === num) return false;
  }
  // Check box
  const startRow = row - (row % boxSize);
  const startCol = col - (col % boxSize);
  return isSafeInBox(board, startRow, startCol, num, boxSize);
}

function solveSudoku(board, size, boxSize) {
  let row = -1;
  let col = -1;
  let isEmpty = false;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
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

  for (let num = 1; num <= size; num++) {
    if (isSafe(board, row, col, num, size, boxSize)) {
      board[row][col] = num;
      if (solveSudoku(board, size, boxSize)) return true;
      board[row][col] = BLANK;
    }
  }
  return false;
}



/* Helper to get valid numbers for a cell */
function getCandidates(board, r, c, size, boxSize) {
    const candidates = [];
    for (let num = 1; num <= size; num++) {
        if (isSafe(board, r, c, num, size, boxSize)) {
            candidates.push(num);
        }
    }
    return candidates;
}

/**
 * Generator function for step-by-step backtracking visualization.
 * Supports: 'backtrack' (Basic), 'naked' (Naked Single), 'dynamic' (MRV Heuristic)
 */
export function* generateSudokuSteps(initialBoard, size = 9, algos = new Set(['backtrack'])) {
    const boxSize = Math.sqrt(size);
    // Deep copy
    const board = initialBoard.map(row => [...row]);
    
    yield* solveSteps(board, size, boxSize, algos);
}

function* solveSteps(board, size, boxSize, algos) {
    const nakedChanges = [];

    // 1. Propagation Phase (Naked Singles)
    // Only run if 'naked' or 'dynamic' (CSP usually implies propagation) is selected
    if (algos.has('naked')) {
        let improved = true;
        while (improved) {
            improved = false;
            let bestCell = null;
            
            // Scan for single candidates
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (board[i][j] === BLANK) {
                        const candidates = getCandidates(board, i, j, size, boxSize);
                        if (candidates.length === 0) {
                            // Contradiction: Revert local changes and return false
                            for (const {r, c} of nakedChanges) board[r][c] = BLANK;
                            return false; 
                        }
                        if (candidates.length === 1) {
                            // Found a naked single!
                            const val = candidates[0];
                            board[i][j] = val;
                            nakedChanges.push({r: i, c: j});
                            improved = true;
                            
                            yield { 
                                type: 'try', // Or 'propagate' if we want distinct styling later
                                r: i, 
                                c: j, 
                                val: val, 
                                board: board.map(r => [...r]),
                                method: 'naked'
                            };
                        }
                    }
                }
            }
        }
    }

    // 2. Cell Selection (Heuristic vs Linear)
    let row = -1;
    let col = -1;
    let candidates = [];
    
    if (algos.has('dynamic')) {
        // Minimum Remaining Values (MRV) Heuristic
        let minCandidates = size + 1;
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === BLANK) {
                    const cands = getCandidates(board, i, j, size, boxSize);
                    if (cands.length === 0) {
                        for (const {r, c} of nakedChanges) board[r][c] = BLANK;
                        return false; // Dead end check
                    }
                    
                    if (cands.length < minCandidates) {
                        minCandidates = cands.length;
                        row = i;
                        col = j;
                        candidates = cands;
                    }
                }
            }
        }
    } else {
        // Standard First Empty
        let found = false;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === BLANK) {
                    row = i;
                    col = j;
                    candidates = getCandidates(board, i, j, size, boxSize); // Get candidates for validity
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }

    // Base Case: No empty cells left
    if (row === -1) {
        return true;
    }

    // 3. Recursive Backtracking
    // If we have 'dynamic', candidates are already pre-calculated and optimal.
    // Otherwise we iterate 1..size (but getCandidates filters checking isSafe again, which is redundant but safe)
    
    // For standard backtracking, we often just loop 1..size. But using candidates list is cleaner for both.
    
    for (const num of candidates) {
        board[row][col] = num;
        
        yield { 
            type: 'try', 
            r: row, 
            c: col, 
            val: num, 
            board: board.map(r => [...r]),
            method: 'backtrack'
        };

        if (yield* solveSteps(board, size, boxSize, algos)) {
            return true;
        }

        // Backtrack
        board[row][col] = BLANK;
        yield { 
            type: 'backtrack', 
            r: row, 
            c: col, 
            val: 0, 
            board: board.map(r => [...r]) 
        };
    }

    // Failure: Revert Naked Singles
    for (const {r, c} of nakedChanges) {
        board[r][c] = BLANK;
    }

    return false;
}

function removeDigits(board, count, size) {
  let attempts = count * 2; // Safety margin
  let removed = 0;
  
  while (removed < count && attempts > 0) {
    let cellId = Math.floor(Math.random() * (size * size));
    let i = Math.floor(cellId / size);
    let j = cellId % size;
    
    if (board[i][j] !== BLANK) {
      board[i][j] = BLANK;
      removed++;
    }
    attempts--;
  }
}

