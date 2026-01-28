export class MagicSquareSwing {
    static generateSteps(n) {
      if (n !== 4) return [];
      
      const board = Array.from({ length: n }, () => Array(n).fill(null));
      const steps = [];
  
      const addStep = (boardState, val, highlight, desc, type) => {
        steps.push({
          board: JSON.parse(JSON.stringify(boardState)),
          val,
          highlight,
          desc,
          type
        });
      };
      
      // 1. Defined ZigZag (Snake) positions in a simple list
      const positions = [
        {r:0, c:0}, {r:0, c:1}, {r:0, c:2}, {r:0, c:3}, // Row 0: Left to Right
        {r:1, c:3}, {r:1, c:2}, {r:1, c:1}, {r:1, c:0}, // Row 1: Right to Left
        {r:2, c:0}, {r:2, c:1}, {r:2, c:2}, {r:2, c:3}, // Row 2: Left to Right
        {r:3, c:3}, {r:3, c:2}, {r:3, c:1}, {r:3, c:0}  // Row 3: Right to Left
      ];

      // 2. Sequentially fill the board based on the list
      for (let i = 0; i < positions.length; i++) {
        const { r, c } = positions[i];
        const val = i + 1;
        board[r][c] = val;
        addStep(board, val, { r, c }, `Fill ${val}`, "setup");
      }
      
      const targets = [
        {r: 0, c: 1}, {r: 1, c: 1}, {r: 2, c: 1}, {r: 3, c: 1},
        {r: 0, c: 2}, {r: 1, c: 2}, {r: 2, c: 2}, {r: 3, c: 2}
      ];

      // 3. Rotation Animation Logic
      addStep(board, null, { targets }, "Rotating...", "swing_rotating");
      
      // 4. Final state calculation
      const finalBoard = JSON.parse(JSON.stringify(board));
      for (const { r, c } of targets) {
          finalBoard[n-1-r][n-1-c] = board[r][c];
      }
      addStep(finalBoard, null, null, "Completed!", "complete");
      
      return steps;
    }
}
