export class MagicSquareSwing {
    // Exact logic for Snake (ZigZag) placement
    static getZigZagPositions(n) {
        const pos = [];
        for (let r = 0; r < n; r++) {
            if (r % 2 === 0) {
                // Left -> Right
                for (let c = 0; c < n; c++) pos.push({r, c});
            } else {
                // Right -> Left
                for (let c = n - 1; c >= 0; c--) pos.push({r, c});
            }
        }
        return pos;
    }

    static generateSteps(n) {
      if (n !== 4 && n !== 8) return [];
      
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
      
      // Starting point: Ready
      addStep(board, null, null, "Ready to Fill", "setup");

      // 1. Fill step-by-step using FOR LOOP and POSITION LIST
      const positions = this.getZigZagPositions(n);
      for (let i = 0; i < positions.length; i++) {
        const { r, c } = positions[i];
        board[r][c] = i + 1;
        addStep(board, i + 1, { r, c }, "ZigZag Filling", "setup");
      }
      
      // 2. Target Columns
      const targetCols = n === 4 ? [1, 2] : [1, 2, 5, 6];
      const targets = [];
      for (let r = 0; r < n; r++) {
          for (let c of targetCols) targets.push({r, c});
      }

      // 3. Highlight and Rotate
      addStep(board, null, { targets }, "Select Swing Cells", "highlight_targets");
      addStep(board, null, { targets }, "Swing!", "swing_rotating");
      
      // 4. Result
      const finalBoard = JSON.parse(JSON.stringify(board));
      for (const { r, c } of targets) {
          finalBoard[n-1-r][n-1-c] = board[r][c];
      }
      addStep(finalBoard, null, null, "That's it", "complete");
      
      return steps;
    }
}
