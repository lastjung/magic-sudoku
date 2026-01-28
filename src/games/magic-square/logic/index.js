
// Main Entry Point for Magic Square Logic
import { MagicSquareOdd } from './odd';
import { MagicSquareDoublyEven } from './doubly-even';
import { generateSinglyEvenSteps } from './singly-even';
import { MagicSquareSwing } from './swing';

/**
 * Generates step-by-step visualization data for a magic square of order n.
 */
export function generateMagicSquareSteps(n, algoMode = 'formula') {
  // Case 0: Specific "Swing" Mode (Currently 4x4 only)
  if (algoMode === 'swing' && n === 4) {
    return MagicSquareSwing.generateSteps(n);
  }

  // Case 1: Odd Order (3, 5, 7...)
  if (n % 2 !== 0) {
    return MagicSquareOdd.generateSteps(n);
  }
  
  // Case 2: Doubly Even Order (4, 8, 12...) (divisible by 4)
  if (n % 4 === 0) {
    return MagicSquareDoublyEven.generateSteps(n);
  }

  // Case 3: Singly Even Order (6, 10, 14...) (even but not divisible by 4)
  return generateSinglyEvenSteps(n);
}

/**
 * Validates if a given board is a magic square.
 */
export function isValidMagicSquare(board) {
    const n = board.length;
    if (!n) return false;
    const magicConstant = (n * (n * n + 1)) / 2;
    
    // Check Rows
    for (let r = 0; r < n; r++) {
        if (board[r].reduce((a, b) => a + (b||0), 0) !== magicConstant) return false;
    }
    
    // Check Cols
    for (let c = 0; c < n; c++) {
      let colSum = 0;
      for (let r = 0; r < n; r++) colSum += (board[r][c]||0);
      if (colSum !== magicConstant) return false;
    }
    
    // Check Diagonals
    let d1 = 0, d2 = 0;
    for (let i = 0; i < n; i++) { 
        d1 += (board[i][i]||0); 
        d2 += (board[i][n - 1 - i]||0); 
    }
    if (d1 !== magicConstant || d2 !== magicConstant) return false;
    
    // Check Uniqueness (1 to n^2)
    const seen = new Set();
    for(let r=0; r<n; r++) {
        for(let c=0; c<n; c++) {
            const val = board[r][c];
            if (val < 1 || val > n*n || seen.has(val)) return false;
            seen.add(val);
        }
    }
    
    return true;
}

/**
 * Helper to get the final completed board directly.
 */
export function generateMagicSquare(n) {
    const steps = generateMagicSquareSteps(n);
    return steps[steps.length - 1].board;
}
