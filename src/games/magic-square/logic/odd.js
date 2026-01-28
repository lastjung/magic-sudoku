export class MagicSquareOdd {
  static generateSteps(n) {
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

    let row = 0;
    let col = Math.floor(n / 2);
    addStep(1, row, col, "Start: Top Center (Siamese Method)", "place_start");

    for (let num = 2; num <= n * n; num++) {
      let nextRow = (row - 1 + n) % n;
      let nextCol = (col + 1) % n;

      if (board[nextRow][nextCol] !== null) {
        row = (row + 1) % n;
        addStep(num, row, col, `Collision at (${nextRow},${nextCol}) -> Move Down`, "move_collision");
      } else {
        row = nextRow;
        col = nextCol;
        addStep(num, row, col, "Move Diagonally Up-Right ↗", "move_normal");
      }
    }

    if (steps.length > 0) {
      steps[steps.length - 1].type = 'complete';
      steps[steps.length - 1].desc = 'Magic Square Complete!';
    }

    return steps;
  }
}
