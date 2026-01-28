import { MagicSquareSwing } from './swing';
// Other imports (simplified for the fix)
import { MagicSquareOdd } from './odd';
import { MagicSquareDoublyEven } from './doubly-even';
import { generateSinglyEvenSteps } from './singly-even';

export function generateMagicSquareSteps(n, algoMode = 'formula') {
  // Case 0: Swing Mode - Support 4x4 and 8x8
  if (algoMode === 'swing' && (n === 4 || n === 8)) {
    return MagicSquareSwing.generateSteps(n);
  }

  // Case 1: Odd Order (3, 5, 7...)
  if (n % 2 !== 0) return MagicSquareOdd.generateSteps(n);
  
  // Case 2: Doubly Even Order (4, 8, 12...)
  if (n % 4 === 0) return MagicSquareDoublyEven.generateSteps(n);

  // Case 3: Singly Even Order (6, 10...)
  return generateSinglyEvenSteps(n);
}
